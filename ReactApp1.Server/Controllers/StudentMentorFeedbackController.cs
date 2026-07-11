using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.DTOs.Student;
using ReactApp1.Server.Models;
using System.Security.Claims;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/student/feedback")]
    [Authorize(Roles = "student")]
    public class StudentMentorFeedbackController : ControllerBase
    {
        private readonly StudentdbContext _context;

        public StudentMentorFeedbackController(StudentdbContext context)
        {
            _context = context;
        }

        private int UserId =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpPost]
        public async Task<IActionResult> SubmitFeedback(StudentMentorFeedbackDto dto)
        {
            if (dto.Rating < 1 || dto.Rating > 5)
                return BadRequest("Rating must be between 1 and 5");

            var studentId = await _context.Students
                .Where(s => s.UserId == UserId)
                .Select(s => s.StudentId)
                .FirstOrDefaultAsync();

            if (studentId == 0)
                return BadRequest("Student profile not found");

            bool assigned = await _context.MentorStudents.AnyAsync(ms =>
                ms.StudentId == studentId &&
                ms.MentorId == dto.MentorId);

            if (!assigned)
                return Forbid("Mentor not assigned to this student");

            bool alreadyGiven = await _context.StudentMentorFeedbacks.AnyAsync(f =>
                f.StudentId == studentId &&
                f.MentorId == dto.MentorId);

            if (alreadyGiven)
                return Conflict("Feedback already submitted");

            _context.StudentMentorFeedbacks.Add(new StudentMentorFeedback
            {
                StudentId = studentId,
                MentorId = dto.MentorId,
                Rating = dto.Rating,
                Comments = dto.Comments,
                CreatedBy = UserId
            });

            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
