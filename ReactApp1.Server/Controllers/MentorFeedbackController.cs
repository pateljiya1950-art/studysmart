using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;
using System.Security.Claims;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/mentor/feedback")]
    [Authorize(Roles = "mentor")]
    public class MentorFeedbackController : ControllerBase
    {
        private readonly StudentdbContext _context;

        public MentorFeedbackController(StudentdbContext context)
        {
            _context = context;
        }

        private int UserId =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var mentor = await _context.Mentors
                .FirstOrDefaultAsync(m => m.UserId == UserId);

            var feedback = await _context.StudentMentorFeedbacks
                .Where(f => f.MentorId == mentor.MentorId)
                .Select(f => new
                {
                    studentName = f.Student.User.Name,
                    f.Rating,
                    f.Comments,
                    f.CreatedAt
                })
                .ToListAsync();

            return Ok(feedback);
        }
    }
}
