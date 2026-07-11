using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.DTOs.Mentor;
using ReactApp1.Server.DTOs.Student;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.Services
{
    public class ExamAssignmentService : IExamAssignmentService
    {
        private readonly StudentdbContext _context;

        public ExamAssignmentService(StudentdbContext context)
        {
            _context = context;
        }

        // ─── Helpers ──────────────────────────────────────────────────────────────

        /// <summary>Returns the mentor_id for a given user_id, or null if not found.</summary>
        private async Task<int?> GetMentorIdAsync(int userId)
        {
            var mentor = await _context.Mentors
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.UserId == userId);
            return mentor?.MentorId;
        }

        /// <summary>Returns the student_id for a given user_id, or null if not found.</summary>
        private async Task<int?> GetStudentIdAsync(int userId)
        {
            var student = await _context.Students
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.UserId == userId);
            return student?.StudentId;
        }

        // ─── Mentor Assignments ───────────────────────────────────────────────────

        public async Task<MentorAssignmentDto> CreateAssignmentAsync(int userId, CreateAssignmentDto dto)
        {
            // Resolve mentor record
            int? mentorId = await GetMentorIdAsync(userId);
            if (mentorId is null)
                throw new InvalidOperationException("Mentor profile not found for this user.");

            var assignment = new Assignment
            {
                MentorId    = mentorId.Value,
                Title       = dto.Title,
                Description = dto.Description,
                DueDate     = dto.DueDate,
                CreatedBy   = userId
            };

            // ONLY insert into Assignments table — NEVER pre-create submission rows
            _context.Assignments.Add(assignment);
            await _context.SaveChangesAsync();

            return new MentorAssignmentDto
            {
                AssignmentId    = assignment.AssignmentId,
                Title           = assignment.Title,
                DueDate         = assignment.DueDate,
                SubmissionCount = 0
            };
        }

        public async Task<List<MentorAssignmentDto>> GetMentorAssignmentsAsync(int userId)
        {
            int? mentorId = await GetMentorIdAsync(userId);
            if (mentorId is null)
                return new List<MentorAssignmentDto>();

            return await _context.Assignments
                .AsNoTracking()
                .Where(a => a.MentorId == mentorId.Value)
                .OrderByDescending(a => a.DueDate)
                .Select(a => new MentorAssignmentDto
                {
                    AssignmentId    = a.AssignmentId,
                    Title           = a.Title,
                    Description     = a.Description,
                    DueDate         = a.DueDate,
                    // Count only genuine submissions: both SubmittedAt AND FilePath are set
                    SubmissionCount = a.AssignmentSubmissions
                        .Count(s => s.SubmittedAt != null && s.FilePath != null)
                })
                .ToListAsync();
        }

        public async Task<List<AssignmentSubmissionViewDto>> GetAssignmentSubmissionsAsync(int userId, int assignmentId)
        {
            int? mentorId = await GetMentorIdAsync(userId);
            if (mentorId is null)
                return new List<AssignmentSubmissionViewDto>();

            var assignment = await _context.Assignments
                .Include(a => a.AssignmentSubmissions)
                    .ThenInclude(s => s.Student)
                        .ThenInclude(st => st.User)
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.AssignmentId == assignmentId && a.MentorId == mentorId.Value);

            if (assignment == null)
                return new List<AssignmentSubmissionViewDto>();

            // Only return genuine submissions — must have both SubmittedAt AND FilePath
            return assignment.AssignmentSubmissions
                .Where(s => s.SubmittedAt != null && s.FilePath != null)
                .Select(s => new AssignmentSubmissionViewDto
                {
                    SubmissionId = s.SubmissionId,
                    StudentName  = s.Student.User.Name,
                    SubmittedAt  = s.SubmittedAt,
                    FilePath     = s.FilePath
                })
                .OrderByDescending(s => s.SubmittedAt)
                .ToList();
        }

        public async Task<bool> DeleteAssignmentAsync(int userId, int assignmentId)
        {
            int? mentorId = await GetMentorIdAsync(userId);
            if (mentorId is null)
                return false;

            var assignment = await _context.Assignments
                .Include(a => a.AssignmentSubmissions)
                .FirstOrDefaultAsync(a => a.AssignmentId == assignmentId && a.MentorId == mentorId.Value);

            if (assignment == null)
                return false;

            // Remove child submissions first to avoid FK violations
            _context.AssignmentSubmissions.RemoveRange(assignment.AssignmentSubmissions);
            _context.Assignments.Remove(assignment);
            await _context.SaveChangesAsync();
            return true;
        }

        // ─── Student Assignments ──────────────────────────────────────────────────

        public async Task<List<AssignmentDto>> GetAllAssignmentsAsync(int userId)
        {
            int? studentId = await GetStudentIdAsync(userId);
            if (studentId is null)
                return new List<AssignmentDto>();

            // Get the mentor(s) this student is enrolled with
            var mentorIds = await _context.MentorStudents
                .AsNoTracking()
                .Where(ms => ms.StudentId == studentId.Value)
                .Select(ms => ms.MentorId)
                .Distinct()
                .ToListAsync();

            if (!mentorIds.Any())
                return new List<AssignmentDto>();

            // Fetch all assignments from those mentors, with isSubmitted flag
            return await _context.Assignments
                .AsNoTracking()
                .Where(a => mentorIds.Contains(a.MentorId))
                .OrderBy(a => a.DueDate)
                .Select(a => new AssignmentDto
                {
                    AssignmentId = a.AssignmentId,
                    Title        = a.Title,
                    Description  = a.Description,
                    DueDate      = a.DueDate,
                    // true only when student has a REAL submission (file uploaded + SubmittedAt set)
                    IsSubmitted  = a.AssignmentSubmissions
                        .Any(s => s.StudentId == studentId.Value
                               && s.SubmittedAt != null
                               && s.FilePath != null)
                })
                .ToListAsync();
        }

        public async Task<(bool Success, string Error, SubmissionDto? Result)> SubmitAssignmentAsync(
            int userId, int assignmentId, Microsoft.AspNetCore.Http.IFormFile? file)
        {
            // 1. File is mandatory
            if (file == null || file.Length == 0)
                return (false, "A file is required to submit the assignment.", null);

            // 2. Validate student exists
            int? studentId = await GetStudentIdAsync(userId);
            if (studentId is null)
                return (false, "Student profile not found for this user.", null);

            // 3. Validate assignment exists
            var assignment = await _context.Assignments
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.AssignmentId == assignmentId);

            if (assignment is null)
                return (false, $"Assignment with id {assignmentId} not found.", null);

            // 4. Verify student is enrolled with the mentor who owns this assignment
            var isEnrolled = await _context.MentorStudents
                .AsNoTracking()
                .AnyAsync(ms => ms.MentorId == assignment.MentorId && ms.StudentId == studentId.Value);

            if (!isEnrolled)
                return (false, "You are not enrolled with the mentor who created this assignment.", null);

            // 5. Prevent submission after due date
            if (assignment.DueDate.HasValue &&
                DateOnly.FromDateTime(DateTime.UtcNow) > assignment.DueDate.Value)
            {
                return (false, "The due date for this assignment has passed. Submission is no longer allowed.", null);
            }

            // 6. Prevent duplicate submissions — check for any real submission already in DB
            var alreadySubmitted = await _context.AssignmentSubmissions
                .AsNoTracking()
                .AnyAsync(s => s.AssignmentId == assignmentId
                            && s.StudentId == studentId.Value
                            && s.SubmittedAt != null
                            && s.FilePath != null);

            if (alreadySubmitted)
                return (false, "You have already submitted this assignment.", null);

            // 7. Save uploaded file to disk
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "assignments");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // 8. Create a brand-new submission row (never update placeholder rows)
            var submission = new AssignmentSubmission
            {
                AssignmentId = assignmentId,
                StudentId    = studentId.Value,
                SubmittedAt  = DateTime.UtcNow,
                FilePath     = $"/uploads/assignments/{uniqueFileName}"
            };

            _context.AssignmentSubmissions.Add(submission);
            await _context.SaveChangesAsync();

            var result = new SubmissionDto
            {
                SubmissionId = submission.SubmissionId,
                AssignmentId = submission.AssignmentId,
                StudentId    = submission.StudentId,
                SubmittedAt  = submission.SubmittedAt
            };

            return (true, string.Empty, result);
        }
    }
}
