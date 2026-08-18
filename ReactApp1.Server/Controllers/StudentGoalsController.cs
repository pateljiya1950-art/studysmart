using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;
using System.Security.Claims;

namespace ReactApp1.Server.Controllers
{
    public static class GoalStatusConstraints
    {
        public const string Active = "active";
        public const string Completed = "completed";
        public const string Failed = "failed";
        public const string Pending = "pending";

        public static bool IsValid(string status)
        {
            var s = status?.ToLower();
            return s == Active || s == Completed || s == Failed || s == Pending;
        }
    }

    [ApiController]
    [Route("api/student/goals")]
    [Authorize(Roles = "student")]
    public class StudentGoalsController : ControllerBase
    {
        private readonly StudentdbContext _context;

        public StudentGoalsController(StudentdbContext context)
        {
            _context = context;
        }

        private int UserId =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        private async Task<int> GetStudentId()
        {
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.UserId == UserId);

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

            return student.StudentId;
        }

        // GET ALL GOALS
        [HttpGet]
        public async Task<IActionResult> GetGoals()
        {
            int studentId = await GetStudentId();

            var goals = await _context.StudentGoals
                .Where(g => g.StudentId == studentId)
                .OrderByDescending(g => g.StartDate)
                .Select(g => new {
                    g.GoalId,
                    g.GoalTitle,
                    g.TargetTasks,
                    g.TargetHours,
                    g.StartDate,
                    g.EndDate,
                    g.GoalStatus
                })
                .ToListAsync();

            return Ok(goals);
        }

        // CREATE GOAL
        [HttpPost]
        public async Task<IActionResult> CreateGoal([FromBody] ReactApp1.Server.DTOs.Student.StudentGoalCreateDto dto)
        {
            int studentId = await GetStudentId();

            var goal = new StudentGoal
            {
                StudentId = studentId,
                GoalTitle = dto.GoalTitle,
                TargetTasks = dto.TargetTasks,
                TargetHours = dto.TargetHours,
                StartDate = DateOnly.FromDateTime(dto.StartDate),
                EndDate = DateOnly.FromDateTime(dto.EndDate),
                GoalStatus = GoalStatusConstraints.Active, // Using lowercase constant
                CreatedBy = UserId
            };

            _context.StudentGoals.Add(goal);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Goal created successfully" });
        }

        // UPDATE GOAL STATUS
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
        {
            if (string.IsNullOrWhiteSpace(status) || !GoalStatusConstraints.IsValid(status))
            {
                return BadRequest(new { message = "Invalid goal status provided. Must be 'active', 'completed', 'failed', or 'pending'." });
            }

            int studentId = await GetStudentId();

            var goal = await _context.StudentGoals
                .FirstOrDefaultAsync(g => g.GoalId == id && g.StudentId == studentId);

            if (goal == null)
                return NotFound();

            goal.GoalStatus = status.ToLower(); // Normalize to lowercase constraint
            goal.ModifiedBy = UserId;
            goal.ModifiedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}