using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace ReactApp1.Server.Services
{
    public static class MentorPerformanceService
    {
        public static async System.Threading.Tasks.Task UpdatePerformance(
            StudentdbContext context,
            int mentorId
        )
        {
            // ---------- PERIOD (DateOnly-safe) ----------
            var now = DateTime.UtcNow;
            DateOnly periodStart = new DateOnly(now.Year, now.Month, 1);
            DateOnly periodEnd = periodStart.AddMonths(1).AddDays(-1);

            // ---------- FEEDBACK ----------
            var feedbacks = await context.StudentMentorFeedbacks
                .Where(f =>
                    f.MentorId == mentorId &&
                    DateOnly.FromDateTime(f.CreatedAt) >= periodStart &&
                    DateOnly.FromDateTime(f.CreatedAt) <= periodEnd
                )
                .ToListAsync();

            int feedbackCount = feedbacks.Count;

            decimal avgRating = feedbackCount > 0
                ? feedbacks.Average(f => f.Rating)
                : 0m;

            // ---------- STUDENTS HANDLED ----------
            int studentsHandled = await context.MentorStudents
                .Where(ms => ms.MentorId == mentorId)
                .Select(ms => ms.StudentId)
                .Distinct()
                .CountAsync();

            // ---------- FIND EXISTING RECORD ----------
            var performance = await context.MentorPerformances
                .FirstOrDefaultAsync(p =>
                    p.MentorId == mentorId &&
                    p.PeriodStart == periodStart &&
                    p.PeriodEnd == periodEnd
                );

            if (performance == null)
            {
                performance = new MentorPerformance
                {
                    MentorId = mentorId,
                    PeriodStart = periodStart,
                    PeriodEnd = periodEnd,
                    FeedbackCount = feedbackCount,
                    AvgStudentRating = avgRating,
                    StudentsHandled = studentsHandled
                };

                context.MentorPerformances.Add(performance);
            }
            else
            {
                performance.FeedbackCount = feedbackCount;
                performance.AvgStudentRating = avgRating;
                performance.StudentsHandled = studentsHandled;
            }

            await context.SaveChangesAsync();
            return;
        }
    }
}
