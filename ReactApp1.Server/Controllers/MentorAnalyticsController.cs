using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;
using System.Security.Claims;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/mentor/analytics")]
    [Authorize(Roles = "mentor")]
    public class MentorAnalyticsController : ControllerBase
    {
        private readonly StudentdbContext _context;

        public MentorAnalyticsController(StudentdbContext context)
        {
            _context = context;
        }

        private int UserId =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                var mentor = await _context.Mentors
                    .AsNoTracking()
                    .FirstOrDefaultAsync(m => m.UserId == UserId);

                if (mentor == null)
                    return Ok(new { isEmpty = true });

                var mid = mentor.MentorId;

                // Run queries sequentially (EF Core DbContext does NOT support parallel execution)
                var totalStudents = await _context.MentorStudents.CountAsync(ms => ms.MentorId == mid);
                
                var pendingRequests = await _context.MentorRequests.CountAsync(r => r.MentorId == mid && r.RequestStatus == "Pending");
                
                var sessions = await _context.MentorSessions.Where(s => s.MentorId == mid).ToListAsync();
                
                var totalExams = await _context.Exams.CountAsync(e => e.CreatedBy == mid);
                
                var totalAssignments = await _context.Assignments.CountAsync(a => a.MentorId == mid);
                
                var feedbacks = await _context.StudentMentorFeedbacks.Where(f => f.MentorId == mid).ToListAsync();
                
                var availabilitySlots = await _context.MentorAvailabilities.CountAsync(a => a.MentorId == mid && a.IsActive == true);
                
                var perf = await _context.MentorPerformances.Where(p => p.MentorId == mid).OrderByDescending(p => p.PeriodStart).FirstOrDefaultAsync();
                
                var recentFeedback = await _context.StudentMentorFeedbacks
                    .Where(f => f.MentorId == mid)
                    .OrderByDescending(f => f.CreatedAt)
                    .Take(5)
                    .Select(f => new { 
                        f.FeedbackId, 
                        rating = f.Rating, 
                        comments = f.Comments, 
                        date = f.CreatedAt,
                        studentName = f.Student.User.Name
                    })
                    .ToListAsync();

                // Fix: Rating is a decimal (not nullable), so we don't use .HasValue
                var avgRating = feedbacks.Any() ? feedbacks.Average(f => (double)f.Rating) : 0;
                
                // Keep the star counts so the frontend bar chart renders successfully
                var rating5Count = feedbacks.Count(f => Math.Round((double)f.Rating) == 5);
                var rating4Count = feedbacks.Count(f => Math.Round((double)f.Rating) == 4);
                var rating3Count = feedbacks.Count(f => Math.Round((double)f.Rating) == 3);
                var rating2Count = feedbacks.Count(f => Math.Round((double)f.Rating) == 2);
                var rating1Count = feedbacks.Count(f => Math.Round((double)f.Rating) == 1);

                return Ok(new
                {
                    isEmpty = false,
                    totalStudents = totalStudents,
                    pendingRequests = pendingRequests,
                    totalSessions = sessions.Count,
                    completedSessions = sessions.Count(s => s.SessionStatus == "Completed"),
                    upcomingSessions = sessions.Count(s => s.SessionStatus == "Scheduled"),
                    totalExams = totalExams,
                    totalAssignments = totalAssignments,
                    availabilitySlots = availabilitySlots,
                    feedbackCount = feedbacks.Count,
                    avgStudentRating = Math.Round(avgRating, 2),
                    rating5Count,
                    rating4Count,
                    rating3Count,
                    rating2Count,
                    rating1Count,
                    recentFeedback = recentFeedback,
                    studentsHandled = perf?.StudentsHandled ?? totalStudents,
                    avgStudentProductivity = perf?.AvgStudentProductivity
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to load analytics", error = ex.Message });
            }
        }
    }
}