using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;
using System.Security.Claims;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/exams")]
    [Authorize(Roles = "mentor")]
    public class ExamsController : ControllerBase
    {
        private readonly StudentdbContext _context;

        public ExamsController(StudentdbContext context)
        {
            _context = context;
        }

        private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        public class CreateExamDto
        {
            public string Title { get; set; } = null!;
            public string Subject { get; set; } = null!;
            public string ExamDate { get; set; } = null!; // "YYYY-MM-DD"
            public int Duration { get; set; }
        }

        public class AssignExamDto
        {
            public int ExamId { get; set; }
            public int StudentId { get; set; }
            public string DueDate { get; set; } = null!; // "YYYY-MM-DD"
        }

        [HttpGet]
        public async Task<IActionResult> GetExams()
        {
            var mentorId = await _context.Mentors
                .Where(m => m.UserId == UserId)
                .Select(m => (int?)m.MentorId)
                .FirstOrDefaultAsync();

            if (mentorId == null) return BadRequest(new { success = false, message = "Mentor profile not found" });

            var exams = await _context.Exams
                .Where(e => e.CreatedBy == mentorId.Value)
                .OrderByDescending(e => e.ExamDate)
                .Select(e => new
                {
                    e.ExamId,
                    e.Title,
                    e.Subject,
                    ExamDate = e.ExamDate.ToString("yyyy-MM-dd"),
                    e.Duration
                })
                .ToListAsync();

            return Ok(new { success = true, data = exams });
        }

        [HttpPost]
        public async Task<IActionResult> CreateExam([FromBody] CreateExamDto dto)
        {
            var mentorId = await _context.Mentors
                .Where(m => m.UserId == UserId)
                .Select(m => (int?)m.MentorId)
                .FirstOrDefaultAsync();

            if (mentorId == null) return BadRequest(new { success = false, message = "Mentor profile not found" });

            if (string.IsNullOrWhiteSpace(dto.Title) || string.IsNullOrWhiteSpace(dto.Subject))
                return BadRequest(new { success = false, message = "Title and Subject are required" });

            if (!DateOnly.TryParse(dto.ExamDate, out var examDate))
                return BadRequest(new { success = false, message = "Invalid date format. Use YYYY-MM-DD" });

            var exam = new Exam
            {
                Title = dto.Title.Trim(),
                Subject = dto.Subject.Trim(),
                ExamDate = examDate,
                Duration = dto.Duration,
                CreatedBy = mentorId.Value
            };

            _context.Exams.Add(exam);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, data = new { exam.ExamId, exam.Title, exam.Subject, ExamDate = exam.ExamDate.ToString("yyyy-MM-dd"), exam.Duration } });
        }

        [HttpPost("assign")]
        public async Task<IActionResult> AssignExam([FromBody] AssignExamDto dto)
        {
            var mentorId = await _context.Mentors
                .Where(m => m.UserId == UserId)
                .Select(m => (int?)m.MentorId)
                .FirstOrDefaultAsync();

            if (mentorId == null) return BadRequest(new { success = false, message = "Mentor profile not found" });

            var examExists = await _context.Exams.AnyAsync(e => e.ExamId == dto.ExamId && e.CreatedBy == mentorId.Value);
            if (!examExists) return NotFound(new { success = false, message = "Exam not found or not owned by you" });

            var studentExists = await _context.Students.AnyAsync(s => s.StudentId == dto.StudentId);
            if (!studentExists) return NotFound(new { success = false, message = "Student not found" });

            if (!DateOnly.TryParse(dto.DueDate, out var dueDate))
                return BadRequest(new { success = false, message = "Invalid due date format" });

            var alreadyAssigned = await _context.ExamAssignments
                .AnyAsync(a => a.ExamId == dto.ExamId && a.StudentId == dto.StudentId);

            if (alreadyAssigned) return BadRequest(new { success = false, message = "Exam already assigned to this student" });

            var assignment = new ExamAssignment
            {
                ExamId = dto.ExamId,
                StudentId = dto.StudentId,
                AssignedBy = mentorId.Value,
                DueDate = dueDate,
                Status = "Pending"
            };

            _context.ExamAssignments.Add(assignment);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, data = new { assignment.AssignmentId, assignment.Status } });
        }
    }
}
