using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;
using System.Security.Claims;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/chat")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly StudentdbContext _context;

        public ChatController(StudentdbContext context)
        {
            _context = context;
        }

        private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        private string UserRole => User.FindFirstValue(ClaimTypes.Role)!;

        public class SendMessageDto
        {
            public string Text { get; set; } = null!;
        }

        // Returns chat history between the current user and the specified connected party
        // If Student invokes: targetId = MentorId
        // If Mentor invokes: targetId = StudentId
        [HttpGet("{targetId}")]
        public async Task<IActionResult> GetChatHistory(int targetId)
        {
            int studentId = 0;
            int mentorId = 0;

            if (UserRole == "student")
            {
                var student = await _context.Students.AsNoTracking().FirstOrDefaultAsync(s => s.UserId == UserId);
                if (student == null) return Unauthorized();
                studentId = student.StudentId;
                mentorId = targetId;
            }
            else if (UserRole == "mentor")
            {
                var mentor = await _context.Mentors.AsNoTracking().FirstOrDefaultAsync(m => m.UserId == UserId);
                if (mentor == null) return Unauthorized();
                mentorId = mentor.MentorId;
                studentId = targetId;
            }
            else return Forbid();

            // Validate that they are actually enrolled
            var isEnrolled = await _context.MentorStudents
                .AnyAsync(ms => ms.StudentId == studentId && ms.MentorId == mentorId);
            
            if (!isEnrolled) return Forbid("You can only chat with enrolled mentors/students.");

            var messages = await _context.QAMessages
                .Where(q => q.StudentId == studentId && q.MentorId == mentorId)
                .OrderBy(q => q.SentAt)
                .Select(q => new
                {
                    q.Id,
                    q.SenderType,
                    q.MessageText,
                    q.SentAt
                })
                .ToListAsync();

            return Ok(messages);
        }

        [HttpPost("{targetId}")]
        public async Task<IActionResult> SendMessage(int targetId, [FromBody] SendMessageDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Text)) return BadRequest("Message cannot be empty");

            int studentId = 0;
            int mentorId = 0;

            if (UserRole == "student")
            {
                var student = await _context.Students.AsNoTracking().FirstOrDefaultAsync(s => s.UserId == UserId);
                if (student == null) return Unauthorized();
                studentId = student.StudentId;
                mentorId = targetId;
            }
            else if (UserRole == "mentor")
            {
                var mentor = await _context.Mentors.AsNoTracking().FirstOrDefaultAsync(m => m.UserId == UserId);
                if (mentor == null) return Unauthorized();
                mentorId = mentor.MentorId;
                studentId = targetId;
            }
            else return Forbid();

            var isEnrolled = await _context.MentorStudents
                .AnyAsync(ms => ms.StudentId == studentId && ms.MentorId == mentorId);
            
            if (!isEnrolled) return Forbid("You can only chat with enrolled mentors/students.");

            var msg = new QAMessage
            {
                StudentId = studentId,
                MentorId = mentorId,
                SenderType = UserRole == "student" ? "Student" : "Mentor",
                MessageText = dto.Text,
                SentAt = DateTime.UtcNow
            };

            _context.QAMessages.Add(msg);
            
            // Build notification to the other party
            int notifyUserId = 0;
            if (UserRole == "student") {
                notifyUserId = await _context.Mentors.Where(m => m.MentorId == mentorId).Select(m => m.UserId).FirstOrDefaultAsync();
            } else {
                var stu = await _context.Students.FirstOrDefaultAsync(s => s.StudentId == studentId);
                if (stu != null && stu.UserId.HasValue) notifyUserId = stu.UserId.Value;
            }

            if (notifyUserId != 0) {
                var senderName = await _context.Users.Where(u => u.UserId == UserId).Select(u => u.Name).FirstOrDefaultAsync();
                _context.Notifications.Add(new Notification {
                    UserId = notifyUserId,
                    Message = $"{senderName} sent you a new chat message."
                });
            }

            await _context.SaveChangesAsync();

            return Ok(new { msg.Id, msg.SenderType, msg.MessageText, msg.SentAt });
        }
    }
}
