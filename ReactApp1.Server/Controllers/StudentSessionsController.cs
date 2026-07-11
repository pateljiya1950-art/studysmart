using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;
using System.Security.Claims;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/student/sessions")]
    [Authorize(Roles = "student")]
    public class StudentSessionsController : ControllerBase
    {
        private readonly StudentdbContext _context;

        public StudentSessionsController(StudentdbContext context)
        {
            _context = context;
        }

        private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // ─── GET  api/student/sessions ──────────────────────────────
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.UserId == UserId);

            if (student == null)
                return BadRequest("Student profile not found");

            var sessions = await _context.MentorSessions
                .Include(s => s.Mentor).ThenInclude(m => m.User)
                .Where(s => s.StudentId == student.StudentId)
                .OrderBy(s => s.SessionDate ?? s.ScheduledDatetime.ToString())
                .Select(s => new
                {
                    s.SessionId,
                    s.MentorId,
                    MentorName   = s.Mentor.User.Name,
                    s.Title,
                    s.SessionDate,
                    s.StartTime,
                    s.EndTime,
                    s.MeetingLink,
                    s.ScheduledDatetime,
                    s.SessionStatus
                })
                .ToListAsync();

            return Ok(sessions);
        }
    }
}
