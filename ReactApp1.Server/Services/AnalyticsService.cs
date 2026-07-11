using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.Services
{
    public static class AnalyticsService
    {
        public static async System.Threading.Tasks.Task UpdateDailyAnalytics(StudentdbContext context, int userId)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            int completedTasks = await context.Tasks
                .CountAsync(t => t.UserId == userId && t.Status == "Completed");

            int studyMinutes = await context.StudySessions
                .Where(s => s.UserId == userId && s.SessionDate == today)
                .SumAsync(s => (int?)s.DurationMin) ?? 0;

            var analytics = await context.AnalyticsDailies
                .FirstOrDefaultAsync(a => a.UserId == userId && a.Date == today);

            int totalTasks = await context.Tasks
                .CountAsync(t => t.UserId == userId);

            if (analytics == null)
            {
                analytics = new AnalyticsDaily
                {
                    UserId = userId,
                    Date = today,
                    StudyMinutes = studyMinutes,
                    CompletedTasks = completedTasks
                };

                context.AnalyticsDailies.Add(analytics);
            }
            else
            {
                analytics.StudyMinutes = studyMinutes;
                analytics.CompletedTasks = completedTasks;
            }

            // --- CALCULATE PRODUCTIVITY SCORE ---
            
            // 1. Task Ratio
            decimal taskRatio = totalTasks > 0 ? ((decimal)completedTasks / totalTasks) : 0m;
            if (taskRatio > 1m) taskRatio = 1m;

            // 2. Study Ratio
            int targetStudyMinutes = 120; // default 2 hours daily target
            var student = await context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
            
            if (student != null)
            {
                // Optionally pull sum of active goal target hours
                int activeGoalTargetHours = await context.StudentGoals
                    .Where(g => g.StudentId == student.StudentId && g.GoalStatus == "Active")
                    .SumAsync(g => (int?)g.TargetHours) ?? 0;

                if (activeGoalTargetHours > 0)
                {
                    // If goals exist, use those hours (multiply by 60 for minutes).
                    // We cap or adjust as needed, but here we just convert to mins.
                    targetStudyMinutes = activeGoalTargetHours * 60;
                }
            }

            decimal studyRatio = targetStudyMinutes > 0 ? ((decimal)studyMinutes / targetStudyMinutes) : 0m;
            if (studyRatio > 1m) studyRatio = 1m; // cap at 100% contribution

            decimal productivityScore = (taskRatio * 50m) + (studyRatio * 50m);

            var report = await context.PerformanceReports
                .FirstOrDefaultAsync(r => r.UserId == userId && r.ReportDate == today);

            if (report == null)
            {
                report = new PerformanceReport
                {
                    UserId = userId,
                    ReportDate = today,
                    ProductivityScore = productivityScore
                };

                context.PerformanceReports.Add(report);
            }
            else
            {
                report.ProductivityScore = productivityScore;
            }

            await context.SaveChangesAsync();
        }
    }
}