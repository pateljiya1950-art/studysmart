using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;
using System.Security.Claims;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/student/discovery")]
    [Authorize(Roles = "student")]
    public class StudentMentorDiscoveryController : ControllerBase
    {
        private readonly StudentdbContext _context;

        public StudentMentorDiscoveryController(StudentdbContext context)
        {
            _context = context;
        }

        private int UserId =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // GET: api/student/discovery/skills
        [HttpGet("skills")]
        public async Task<IActionResult> GetSkills()
        {
            var skills = await _context.SubjectsSkills
                .Where(s => s.IsActive == true)
                .Select(s => new { s.SkillId, s.SkillName, s.SkillType })
                .ToListAsync();

            return Ok(skills);
        }

        // GET: api/student/discovery/mentors/{skillId}
        [HttpGet("mentors/{skillId}")]
        public async Task<IActionResult> GetMentors(int skillId)
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == UserId);
            if (student == null)
            {
                student = new Student
                {
                    UserId = UserId,
                    Course = "General",
                    Semester = 1,
                    University = "Not Specified",
                    CreatedBy = UserId
                };
                _context.Students.Add(student);
                await _context.SaveChangesAsync();
            }

            var studentId = student.StudentId;

            // Fetch mentor IDs that the student has already requested or is enrolled with
            var alreadyAssociatedMentorIds = await _context.MentorRequests
                .Where(mr => mr.StudentId == studentId && (mr.RequestStatus == "Pending" || mr.RequestStatus == "Accepted"))
                .Select(mr => mr.MentorId)
                .Union(_context.MentorStudents.Where(ms => ms.StudentId == studentId).Select(ms => ms.MentorId))
                .Distinct()
                .ToListAsync();

            var mentors = await _context.MentorSkills
                .Where(ms => ms.SkillId == skillId && ms.Mentor.AvailabilityStatus == true && !alreadyAssociatedMentorIds.Contains(ms.MentorId))
                .Select(ms => new
                {
                    mentorId         = ms.Mentor.MentorId,
                    name             = ms.Mentor.User.Name,
                    department       = ms.Mentor.Department ?? "General",
                    proficiencyLevel = ms.ProficiencyLevel ?? "Not specified",
                    experienceYears  = ms.ExperienceYears ?? ms.Mentor.ExperienceYears ?? 0,
                    skillName        = ms.Skill.SkillName
                })
                .ToListAsync();

            return Ok(mentors);
        }

        // GET: api/student/discovery/mentor/{mentorId}/availability
        // Returns the weekly availability slots for a specific mentor
        [HttpGet("mentor/{mentorId}/availability")]
        public async Task<IActionResult> GetMentorAvailability(int mentorId)
        {
            try
            {
                var slots = await _context.MentorAvailabilities
                    .Where(a => a.MentorId == mentorId && a.IsActive == true)
                    .ToListAsync();

                var dayOrder = new[] { "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" };
                var dayLabel = new Dictionary<string, string>
                {
                    ["Mon"] = "Monday",  ["Tue"] = "Tuesday", ["Wed"] = "Wednesday",
                    ["Thu"] = "Thursday",["Fri"] = "Friday",  ["Sat"] = "Saturday"
                };

                var result = slots
                    .OrderBy(a => Array.IndexOf(dayOrder, a.DayOfWeek))
                    .Select(a => new
                    {
                        a.AvailabilityId,
                        a.DayOfWeek,
                        dayLabel  = dayLabel.TryGetValue(a.DayOfWeek, out var lbl) ? lbl : a.DayOfWeek,
                        startTime = a.StartTime.HasValue ? a.StartTime.Value.ToString("HH:mm") : "",
                        endTime   = a.EndTime.HasValue   ? a.EndTime.Value.ToString("HH:mm")   : ""
                    });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to load availability.", error = ex.Message });
            }
        }

        // GET: api/student/discovery/mentor/{mentorId}/skills
        // Returns the skill topics a mentor can help with
        [HttpGet("mentor/{mentorId}/skills")]
        public async Task<IActionResult> GetMentorSkills(int mentorId)
        {
            var skills = await _context.MentorSkills
                .Where(ms => ms.MentorId == mentorId)
                .Select(ms => new
                {
                    ms.Skill.SkillId,
                    ms.Skill.SkillName,
                    ms.Skill.SkillType,
                    ms.ProficiencyLevel,
                    ms.ExperienceYears
                })
                .ToListAsync();

            return Ok(skills);
        }

        // GET: api/student/discovery/my-mentors
        [HttpGet("my-mentors")]
        public async Task<IActionResult> GetMyMentors()
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == UserId);
            if (student == null)
            {
                student = new Student
                {
                    UserId = UserId,
                    Course = "General",
                    Semester = 1,
                    University = "Not Specified",
                    CreatedBy = UserId
                };
                _context.Students.Add(student);
                await _context.SaveChangesAsync();
            }

            // Enrolled mentors
            var enrolledIds = await _context.MentorStudents
                .Where(ms => ms.StudentId == student.StudentId)
                .Select(ms => ms.MentorId)
                .ToListAsync();

            var acceptedRequestIds = await _context.MentorRequests
                .Where(mr => mr.StudentId == student.StudentId && mr.RequestStatus == "Accepted")
                .Select(mr => mr.MentorId)
                .ToListAsync();

            var myMentorIds = enrolledIds.Union(acceptedRequestIds).Distinct().ToList();

            var myMentors = await _context.Mentors
                .Include(m => m.User)
                .Where(m => myMentorIds.Contains(m.MentorId))
                .Select(m => new {
                    mentorId = m.MentorId,
                    name = m.User.Name,
                    email = m.User.Email,
                    department = m.Department,
                    experienceYears = m.ExperienceYears ?? 0,
                    skills = m.MentorSkills.Select(ms => ms.Skill.SkillName)
                })
                .ToListAsync();

            var result = myMentors.Select(m => new {
                m.mentorId,
                m.name,
                m.email,
                m.department,
                m.experienceYears,
                skills = m.skills.Distinct().ToList()
            });

            return Ok(result);
        }
    }
}