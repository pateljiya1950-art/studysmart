using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;
using System.Security.Claims;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/student/exams")]
    [Authorize(Roles = "student")]
    public class StudentExamsController : ControllerBase
    {
        private readonly StudentdbContext _context;

        public StudentExamsController(StudentdbContext context)
        {
            _context = context;
        }

        private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        public class SubmitExamDto
        {
            public int AssignmentId { get; set; }
            public decimal Score { get; set; }
        }

        // GET /api/student/exams
        [HttpGet]
        public async Task<IActionResult> GetExams()
        {
            var studentId = await _context.Students
                .Where(s => s.UserId == UserId)
                .Select(s => (int?)s.StudentId)
                .FirstOrDefaultAsync();

            if (studentId == null) return BadRequest(new { success = false, message = "Student profile not found" });

            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            var assignments = await _context.ExamAssignments
                .Include(a => a.Exam)
                .Where(a => a.StudentId == studentId.Value)
                .OrderBy(a => a.Exam.ExamDate)
                .Select(a => new
                {
                    a.AssignmentId,
                    a.Status,
                    DueDate = a.DueDate.ToString("yyyy-MM-dd"),
                    Exam = new
                    {
                        a.Exam.ExamId,
                        a.Exam.Title,
                        a.Exam.Subject,
                        ExamDate = a.Exam.ExamDate.ToString("yyyy-MM-dd"),
                        a.Exam.Duration
                    }
                })
                .ToListAsync();

            return Ok(new { success = true, data = assignments });
        }

        // POST /api/student/exams/submit
        [HttpPost("submit")]
        public async Task<IActionResult> SubmitExam([FromBody] SubmitExamDto dto)
        {
            var studentId = await _context.Students
                .Where(s => s.UserId == UserId)
                .Select(s => (int?)s.StudentId)
                .FirstOrDefaultAsync();

            if (studentId == null) return BadRequest(new { success = false, message = "Student profile not found" });

            var assignment = await _context.ExamAssignments
                .FirstOrDefaultAsync(a => a.AssignmentId == dto.AssignmentId && a.StudentId == studentId.Value);

            if (assignment == null) return NotFound(new { success = false, message = "Assignment not found" });

            if (assignment.Status == "Completed")
                return BadRequest(new { success = false, message = "Exam already submitted" });

            var submission = new ExamSubmission
            {
                AssignmentId = dto.AssignmentId,
                StudentId = studentId.Value,
                Score = dto.Score,
                SubmittedAt = DateTime.UtcNow
            };

            assignment.Status = "Completed";

            _context.ExamSubmissions.Add(submission);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, data = new { submission.SubmissionId, assignment.Status } });
        }
    }
}