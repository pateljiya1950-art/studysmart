using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.DTOs.Mentor;
using ReactApp1.Server.Models;
using System.Security.Claims;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/student")]
    [Authorize(Roles = "student")]
    public class StudentMentorRequestController : ControllerBase
    {
        private readonly StudentdbContext _context;

        public StudentMentorRequestController(StudentdbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(claim))
                throw new Exception("User ID not found in token");

            return int.Parse(claim);
        }

        // GET SKILLS
        [HttpGet("skills")]
        public async Task<IActionResult> GetSkills()
        {
            var skills = await _context.SubjectsSkills
                .Where(s => s.IsActive)
                .Select(s => new
                {
                    s.SkillId,
                    s.SkillName
                })
                .ToListAsync();

            return Ok(skills);
        }

        // GET MENTORS BY SKILL
        [HttpGet("mentors/{skillId}")]
        public async Task<IActionResult> GetMentors(int skillId)
        {
            var mentors = await _context.MentorSkills
                .Include(ms => ms.Mentor)
                .ThenInclude(m => m.User)
                .Where(ms => ms.SkillId == skillId)
                .Select(ms => new
                {
                    mentorId = ms.Mentor.MentorId,
                    name = ms.Mentor.User.Name,
                    proficiencyLevel = ms.ProficiencyLevel,
                    experienceYears = ms.ExperienceYears
                })
                .ToListAsync();

            return Ok(mentors);
        }

        public class MultipleSkillRequestDto
        {
            public int MentorId { get; set; }
            public List<int> SkillIds { get; set; } = new();
        }

        // SEND MENTOR REQUEST
        [HttpPost("mentor-requests")]
        public async Task<IActionResult> SendRequest([FromBody] MultipleSkillRequestDto dto)
        {
            var userId = GetUserId();

            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null)
                return BadRequest("Student not found");

            if (dto.SkillIds == null || !dto.SkillIds.Any())
                return BadRequest("At least one topic must be selected");

            foreach (var sid in dto.SkillIds)
            {
                var request = new MentorRequest
                {
                    StudentId = student.StudentId,
                    MentorId = dto.MentorId,
                    SkillId = sid,
                    RequestStatus = "Pending",
                    RequestedAt = DateTime.Now
                };
                _context.MentorRequests.Add(request);
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Request sent successfully" });
        }

        // GET student's assigned mentors (for feedback page)
        [HttpGet("my-mentors")]
        public async Task<IActionResult> GetMyMentors()
        {
            var userId = GetUserId();
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null)
                return BadRequest("Student not found");

            var mentors = await _context.MentorStudents
                .Include(ms => ms.Mentor)
                .ThenInclude(m => m.User)
                .Where(ms => ms.StudentId == student.StudentId)
                .Select(ms => new
                {
                    ms.Mentor.MentorId,
                    Name       = ms.Mentor.User.Name,
                    Department = ms.Mentor.Department
                })
                .ToListAsync();

            return Ok(mentors);
        }

        // RECOMMENDED MENTORS
        [HttpGet("recommended-mentors")]
        public async Task<IActionResult> GetRecommendedMentors()
        {
            var mentors = await _context.MentorSkills
                .Include(ms => ms.Mentor)
                .ThenInclude(m => m.User)
                .Select(ms => new
                {
                    mentorId = ms.Mentor.MentorId,
                    name = ms.Mentor.User.Name,
                    proficiencyLevel = ms.ProficiencyLevel,
                    experienceYears = ms.ExperienceYears
                })
                .ToListAsync();

            var feedbacks = await _context.StudentMentorFeedbacks.ToListAsync();

            var recommended = mentors
                .Select(m => new
                {
                    m.mentorId,
                    m.name,
                    m.proficiencyLevel,
                    m.experienceYears,

                    score =
                        (m.experienceYears * 2) +
                        (feedbacks
                            .Where(f => f.MentorId == m.mentorId)
                            .Average(f => (double?)f.Rating) ?? 0)
                })
                .OrderByDescending(m => m.score)
                .Take(5)
                .ToList();

            return Ok(recommended);
        }
    }
}