using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;
using ReactApp1.Server.Services;
using System.Security.Claims;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/study-sessions")]
    [Authorize(Roles = "student")]
    public class StudySessionsController : ControllerBase
    {
        private readonly StudentdbContext _context;

        public StudySessionsController(StudentdbContext context)
        {
            _context = context;
        }

        private int UserId =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // START SESSION
        [HttpPost("start")]
        public async Task<IActionResult> Start()
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            var session = new StudySession
            {
                UserId = UserId,
                SessionDate = today,
                DurationMin = 0
            };

            _context.StudySessions.Add(session);
            await _context.SaveChangesAsync();

            return Ok(session);
        }

        // STOP SESSION
        [HttpPut("{id}/stop")]
        public async Task<IActionResult> Stop(int id, [FromBody] int minutes)
        {
            var session = await _context.StudySessions
                .FirstOrDefaultAsync(s => s.SessionId == id && s.UserId == UserId);

            if (session == null)
                return NotFound();

            session.DurationMin = minutes;

            await _context.SaveChangesAsync();

            await AnalyticsService.UpdateDailyAnalytics(_context, UserId);

            return Ok();
        }
        // GET TODAY TOTALS
        [HttpGet("today")]
        public async Task<IActionResult> GetTodayTotals()
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            
            var count = await _context.StudySessions
                .Where(s => s.UserId == UserId && s.SessionDate == today && s.DurationMin > 0)
                .CountAsync();

            var totalMinutes = await _context.StudySessions
                .Where(s => s.UserId == UserId && s.SessionDate == today && s.DurationMin > 0)
                .SumAsync(s => s.DurationMin);

            return Ok(new { count, totalMinutes });
        }
    }
}