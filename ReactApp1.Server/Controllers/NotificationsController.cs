using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;
using System.Security.Claims;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/notifications")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly StudentdbContext _context;

        public NotificationsController(StudentdbContext context)
        {
            _context = context;
        }

        private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // GET all notifications for the user
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == UserId)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new
                {
                    n.NotifyId,
                    n.Message,
                    n.IsRead,
                    n.CreatedAt
                })
                .ToListAsync();

            return Ok(notifications);
        }

        // PATCH mark one as read
        [HttpPatch("{id}/read")]
        public async Task<IActionResult> MarkRead(int id)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.NotifyId == id && n.UserId == UserId);

            if (notification == null)
                return NotFound();

            notification.IsRead = true;
            await _context.SaveChangesAsync();
            return Ok();
        }

        // PATCH mark all as read
        [HttpPatch("read-all")]
        public async Task<IActionResult> MarkAllRead()
        {
            var unread = await _context.Notifications
                .Where(n => n.UserId == UserId && n.IsRead != true)
                .ToListAsync();

            foreach (var n in unread)
                n.IsRead = true;

            await _context.SaveChangesAsync();
            return Ok(new { count = unread.Count });
        }
    }
}
