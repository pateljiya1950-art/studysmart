using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;
using System.Security.Claims;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/student/reflection")]
    [Authorize(Roles = "student")]
    public class StudentReflectionController : ControllerBase
    {
        private readonly StudentdbContext _context;

        public StudentReflectionController(StudentdbContext context)
        {
            _context = context;
        }

        private int UserId =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        private async Task<int> GetStudentId()
        {
            var student = await _context.Students
                .FirstAsync(s => s.UserId == UserId);

            return student.StudentId;
        }

        // GET ALL REFLECTIONS
        [HttpGet]
        public async Task<IActionResult> GetReflections()
        {
            int studentId = await GetStudentId();

            var reflections = await _context.DailyReflections
                .Where(r => r.StudentId == studentId)
                .OrderByDescending(r => r.Date)
                .Select(r => new {
                    r.ReflectionId,
                    r.Date,
                    r.Mood,
                    r.Challenges,
                    r.ImprovementPlan
                })
                .ToListAsync();

            return Ok(reflections);
        }

        // ADD REFLECTION
        [HttpPost]
        public async Task<IActionResult> AddReflection([FromBody] ReactApp1.Server.DTOs.Student.DailyReflectionCreateDto dto)
        {
            int studentId = await GetStudentId();

            var reflection = new DailyReflection
            {
                StudentId = studentId,
                Date = DateOnly.FromDateTime(DateTime.UtcNow),
                Mood = dto.Mood,
                Challenges = dto.Challenges,
                ImprovementPlan = dto.ImprovementPlan
            };

            _context.DailyReflections.Add(reflection);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Reflection saved successfully" });
        }
        // DELETE REFLECTION
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReflection(int id)
        {
            int studentId = await GetStudentId();

            var reflection = await _context.DailyReflections
                .FirstOrDefaultAsync(r => r.ReflectionId == id && r.StudentId == studentId);

            if (reflection == null)
                return NotFound();

            _context.DailyReflections.Remove(reflection);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}