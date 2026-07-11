using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.DTOs;
using ReactApp1.Server.DTOs.Admin;
using ReactApp1.Server.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class AdminService
{
    private readonly StudentdbContext _context;

    public AdminService(StudentdbContext context)
    {
        _context = context;
    }

    // ================= USER MANAGEMENT =================
    public async Task<List<UserDto>> GetUsers()
    {
        return await _context.Users
            .Select(u => new UserDto
            {
                UserId = u.UserId,
                Name = u.Name,
                Email = u.Email,
                Role = u.Role,
                Status = (bool)u.Status
            })
            .ToListAsync();
    }

    public async Task<bool> ToggleUserStatus(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;

        user.Status = !user.Status;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateUserRole(int userId, string role)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;

        user.Role = role;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Hard-deletes a user and ALL dependent records in a single SQL Server transaction.
    /// Returns (success: true, error: null) on success, or (false, errorMessage) on failure.
    /// </summary>
    public async Task<(bool Success, string? Error)> DeleteUser(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return (false, "User not found.");

        // Parameterised so userId is never string-interpolated into SQL
        var param = new SqlParameter("@userId", userId);

        var sql = @"
            BEGIN TRY
                BEGIN TRANSACTION;

                DECLARE @studentId INT = (SELECT TOP 1 student_id FROM Students WHERE user_id = @userId);
                DECLARE @mentorId  INT = (SELECT TOP 1 mentor_id  FROM Mentors  WHERE user_id = @userId);

                -- ── Student-linked tables (deepest FK first) ──────────────────────────
                IF @studentId IS NOT NULL
                BEGIN
                    -- ExamAnswers → ExamSubmissions (cascade exists, but be explicit)
                    DELETE FROM ExamAnswers
                        WHERE submission_id IN (
                            SELECT submission_id FROM ExamSubmissions WHERE student_id = @studentId
                        );
                    DELETE FROM ExamSubmissions        WHERE student_id = @studentId;
                    DELETE FROM ExamAssignments        WHERE student_id = @studentId;
                    DELETE FROM Assignment_Submissions WHERE student_id = @studentId;
                    DELETE FROM Daily_Reflection       WHERE student_id = @studentId;
                    DELETE FROM Feedback               WHERE student_id = @studentId;
                    DELETE FROM Student_Mentor_Feedback WHERE student_id = @studentId;
                    DELETE FROM Mentor_Requests        WHERE student_id = @studentId;
                    DELETE FROM Mentor_Sessions        WHERE student_id = @studentId;
                    DELETE FROM Mentor_Student         WHERE student_id = @studentId;
                    DELETE FROM Student_Goals          WHERE student_id = @studentId;
                    DELETE FROM QA_Messages            WHERE student_id = @studentId;
                    DELETE FROM Students               WHERE student_id = @studentId;
                END

                -- ── Mentor-linked tables ──────────────────────────────────────────────
                IF @mentorId IS NOT NULL
                BEGIN
                    -- Exam answers/submissions for students in mentor's exams
                    DELETE FROM ExamAnswers
                        WHERE submission_id IN (
                            SELECT es.submission_id FROM ExamSubmissions es
                            JOIN ExamAssignments ea ON ea.assignment_id = es.assignment_id
                            WHERE ea.assigned_by = @mentorId
                        );
                    DELETE FROM ExamSubmissions
                        WHERE assignment_id IN (
                            SELECT assignment_id FROM ExamAssignments WHERE assigned_by = @mentorId
                        );
                    DELETE FROM ExamAssignments        WHERE assigned_by = @mentorId;

                    DELETE FROM Assignment_Submissions
                        WHERE assignment_id IN (
                            SELECT assignment_id FROM Assignments WHERE mentor_id = @mentorId
                        );
                    DELETE FROM Assignments            WHERE mentor_id = @mentorId;
                    DELETE FROM Mentor_Availability    WHERE mentor_id = @mentorId;
                    DELETE FROM Mentor_Performance     WHERE mentor_id = @mentorId;
                    DELETE FROM Mentor_Requests        WHERE mentor_id = @mentorId;
                    DELETE FROM Mentor_Sessions        WHERE mentor_id = @mentorId;
                    DELETE FROM Mentor_Skills          WHERE mentor_id = @mentorId;
                    DELETE FROM Mentor_Student         WHERE mentor_id = @mentorId;
                    DELETE FROM Feedback               WHERE mentor_id = @mentorId;
                    DELETE FROM Student_Mentor_Feedback WHERE mentor_id = @mentorId;
                    DELETE FROM QA_Messages            WHERE mentor_id = @mentorId;

                    -- Null out Announcements FK references (admin may have created them)
                    UPDATE Announcements SET admin_id    = NULL WHERE admin_id    = @userId;
                    UPDATE Announcements SET created_by  = NULL WHERE created_by  = @userId;
                    UPDATE Announcements SET modified_by = NULL WHERE modified_by = @userId;

                    -- Exams created by this mentor
                    DELETE FROM ExamQuestions
                        WHERE exam_id IN (SELECT exam_id FROM Exams WHERE created_by = @mentorId);
                    DELETE FROM Exams                  WHERE created_by = @mentorId;

                    DELETE FROM Mentors                WHERE mentor_id = @mentorId;
                END

                -- ── User-level tables ─────────────────────────────────────────────────
                DELETE FROM Notifications      WHERE user_id = @userId;
                DELETE FROM Tasks             WHERE user_id = @userId;
                DELETE FROM Performance_Report WHERE user_id = @userId;
                DELETE FROM Analytics_Daily    WHERE user_id = @userId;
                DELETE FROM Calendar_Events    WHERE user_id = @userId;
                DELETE FROM Materials          WHERE user_id = @userId;
                DELETE FROM Notes             WHERE user_id = @userId;
                DELETE FROM Study_Sessions     WHERE user_id = @userId;

                -- Null out any remaining created_by / modified_by references on misc tables
                UPDATE Assignments    SET created_by  = NULL WHERE created_by  = @userId;
                UPDATE Assignments    SET modified_by = NULL WHERE modified_by = @userId;
                UPDATE Calendar_Events SET created_by = NULL WHERE created_by  = @userId;
                UPDATE Calendar_Events SET modified_by= NULL WHERE modified_by = @userId;
                UPDATE Materials      SET created_by  = NULL WHERE created_by  = @userId;
                UPDATE Materials      SET modified_by = NULL WHERE modified_by = @userId;
                UPDATE Tasks          SET created_by  = NULL WHERE created_by  = @userId;
                UPDATE Tasks          SET modified_by = NULL WHERE modified_by = @userId;
                UPDATE Feedback       SET created_by  = NULL WHERE created_by  = @userId;
                UPDATE Feedback       SET modified_by = NULL WHERE modified_by = @userId;
                UPDATE Mentor_Availability SET created_by = NULL WHERE created_by = @userId;
                UPDATE Mentor_Availability SET modified_by= NULL WHERE modified_by = @userId;
                UPDATE Mentor_Requests SET created_by = NULL WHERE created_by = @userId;
                UPDATE Mentor_Requests SET modified_by= NULL WHERE modified_by = @userId;
                UPDATE Mentor_Sessions SET created_by = NULL WHERE created_by = @userId;
                UPDATE Mentor_Sessions SET modified_by= NULL WHERE modified_by = @userId;
                UPDATE Mentor_Skills   SET created_by = NULL WHERE created_by = @userId;
                UPDATE Mentor_Skills   SET modified_by= NULL WHERE modified_by = @userId;
                UPDATE Mentor_Student  SET created_by = NULL WHERE created_by = @userId;
                UPDATE Mentor_Student  SET modified_by= NULL WHERE modified_by = @userId;
                UPDATE Student_Goals   SET created_by = NULL WHERE created_by = @userId;
                UPDATE Student_Goals   SET modified_by= NULL WHERE modified_by = @userId;
                UPDATE Students        SET created_by = NULL WHERE created_by = @userId;
                UPDATE Students        SET modified_by= NULL WHERE modified_by = @userId;
                UPDATE Mentors         SET created_by = NULL WHERE created_by = @userId;
                UPDATE Mentors         SET modified_by= NULL WHERE modified_by = @userId;

                -- Finally delete the user record
                DELETE FROM Users WHERE user_id = @userId;

                COMMIT TRANSACTION;
            END TRY
            BEGIN CATCH
                IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
                -- Re-throw so EF surfaces the original SQL error
                THROW;
            END CATCH
        ";

        try
        {
            await _context.Database.ExecuteSqlRawAsync(sql, param);
            return (true, null);
        }
        catch (Exception ex)
        {
            // Unwrap to innermost message for a clean API response
            var root = ex;
            while (root.InnerException != null) root = root.InnerException;
            return (false, $"Delete failed: {root.Message}");
        }
    }

    /// <summary>
    /// Soft-delete: sets Users.status = false instead of removing the row.
    /// This is the safest option when FK constraints are complex.
    /// </summary>
    public async Task<(bool Success, string? Error)> SoftDeleteUser(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return (false, "User not found.");

        user.Status = false;
        user.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
            return (true, null);
        }
        catch (Exception ex)
        {
            var root = ex;
            while (root.InnerException != null) root = root.InnerException;
            return (false, $"Soft-delete failed: {root.Message}");
        }
    }

    // ================= MENTOR MANAGEMENT =================
    public async Task<List<MentorAdminDto>> GetMentors()
    {
        return await _context.Mentors
            .Include(m => m.User)
            .Select(m => new MentorAdminDto
            {
                MentorId = m.MentorId,
                UserId = m.UserId,
                Name = m.User.Name,
                Email = m.User.Email,
                Department = m.Department ?? "N/A",
                TotalStudents = _context.MentorStudents.Count(ms => ms.MentorId == m.MentorId),
                AvgRating = _context.StudentMentorFeedbacks.Where(f => f.MentorId == m.MentorId).Average(f => (decimal?)f.Rating) ?? 0,
                Status = m.User.Status ?? false
            })
            .ToListAsync();
    }

    public async Task<bool> SuspendMentor(int mentorId)
    {
        var mentor = await _context.Mentors.Include(m => m.User).FirstOrDefaultAsync(m => m.MentorId == mentorId);
        if (mentor == null || mentor.User == null) return false;

        mentor.User.Status = false;
        mentor.User.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    // ================= STUDENT ANALYTICS =================
    public async Task<List<StudentAdminDto>> GetStudents()
    {
        return await _context.Students
            .Include(s => s.User)
            .Select(s => new StudentAdminDto
            {
                StudentId = s.StudentId,
                UserId = s.UserId ?? 0,
                Name = s.User.Name,
                Email = s.User.Email,
                Course = s.Course ?? "N/A",
                StudyMinutes = _context.AnalyticsDailies.Where(a => a.UserId == s.UserId).Sum(a => (int?)a.StudyMinutes) ?? 0,
                ProductivityScore = _context.PerformanceReports.Where(p => p.UserId == s.UserId).Average(p => (decimal?)p.ProductivityScore) ?? 0,
                Status = s.User.Status ?? false
            })
            .ToListAsync();
    }

    // ================= REQUEST MANAGEMENT =================
    public async Task<List<RequestAdminDto>> GetRequests()
    {
        return await _context.MentorRequests
            .Include(r => r.Student).ThenInclude(s => s.User)
            .Include(r => r.Mentor).ThenInclude(m => m.User)
            .Select(r => new RequestAdminDto
            {
                RequestId = r.RequestId,
                StudentName = r.Student.User.Name,
                MentorName = r.Mentor.User.Name,
                Status = r.RequestStatus ?? "Pending",
                RequestedAt = r.RequestedAt ?? DateTime.UtcNow
            })
            .ToListAsync();
    }

    public async Task<bool> ApproveRequest(int requestId)
    {
        var request = await _context.MentorRequests.FindAsync(requestId);
        if (request == null) return false;

        request.RequestStatus = "Approved";

        // Check if Mentor_Student already exists
        var exists = await _context.MentorStudents
            .AnyAsync(ms => ms.StudentId == request.StudentId && ms.MentorId == request.MentorId);

        if (!exists)
        {
            _context.MentorStudents.Add(new MentorStudent
            {
                StudentId = request.StudentId,
                MentorId = request.MentorId,
                AssignedAt = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RejectRequest(int requestId)
    {
        var request = await _context.MentorRequests.FindAsync(requestId);
        if (request == null) return false;

        request.RequestStatus = "Rejected";
        await _context.SaveChangesAsync();
        return true;
    }

    // ================= SESSION CONTROL =================
    public async Task<List<SessionAdminDto>> GetSessions()
    {
        return await _context.MentorSessions
            .Include(s => s.Mentor).ThenInclude(m => m.User)
            .Include(s => s.Student).ThenInclude(st => st.User)
            .Select(s => new SessionAdminDto
            {
                SessionId = s.SessionId,
                Title = s.Title ?? "Session",
                MentorName = s.Mentor.User.Name,
                StudentName = s.Student.User.Name,
                SessionDate = s.SessionDate ?? "",
                StartTime = s.StartTime ?? "",
                Status = s.SessionStatus ?? ""
            })
            .ToListAsync();
    }

    public async Task<bool> CancelSession(int sessionId)
    {
        var session = await _context.MentorSessions.FindAsync(sessionId);
        if (session == null) return false;

        session.SessionStatus = "Cancelled";
        await _context.SaveChangesAsync();
        return true;
    }

    // ================= ASSIGNMENT CONTROL =================
    public async Task<List<AssignmentAdminDto>> GetAssignments()
    {
        return await _context.Assignments
            .Include(a => a.Mentor).ThenInclude(m => m.User)
            .Select(a => new AssignmentAdminDto
            {
                AssignmentId = a.AssignmentId,
                Title = a.Title ?? "Assignment",
                MentorName = a.Mentor.User.Name,
                DueDate = a.DueDate,
                SubmissionsCount = _context.AssignmentSubmissions.Count(s => s.AssignmentId == a.AssignmentId)
            })
            .ToListAsync();
    }

    public async Task<List<SubmissionAdminDto>> GetSubmissions()
    {
        return await _context.AssignmentSubmissions
            .Include(s => s.Assignment)
            .Include(s => s.Student).ThenInclude(st => st.User)
            .Select(s => new SubmissionAdminDto
            {
                SubmissionId = s.SubmissionId,
                AssignmentTitle = s.Assignment.Title ?? "Assignment",
                StudentName = s.Student.User.Name,
                SubmittedAt = s.SubmittedAt
            })
            .ToListAsync();
    }

    // ================= ANALYTICS DASHBOARD =================
    public async Task<DashboardStatsDto> GetDashboardStats()
    {
        var activeUsers = await _context.Users.CountAsync(u => u.Status == true);
        var totalMentors = await _context.Mentors.CountAsync();
        var totalStudents = await _context.Students.CountAsync();
        var totalSessions = await _context.MentorSessions.CountAsync();
        var avgRating = await _context.StudentMentorFeedbacks.AnyAsync() 
                      ? await _context.StudentMentorFeedbacks.AverageAsync(f => (decimal?)f.Rating) ?? 0 
                      : 0;

        return new DashboardStatsDto
        {
            TotalUsers = await _context.Users.CountAsync(),
            ActiveUsers = activeUsers,
            TotalMentors = totalMentors,
            TotalStudents = totalStudents,
            TotalSessions = totalSessions,
            AvgSystemRating = Math.Round(avgRating, 1)
        };
    }

    // ================= ANNOUNCEMENTS =================
    public async Task<bool> CreateAnnouncement(int adminUserId, string message)
    {
        var announcement = new Announcement
        {
            Message = message,
            AdminId = adminUserId,
            CreatedAt = DateTime.UtcNow
        };
        _context.Announcements.Add(announcement);

        // Notify all active users
        var userIds = await _context.Users.Where(u => u.Status == true).Select(u => u.UserId).ToListAsync();
        
        var notifications = userIds.Select(id => new Notification
        {
            UserId = id,
            Message = "GLOBAL ANNOUNCEMENT: " + message,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        });

        _context.Notifications.AddRange(notifications);
        await _context.SaveChangesAsync();

        return true;
    }

    // ================= MENTOR-STUDENT EXTENSION =================
    public async Task<List<MentorStudentAdminDto>> GetAllMentorStudents()
    {
        return await _context.MentorStudents
            .Include(ms => ms.Mentor).ThenInclude(m => m.User)
            .Include(ms => ms.Student).ThenInclude(s => s.User)
            .Select(ms => new MentorStudentAdminDto
            {
                Id = ms.Id,
                MentorId = ms.MentorId,
                MentorName = ms.Mentor.User.Name,
                StudentId = ms.StudentId,
                StudentName = ms.Student.User.Name,
                AssignedAt = ms.AssignedAt
            }).ToListAsync();
    }

    public async Task<bool> AssignMentorStudent(MentorStudentCreateDto dto)
    {
        var exists = await _context.MentorStudents.AnyAsync(ms => ms.MentorId == dto.MentorId && ms.StudentId == dto.StudentId);
        if (exists) return false;

        _context.MentorStudents.Add(new MentorStudent
        {
            MentorId = dto.MentorId,
            StudentId = dto.StudentId,
            AssignedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveMentorStudent(int id)
    {
        var ms = await _context.MentorStudents.FindAsync(id);
        if (ms == null) return false;

        _context.MentorStudents.Remove(ms);
        await _context.SaveChangesAsync();
        return true;
    }

    // ================= ASSIGNMENT VALIDATION =================
    public async Task<List<MissingSubmissionAdminDto>> GetMissingSubmissions()
    {
        // Students who are assigned to a mentor, the mentor created an assignment, but student didn't submit
        var query = from ms in _context.MentorStudents
                    join a in _context.Assignments on ms.MentorId equals a.MentorId
                    join sub in _context.AssignmentSubmissions
                         on new { a.AssignmentId, ms.StudentId } equals new { sub.AssignmentId, sub.StudentId } into subs
                    from sub in subs.DefaultIfEmpty()
                    where sub == null
                    select new MissingSubmissionAdminDto
                    {
                        StudentId = ms.StudentId,
                        StudentName = ms.Student.User.Name,
                        AssignmentId = a.AssignmentId,
                        AssignmentTitle = a.Title ?? "Untitled",
                        MentorId = ms.MentorId,
                        MentorName = ms.Mentor.User.Name
                    };
        return await query.ToListAsync();
    }

    public async Task<List<InvalidSubmissionAdminDto>> GetInvalidSubmissions()
    {
        return await _context.AssignmentSubmissions
            .Include(s => s.Student).ThenInclude(st => st.User)
            .Include(s => s.Assignment)
            .Where(s => string.IsNullOrEmpty(s.FilePath))
            .Select(s => new InvalidSubmissionAdminDto
            {
                SubmissionId = s.SubmissionId,
                StudentId = s.StudentId,
                StudentName = s.Student.User.Name,
                AssignmentId = s.AssignmentId,
                AssignmentTitle = s.Assignment.Title ?? "Untitled",
                FilePath = s.FilePath
            }).ToListAsync();
    }

    // ================= DATA FIX =================
    public async Task<bool> FixGoalStatus(GoalFixDto dto)
    {
        var goal = await _context.StudentGoals.FindAsync(dto.GoalId);
        if (goal == null) return false;
        
        goal.GoalStatus = dto.Status;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RecalculateProductivity()
    {
        // Recalculate simulation based on existing tasks
        var reports = await _context.PerformanceReports.ToListAsync();
        foreach (var r in reports)
        {
            var totalTasks = await _context.Tasks.CountAsync(t => t.UserId == r.UserId);
            var completedTasks = await _context.Tasks.CountAsync(t => t.UserId == r.UserId && t.Status == "Completed");
            
            if (totalTasks > 0)
            {
                r.ProductivityScore = (decimal)completedTasks / totalTasks * 100;
            }
        }
        await _context.SaveChangesAsync();
        return true;
    }

    // ================= SESSION EXTENSIONS =================
    public async Task<List<SessionConflictAdminDto>> GetSessionConflicts()
    {
        var allSessions = await _context.MentorSessions
            .Include(s => s.Mentor).ThenInclude(m => m.User)
            .Where(s => s.SessionStatus != "Cancelled")
            .ToListAsync();

        var conflicts = new List<SessionConflictAdminDto>();

        // Naive double loop to find matching Mentor, Date, Time but different Session ID
        for (int i = 0; i < allSessions.Count; i++)
        {
            for (int j = i + 1; j < allSessions.Count; j++)
            {
                var s1 = allSessions[i];
                var s2 = allSessions[j];
                
                if (s1.MentorId == s2.MentorId && s1.SessionDate == s2.SessionDate && s1.StartTime == s2.StartTime)
                {
                    conflicts.Add(new SessionConflictAdminDto
                    {
                        SessionId1 = s1.SessionId,
                        SessionId2 = s2.SessionId,
                        MentorId = s1.MentorId,
                        MentorName = s1.Mentor.User.Name,
                        SessionDate = s1.SessionDate ?? "",
                        StartTime1 = s1.StartTime ?? "",
                        StartTime2 = s2.StartTime ?? ""
                    });
                }
            }
        }
        return conflicts;
    }

    // ================= CHAT MONITORING =================
    public async Task<List<ChatMessageAdminDto>> GetAllChats()
    {
        return await _context.QAMessages
            .Include(q => q.Mentor).ThenInclude(m => m.User)
            .Include(q => q.Student).ThenInclude(s => s.User)
            .OrderByDescending(q => q.SentAt)
            .Select(q => new ChatMessageAdminDto
            {
                MessageId = q.Id,
                SenderId = q.SenderType == "Mentor" ? q.Mentor.UserId : q.Student.UserId ?? 0,
                SenderName = q.SenderType == "Mentor" ? q.Mentor.User.Name : q.Student.User.Name,
                ReceiverId = q.SenderType == "Mentor" ? q.Student.UserId ?? 0 : q.Mentor.UserId,
                ReceiverName = q.SenderType == "Mentor" ? q.Student.User.Name : q.Mentor.User.Name,
                MessageText = q.MessageText,
                SentAt = q.SentAt
            }).ToListAsync();
    }

    // ================= SKILL MANAGEMENT =================
    public async Task<List<SkillAdminDto>> GetSkills()
    {
        return await _context.SubjectsSkills
            .Select(s => new SkillAdminDto { SkillId = s.SkillId, SkillName = s.SkillName })
            .ToListAsync();
    }

    public async Task<bool> CreateSkill(SkillCreateUpdateDto dto)
    {
        _context.SubjectsSkills.Add(new SubjectsSkill { SkillName = dto.SkillName, SkillType = "Skill", IsActive = true });
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateSkill(int id, SkillCreateUpdateDto dto)
    {
        var skill = await _context.SubjectsSkills.FindAsync(id);
        if (skill == null) return false;
        skill.SkillName = dto.SkillName;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteSkill(int id)
    {
        var skill = await _context.SubjectsSkills.FindAsync(id);
        if (skill == null) return false;
        _context.SubjectsSkills.Remove(skill);
        await _context.SaveChangesAsync();
        return true;
    }

    // ================= NOTIFICATION CONTROL =================
    public async Task<List<NotificationAdminDto>> GetAllNotifications()
    {
        return await _context.Notifications
            .Include(n => n.User)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new NotificationAdminDto
            {
                NotifyId = n.NotifyId,
                UserId = n.UserId,
                UserName = n.User.Name,
                Message = n.Message ?? "",
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt
            }).ToListAsync();
    }

    public async Task<bool> ResendNotification(int notifyId)
    {
        var n = await _context.Notifications.FindAsync(notifyId);
        if (n == null) return false;
        
        _context.Notifications.Add(new Notification
        {
            UserId = n.UserId,
            Message = n.Message,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();
        return true;
    }
}