using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;
using System.Security.Claims;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/calendar")]
    [Authorize]
    public class CalendarController : ControllerBase
    {
        private readonly StudentdbContext _context;

        public CalendarController(StudentdbContext context)
        {
            _context = context;
        }

        private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        public class CalendarEventDto
        {
            public string id { get; set; } = null!;
            public string title { get; set; } = null!;
            public string type { get; set; } = null!;
            public string? date { get; set; }
            public string color { get; set; } = null!;
        }

        // GET all calendar events (Unified Feed)
        [HttpGet]
        public async Task<IActionResult> GetEvents()
        {
            try 
            {
                var role = User.FindFirstValue(ClaimTypes.Role);
                if (role != "student")
                {
                    // For mentors, just return their custom events for now
                    var mentorEvents = await _context.CalendarEvents
                        .Where(e => e.UserId == UserId)
                        .Select(e => new CalendarEventDto
                        {
                            id = $"custom_{e.EventId}",
                            title = e.Title,
                            type = e.EventType,
                            date = e.EventDate.HasValue ? e.EventDate.Value.ToString("yyyy-MM-dd") : null,
                            color = "#94a3b8"
                        })
                        .ToListAsync();
                    return Ok(mentorEvents);
                }

                var student = await _context.Students.AsNoTracking().FirstOrDefaultAsync(s => s.UserId == UserId);
                if (student == null) return BadRequest("Student not found");

                var studentId = student.StudentId;

                // 1. Personal Calendar Events
                var customEvents = await _context.CalendarEvents
                    .Where(e => e.UserId == UserId)
                    .Select(e => new CalendarEventDto
                    {
                        id = $"custom_{e.EventId}",
                        title = e.Title,
                        type = "personal",
                        date = e.EventDate.HasValue ? e.EventDate.Value.ToString("yyyy-MM-dd") : null,
                        color = "#f59e0b" // amber
                    })
                    .ToListAsync();

                // 2. Exams
                var exams = await _context.ExamAssignments
                    .Include(a => a.Exam)
                    .Where(a => a.StudentId == studentId)
                    .Select(a => new CalendarEventDto
                    {
                        id = $"exam_{a.AssignmentId}",
                        title = $"Exam: {a.Exam.Title}",
                        type = "exam",
                        date = a.Exam.ExamDate.ToString("yyyy-MM-dd"),
                        color = "#10b981" // emerald
                    })
                    .ToListAsync();

                // 3. Assignments (Belong to mentors connected to this student)
                var mentorIds = await _context.MentorStudents
                    .Where(ms => ms.StudentId == studentId)
                    .Select(ms => ms.MentorId)
                    .ToListAsync();

                var assignments = await _context.Assignments
                    .Where(a => mentorIds.Contains(a.MentorId))
                    .Select(a => new CalendarEventDto
                    {
                        id = $"assgn_{a.AssignmentId}",
                        title = $"Due: {a.Title}",
                        type = "assignment",
                        date = a.DueDate.HasValue ? a.DueDate.Value.ToString("yyyy-MM-dd") : null,
                        color = "#ec4899" // pink
                    })
                    .ToListAsync();

                // 4. Mentor Sessions
                var sessions = await _context.MentorSessions
                    .Where(s => s.StudentId == studentId)
                    .Select(s => new CalendarEventDto
                    {
                        id = $"session_{s.SessionId}",
                        title = $"Session: {s.Title}",
                        type = "session",
                        date = s.SessionDate,
                        color = "#6366f1" // indigo
                    })
                    .ToListAsync();

                var allEvents = customEvents.Concat(exams).Concat(assignments).Concat(sessions).ToList();

                return Ok(allEvents);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to load calendar events", error = ex.Message });
            }
        }

        public class CreateEventDto
        {
            public string Title { get; set; } = null!;
            public string EventType { get; set; } = null!;
            public string EventDate { get; set; } = null!;
        }

        // POST create a custom event
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateEventDto dto)
        {
            try
            {
                // Validate string format
                if (!DateOnly.TryParse(dto.EventDate, out DateOnly parsedDate))
                    return BadRequest(new { message = "Invalid date format. Expected yyyy-MM-dd." });

                _context.CalendarEvents.Add(new CalendarEvent
                {
                    UserId    = UserId,
                    Title     = dto.Title,
                    EventType = dto.EventType,
                    EventDate = parsedDate,
                    CreatedBy = UserId
                });
                
                await _context.SaveChangesAsync();
                return Ok(new { message = "Event created" });
            }
            catch (Exception ex)
            {
                var innermost = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return StatusCode(500, new { message = "Database Error", error = innermost, trace = ex.StackTrace });
            }
        }

        // DELETE an event
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var ev = await _context.CalendarEvents
                .FirstOrDefaultAsync(e => e.EventId == id && e.UserId == UserId);
            if (ev == null) return NotFound();
            _context.CalendarEvents.Remove(ev);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
