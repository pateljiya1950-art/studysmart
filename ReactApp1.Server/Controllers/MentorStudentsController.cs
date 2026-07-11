using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;
using System.Security.Claims;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/mentor/students")]
    [Authorize(Roles = "mentor")]
    public class MentorStudentsController : ControllerBase
    {
        private readonly StudentdbContext _context;

        public MentorStudentsController(StudentdbContext context)
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

            if (mentor == null)
                return NotFound("Mentor not found");

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var students = await _context.MentorStudents
                .Where(ms => ms.MentorId == mentor.MentorId)
                .Select(ms => new
                {
                    ms.Student.StudentId,
                    name = ms.Student.User.Name,
                    ms.Student.Course,
                    ms.Student.Semester,
                    skills = _context.MentorRequests
                        .Where(mr => mr.StudentId == ms.Student.StudentId && mr.MentorId == mentor.MentorId && mr.RequestStatus == "Accepted")
                        .Select(mr => mr.Skill.SkillName)
                        .ToList(),
                    productivityScore = _context.PerformanceReports
                        .Where(pr => ms.Student.UserId != null && pr.UserId == ms.Student.UserId)
                        .OrderByDescending(pr => pr.ReportDate)
                        .Select(pr => (decimal?)pr.ProductivityScore)
                        .FirstOrDefault(),
                    completedTasks = _context.Tasks
                        .Count(t => ms.Student.UserId != null && t.UserId == ms.Student.UserId && t.Status == "Completed"),
                    pendingTasks = _context.Tasks
                        .Count(t => ms.Student.UserId != null && t.UserId == ms.Student.UserId && t.Status == "Pending"),
                    lastActivityDate = _context.StudySessions
                        .Where(ss => ms.Student.UserId != null && ss.UserId == ms.Student.UserId)
                        .Max(ss => (DateOnly?)ss.SessionDate)
                })
                .ToListAsync();

            students = students
                .GroupBy(s => s.StudentId)
                .Select(g => g.First())
                .ToList();

            var result = students.Select(s => {
                string status = "Active";
                if (s.lastActivityDate.HasValue && today.DayNumber - s.lastActivityDate.Value.DayNumber >= 3)
                {
                    status = "Inactive";
                }
                else if (s.productivityScore.HasValue && s.productivityScore.Value < 50)
                {
                    status = "Needs Improvement";
                }

                return new
                {
                    s.StudentId,
                    s.name,
                    s.Course,
                    s.Semester,
                    skills = s.skills,
                    productivityScore = s.productivityScore ?? 0,
                    s.completedTasks,
                    s.pendingTasks,
                    status
                };
            });

            return Ok(result);
        }
    }
}
