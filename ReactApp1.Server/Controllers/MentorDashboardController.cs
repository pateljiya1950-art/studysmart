using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;
using System.Security.Claims;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/mentor/dashboard")]
    [Authorize(Roles = "mentor")]
    public class MentorDashboardController : ControllerBase
    {
        private readonly StudentdbContext _context;

        public MentorDashboardController(StudentdbContext context)
        {
            _context = context;
        }

        private int UserId =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var mentor = await _context.Mentors
                .Include(m => m.User)
                .FirstOrDefaultAsync(m => m.UserId == UserId);

            if (mentor == null)
                return BadRequest("Mentor profile not found");

            int totalStudents = await _context.MentorStudents
                .CountAsync(ms => ms.MentorId == mentor.MentorId);

            int pendingRequests = await _context.MentorRequests
                .CountAsync(r => r.MentorId == mentor.MentorId && r.RequestStatus == "Pending");

            int upcomingSessions = await _context.MentorSessions
                .CountAsync(s => s.MentorId == mentor.MentorId && s.SessionStatus == "Scheduled");

            decimal avgRating = await _context.StudentMentorFeedbacks
                .Where(f => f.MentorId == mentor.MentorId)
                .AverageAsync(f => (decimal?)f.Rating) ?? 0;

            return Ok(new
            {
                profile = new { 
                    name = mentor.User.Name,
                    department = mentor.Department,
                    experienceYears = mentor.ExperienceYears,
                    maxStudents = mentor.MaxStudents
                },
                totalStudents,
                pendingRequests,
                upcomingSessions,
                avgRating
            });
        }
    }
}