using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.DTOs.Student;
using ReactApp1.Server.Models;
using System.Security.Claims;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/student/analytics")]
    [Authorize(Roles = "student")]
    public class StudentAnalyticsController : ControllerBase
    {
        private readonly StudentdbContext _context;

        public StudentAnalyticsController(StudentdbContext context)
        {
            _context = context;
        }

        private int UserId =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet("weekly")]
        public async Task<IActionResult> Weekly()
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var weekStart = today.AddDays(-7);

            var data = await _context.AnalyticsDailies
                .Where(a => a.UserId == UserId && a.Date >= weekStart)
                .ToListAsync();

            return Ok(new
            {
                totalStudyMinutes = data.Sum(x => x.StudyMinutes),
                totalCompletedTasks = data.Sum(x => x.CompletedTasks),
                averageProductivityScore =
                    data.Any()
                    ? await _context.PerformanceReports
                        .Where(p => p.UserId == UserId && p.ReportDate >= weekStart)
                        .AverageAsync(p => (decimal?)p.ProductivityScore) ?? 0
                    : 0
            });
        }

        [HttpGet("monthly")]
        public async Task<IActionResult> Monthly()
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var monthStart = new DateOnly(today.Year, today.Month, 1);

            var data = await _context.AnalyticsDailies
                .Where(a => a.UserId == UserId && a.Date >= monthStart)
                .ToListAsync();

            return Ok(new
            {
                totalStudyMinutes = data.Sum(x => x.StudyMinutes),
                totalCompletedTasks = data.Sum(x => x.CompletedTasks),
                averageProductivityScore =
                    data.Any()
                    ? await _context.PerformanceReports
                        .Where(p => p.UserId == UserId && p.ReportDate >= monthStart)
                        .AverageAsync(p => (decimal?)p.ProductivityScore) ?? 0
                    : 0
            });
        }
    }
}

