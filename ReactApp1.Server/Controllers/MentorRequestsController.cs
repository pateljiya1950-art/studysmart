using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.DTOs.Mentor;
using ReactApp1.Server.Models;
using System.Security.Claims;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/mentor/requests")]
    [Authorize(Roles = "mentor")]
    public class MentorRequestsController : ControllerBase
    {
        private readonly StudentdbContext _context;

        public MentorRequestsController(StudentdbContext context)
        {
            _context = context;
        }

        private int UserId =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // ================= GET PENDING REQUESTS =================
        [HttpGet]
        public async Task<IActionResult> GetRequests()
        {
            var mentorId = await _context.Mentors
                .Where(m => m.UserId == UserId)
                .Select(m => m.MentorId)
                .FirstOrDefaultAsync();

            if (mentorId == 0)
                return BadRequest("Mentor profile not found");

            var requests = await _context.MentorRequests
                .Where(r => r.MentorId == mentorId && r.RequestStatus == "Pending")
                .Select(r => new
                {
                    r.RequestId,
                    StudentName = r.Student.User.Name,
                    Skill = r.Skill.SkillName
                })
                .ToListAsync();

            return Ok(requests);
        }

        // ================= ACCEPT / REJECT =================
        [HttpPost("action")]
        public async Task<IActionResult> Respond([FromBody] MentorRequestActionDto dto)
        {
            var request = await _context.MentorRequests
                .FirstOrDefaultAsync(r => r.RequestId == dto.RequestId);

            if (request == null)
                return NotFound();

            request.RequestStatus = dto.Action;
            request.RespondedAt = DateTime.UtcNow;

            if (dto.Action == "Accepted")
            {
                var existingEnrollment = await _context.MentorStudents
                    .AnyAsync(ms => ms.MentorId == request.MentorId && ms.StudentId == request.StudentId);

                if (!existingEnrollment)
                {
                    _context.MentorStudents.Add(new MentorStudent
                    {
                        MentorId = request.MentorId,
                        StudentId = request.StudentId,
                        CreatedBy = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!)
                    });
                }
            }

            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
