using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.DTOs.Student;
using ReactApp1.Server.Models;
using ReactApp1.Server.Services;
using System.Security.Claims;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/student")]
    [Authorize(Roles = "student")]
    public class StudentController : ControllerBase
    {
        private readonly StudentdbContext _context;

        public StudentController(StudentdbContext context)
        {
            _context = context;
        }

        // ================= GET LOGGED IN USER ID =================
        private int UserId =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // ================= CHECK IF PROFILE EXISTS =================
        [HttpGet("has-profile")]
        public async Task<IActionResult> HasProfile()
        {
            bool exists = await _context.Students
                .AnyAsync(s => s.UserId == UserId);

            return Ok(new { hasProfile = exists });
        }

        // ================= GET PROFILE =================
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == UserId);
            if (user == null) return NotFound("User not found");

            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == UserId);

            var profile = new StudentProfileDto
            {
                Name = user.Name,
                Email = user.Email,
                Course = student?.Course ?? "",
                Semester = student?.Semester ?? 0,
                University = student?.University ?? ""
            };

            return Ok(profile);
        }

        // ================= CREATE OR UPDATE PROFILE =================
        [HttpPost("profile")]
        public async Task<IActionResult> SaveProfile(StudentProfileUpdateDto dto)
        {
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.UserId == UserId);

            if (student == null)
            {
                student = new Student
                {
                    UserId = UserId,
                    Course = dto.Course,
                    Semester = dto.Semester,
                    University = dto.University,
                    CreatedBy = UserId
                };

                _context.Students.Add(student);
            }
            else
            {
                student.Course = dto.Course;
                student.Semester = dto.Semester;
                student.University = dto.University;
                student.ModifiedBy = UserId;
                student.ModifiedAt = DateTime.Now;
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

        // ================= DASHBOARD =================
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            await AnalyticsService.UpdateDailyAnalytics(_context, userId);

            var profile = await _context.Users
                .Where(u => u.UserId == userId)
                .Select(u => new { u.Name })
                .FirstAsync();

            int completedTasks = await _context.Tasks
                .CountAsync(t => t.UserId == userId && t.Status == "Completed");

            int pendingTasks = await _context.Tasks
                .CountAsync(t => t.UserId == userId && t.Status == "Pending");

            int studyMinutesToday = await _context.StudySessions
                .Where(s => s.UserId == userId && s.SessionDate == today)
                .SumAsync(s => (int?)s.DurationMin) ?? 0;

            var performance = await _context.PerformanceReports
                .FirstOrDefaultAsync(r => r.UserId == userId && r.ReportDate == today);

            decimal productivityScore = performance?.ProductivityScore ?? 0;

            // Optional explicit calculation backup in case AnalyticsService didn't save yet or to be transparent
            int totalTasks = completedTasks + pendingTasks;
            decimal taskRatio = totalTasks > 0 ? ((decimal)completedTasks / totalTasks) : 0m;
            if (taskRatio > 1m) taskRatio = 1m;

            int targetStudyMinutes = 120; // Default 2 hours
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
            if (student != null)
            {
                int activeGoalTargetHours = await _context.StudentGoals
                    .Where(g => g.StudentId == student.StudentId && g.GoalStatus == "Active")
                    .SumAsync(g => (int?)g.TargetHours) ?? 0;

                if (activeGoalTargetHours > 0)
                {
                    targetStudyMinutes = activeGoalTargetHours * 60;
                }
            }

            decimal studyRatio = targetStudyMinutes > 0 ? ((decimal)studyMinutesToday / targetStudyMinutes) : 0m;
            if (studyRatio > 1m) studyRatio = 1m;

            productivityScore = (taskRatio * 50m) + (studyRatio * 50m);

            return Ok(new
            {
                profile,
                completedTasks,
                pendingTasks,
                studyMinutesToday,
                productivityScore
            });
        }
    }
}