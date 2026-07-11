using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;
using System.Security.Claims;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/mentor/sessions")]
    [Authorize(Roles = "mentor")]
    public class MentorSessionsController : ControllerBase
    {
        private readonly StudentdbContext _context;

        public MentorSessionsController(StudentdbContext context)
        {
            _context = context;
        }

        private int UserId =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // ─── DTOs ──────────────────────────────────────────────────
        public class ScheduleSessionDto
        {
            public List<int> StudentIds { get; set; } = new();
            public string Title       { get; set; } = null!;
            public string Date        { get; set; } = null!;   // "YYYY-MM-DD"
            public string StartTime   { get; set; } = null!;   // "HH:mm"
            public string EndTime     { get; set; } = null!;   // "HH:mm"
            public string MeetingLink { get; set; } = null!;
        }

        public class StatusUpdateDto
        {
            public string Status { get; set; } = null!;
        }

        // ─── GET  api/mentor/sessions ───────────────────────────────
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var mentor = await _context.Mentors
                .FirstOrDefaultAsync(m => m.UserId == UserId);

            if (mentor == null)
                return BadRequest("Mentor profile not found");

            var sessions = await _context.MentorSessions
                .Include(s => s.Student).ThenInclude(st => st.User)
                .Where(s => s.MentorId == mentor.MentorId)
                .Select(s => new
                {
                    sessionId = s.SessionId,
                    studentId = s.StudentId,
                    studentName = s.Student.User.Name,
                    title = s.Title,

                    date = s.SessionDate,
                    startTime = s.StartTime,
                    endTime = s.EndTime,

                    meetingLink = s.MeetingLink,
                    status = s.SessionStatus
                })
                .ToListAsync();

            return Ok(sessions);
        }

        // ─── POST api/mentor/sessions ───────────────────────────────
        [HttpPost]
        public async Task<IActionResult> Schedule([FromBody] ScheduleSessionDto dto)
        {
            if (dto.StudentIds == null || !dto.StudentIds.Any())
                return BadRequest("Invalid student(s)");

            var mentorId = await _context.Mentors
                .Where(m => m.UserId == UserId)
                .Select(m => (int?)m.MentorId)
                .FirstOrDefaultAsync();

            if (mentorId == null)
                return BadRequest("Mentor not found");

            var mentorName = await _context.Users.Where(u => u.UserId == UserId).Select(u => u.Name).FirstOrDefaultAsync();

            var newSessions = new List<MentorSession>();
            foreach (var studentId in dto.StudentIds)
            {
                var session = new MentorSession
                {
                    MentorId = mentorId.Value,
                    StudentId = studentId,
                    Title = dto.Title,
                    SessionDate = dto.Date,
                    StartTime = dto.StartTime,
                    EndTime = dto.EndTime,
                    MeetingLink = dto.MeetingLink,

                    ScheduledDatetime = DateTime.Parse($"{dto.Date}T{dto.StartTime}:00"),
                    SessionStatus = "Scheduled"
                };

                newSessions.Add(session);

                var student = await _context.Students.FirstOrDefaultAsync(s => s.StudentId == studentId);
                if (student != null && student.UserId.HasValue)
                {
                    _context.Notifications.Add(new Notification
                    {
                        UserId = student.UserId.Value,
                        Message = $"Mentor {mentorName} has scheduled a session: {dto.Title} on {dto.Date} at {dto.StartTime}."
                    });
                }
            }
            
            _context.MentorSessions.AddRange(newSessions);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Session(s) created" });
        }

        // ─── PUT  api/mentor/sessions/{id}/status ──────────────────
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] StatusUpdateDto dto)
        {
            var session = await _context.MentorSessions
                .Include(s => s.Mentor)
                .FirstOrDefaultAsync(s => s.SessionId == id && s.Mentor.UserId == UserId);

            if (session == null) return NotFound("Session not found");

            var valid = new[] { "Scheduled", "Completed", "Cancelled" };
            if (!valid.Contains(dto.Status))
                return BadRequest("Invalid status");

            session.SessionStatus = dto.Status;
            session.ModifiedBy    = UserId;
            session.ModifiedAt    = DateTime.UtcNow;

            var student = await _context.Students.FirstOrDefaultAsync(s => s.StudentId == session.StudentId);
            if (student != null && student.UserId.HasValue)
            {
                _context.Notifications.Add(new Notification
                {
                    UserId = student.UserId.Value,
                    Message = $"Your session '{session.Title}' status was updated to {dto.Status}."
                });
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Status updated" });
        }

        // ─── DELETE  api/mentor/sessions/{id} ──────────────────────
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var session = await _context.MentorSessions
                .Include(s => s.Mentor)
                .FirstOrDefaultAsync(s => s.SessionId == id && s.Mentor.UserId == UserId);

            if (session == null) return NotFound("Session not found");

            _context.MentorSessions.Remove(session);

            var student = await _context.Students.FirstOrDefaultAsync(s => s.StudentId == session.StudentId);
            if (student != null && student.UserId.HasValue)
            {
                _context.Notifications.Add(new Notification
                {
                    UserId = student.UserId.Value,
                    Message = $"Your session '{session.Title}' has been cancelled by the mentor."
                });
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Session deleted" });
        }
    }
}
