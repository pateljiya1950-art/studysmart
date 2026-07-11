using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;
using ReactApp1.Server.DTOs.Mentor;
using System.Security.Claims;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/mentor")]
    [Authorize(Roles = "mentor")]
    public class MentorGuidanceController : ControllerBase
    {
        private readonly StudentdbContext _context;

        public MentorGuidanceController(StudentdbContext context)
        {
            _context = context;
        }

        private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        private async Task<Mentor?> GetCurrentMentorAsync()
        {
            return await _context.Mentors.FirstOrDefaultAsync(m => m.UserId == UserId);
        }

        [HttpGet("student/{id}/performance")]
        public async Task<IActionResult> GetStudentPerformance(int id) // id is StudentId
        {
            var mentor = await GetCurrentMentorAsync();
            if (mentor == null) return NotFound("Mentor not found");

            // Verify mentor is assigned to this student
            var isAssigned = await _context.MentorStudents.AnyAsync(ms => ms.MentorId == mentor.MentorId && ms.StudentId == id);
            if (!isAssigned) return Forbid("Not assigned to this student");

            var student = await _context.Students.Include(s => s.User).FirstOrDefaultAsync(s => s.StudentId == id);
            if (student == null || student.UserId == null) return NotFound("Student not found");

            var userId = student.UserId.Value;

            var productivityScore = await _context.PerformanceReports
                .Where(pr => pr.UserId == userId)
                .OrderByDescending(pr => pr.ReportDate)
                .Select(pr => (decimal?)pr.ProductivityScore)
                .FirstOrDefaultAsync() ?? 0;

            var completedTasks = await _context.Tasks.CountAsync(t => t.UserId == userId && t.Status == "Completed");
            var pendingTasks = await _context.Tasks.CountAsync(t => t.UserId == userId && t.Status == "Pending");

            var recentSessions = await _context.StudySessions
                .Where(ss => ss.UserId == userId)
                .OrderByDescending(ss => ss.SessionDate)
                .Take(5)
                .Select(ss => new { ss.SessionDate, ss.Subject, ss.DurationMin })
                .ToListAsync();

            var recentSubmissions = await _context.AssignmentSubmissions
                .Include(sub => sub.Assignment)
                .Where(sub => sub.StudentId == id)
                .OrderByDescending(sub => sub.SubmittedAt)
                .Take(5)
                .Select(sub => new { sub.Assignment.Title, sub.SubmittedAt })
                .ToListAsync();

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var lastActivityDate = await _context.StudySessions
                .Where(ss => ss.UserId == userId)
                .MaxAsync(ss => (DateOnly?)ss.SessionDate);

            string status = "Active";
            if (lastActivityDate.HasValue && today.DayNumber - lastActivityDate.Value.DayNumber >= 3)
            {
                status = "Inactive";
            }
            else if (productivityScore < 50)
            {
                status = "Needs Improvement";
            }

            return Ok(new
            {
                studentName = student.User?.Name ?? "Unknown",
                productivityScore,
                completedTasks,
                pendingTasks,
                recentSessions,
                recentSubmissions,
                status
            });
        }

        [HttpPost("task")]
        public async Task<IActionResult> AssignTask([FromBody] CreateMentorTaskDto dto)
        {
            var mentor = await GetCurrentMentorAsync();
            if (mentor == null) return NotFound("Mentor not found");

            var isAssigned = await _context.MentorStudents.AnyAsync(ms => ms.MentorId == mentor.MentorId && ms.StudentId == dto.StudentId);
            if (!isAssigned) return Forbid("Not assigned to this student");

            var student = await _context.Students.FindAsync(dto.StudentId);
            if (student == null || student.UserId == null) return NotFound("Student not found");

            var task = new ReactApp1.Server.Models.Task
            {
                UserId = student.UserId.Value,
                Title = dto.Title,
                DueDate = dto.DueDate,
                Status = "Pending",
                CreatedBy = UserId,
                ModifiedBy = UserId,
                ModifiedAt = DateTime.UtcNow
            };

            _context.Tasks.Add(task);

            var mentorName = await _context.Users.Where(u => u.UserId == UserId).Select(u => u.Name).FirstOrDefaultAsync();
            _context.Notifications.Add(new Notification
            {
                UserId = student.UserId.Value,
                Message = $"Mentor {mentorName} assigned you a new task: {dto.Title} due by {dto.DueDate}."
            });

            await _context.SaveChangesAsync();

            return Ok(new { message = "Task assigned successfully", taskId = task.TaskId });
        }

        [HttpPost("assignment")]
        public async Task<IActionResult> CreateAssignment([FromBody] CreateMentorAssignmentDto dto)
        {
            var mentor = await GetCurrentMentorAsync();
            if (mentor == null) return NotFound("Mentor not found");

            // Verify mentor connection
            var isAssigned = await _context.MentorStudents.AnyAsync(ms => ms.MentorId == mentor.MentorId && ms.StudentId == dto.StudentId);
            if (!isAssigned) return Forbid("Not assigned to this student");

            var assignment = new Assignment
            {
                MentorId = mentor.MentorId,
                Title = dto.Title,
                DueDate = dto.DueDate,
                CreatedBy = UserId,
                ModifiedBy = UserId,
                ModifiedAt = DateTime.UtcNow
            };

            _context.Assignments.Add(assignment);
            await _context.SaveChangesAsync();
            
            // To link it to the specific student directly, we would normally use AssignmentSubmission as a bridge or a separate MentorAssignmentStudent table.
            // Based on requirements: "Link assignments with students via Assignment_Submissions."
            // Assuming creating an assignment automatically creates a blank/pending submission for the student.
            var submission = new AssignmentSubmission
            {
                AssignmentId = assignment.AssignmentId,
                StudentId = dto.StudentId,
                SubmittedAt = null // Not submitted yet
            };
            
            _context.AssignmentSubmissions.Add(submission);

            var mentorNameMsg = await _context.Users.Where(u => u.UserId == UserId).Select(u => u.Name).FirstOrDefaultAsync();
            var studentEntity = await _context.Students.FindAsync(dto.StudentId);
            if (studentEntity != null && studentEntity.UserId.HasValue)
            {
                _context.Notifications.Add(new Notification
                {
                    UserId = studentEntity.UserId.Value,
                    Message = $"Mentor {mentorNameMsg} published a new Assignment: {dto.Title} due by {dto.DueDate}."
                });
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Assignment created successfully", assignmentId = assignment.AssignmentId });
        }

        [HttpPost("feedback")]
        public async Task<IActionResult> GiveFeedback([FromBody] CreateMentorFeedbackDto dto)
        {
            var mentor = await GetCurrentMentorAsync();
            if (mentor == null) return NotFound("Mentor not found");

            var isAssigned = await _context.MentorStudents.AnyAsync(ms => ms.MentorId == mentor.MentorId && ms.StudentId == dto.StudentId);
            if (!isAssigned) return Forbid("Not assigned to this student");

            var feedback = new Feedback
            {
                MentorId = mentor.MentorId,
                StudentId = dto.StudentId,
                Feedback1 = dto.FeedbackText,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = UserId,
                ModifiedBy = UserId,
                ModifiedAt = DateTime.UtcNow
            };

            _context.Feedbacks.Add(feedback);

            var givingMentor = await _context.Users.Where(u => u.UserId == UserId).Select(u => u.Name).FirstOrDefaultAsync();
            var studentTarget = await _context.Students.FindAsync(dto.StudentId);
            if (studentTarget != null && studentTarget.UserId.HasValue)
            {
                _context.Notifications.Add(new Notification
                {
                    UserId = studentTarget.UserId.Value,
                    Message = $"Mentor {givingMentor} has posted new feedback on your profile."
                });
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Feedback submitted successfully", feedbackId = feedback.FeedbackId });
        }

        [HttpGet("feedback/{id}")] // id is student_id
        public async Task<IActionResult> GetStudentFeedbackList(int id)
        {
            var mentor = await GetCurrentMentorAsync();
            if (mentor == null) return NotFound("Mentor not found");

            var feedbacks = await _context.Feedbacks
                .Where(f => f.MentorId == mentor.MentorId && f.StudentId == id)
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new
                {
                    f.FeedbackId,
                    f.Feedback1,
                    f.CreatedAt
                })
                .ToListAsync();

            return Ok(feedbacks);
        }
    }
}
