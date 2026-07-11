using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.DTOs.Mentor;
using ReactApp1.Server.Models;
using System.Security.Claims;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/mentor/availability")]
    [Authorize(Roles = "mentor")]
    public class MentorAvailabilityController : ControllerBase
    {
        private readonly StudentdbContext _context;

        public MentorAvailabilityController(StudentdbContext context)
        {
            _context = context;
        }

        private int? UserId
        {
            get
            {
                var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                return int.TryParse(claim, out var id) ? id : (int?)null;
            }
        }

        // Must match the DB CHECK constraint on day_of_week column
        private static readonly string[] ValidDays =
            { "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" };

        // ─────────────── GET ───────────────
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                if (UserId == null) return Unauthorized(new { message = "Invalid token" });

                var mentor = await _context.Mentors
                    .FirstOrDefaultAsync(m => m.UserId == UserId);

                if (mentor == null)
                    return Ok(new List<object>());   // no profile yet → empty list

                // Fetch in-memory, then project (avoids TimeOnly LINQ translation issues)
                var slots = await _context.MentorAvailabilities
                    .Where(a => a.MentorId == mentor.MentorId)
                    .ToListAsync();

                var result = slots
                    .OrderBy(a => Array.IndexOf(ValidDays, a.DayOfWeek))  // Mon, Tue, Wed...
                    .Select(a => new
                    {
                        a.AvailabilityId,
                        a.DayOfWeek,   // returns "Mon", "Tue" etc. — frontend maps to full name
                        StartTime = a.StartTime.HasValue ? a.StartTime.Value.ToString("HH:mm") : "",
                        EndTime   = a.EndTime.HasValue   ? a.EndTime.Value.ToString("HH:mm")   : "",
                        a.IsActive
                    });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to load availability.", error = ex.Message });
            }
        }

        // ─────────────── ADD ───────────────
        [HttpPost]
        public async Task<IActionResult> AddSlot([FromBody] MentorAvailabilityDto dto)
        {
            try
            {
                if (UserId == null) return Unauthorized(new { message = "Invalid token" });

                if (dto == null)
                    return BadRequest(new { message = "Request body is required." });

                // 1. Validate day code (must match DB CHECK constraint)
                var normalizedDay = ValidDays
                    .FirstOrDefault(d => d.Equals(dto.DayOfWeek?.Trim(), StringComparison.OrdinalIgnoreCase));

                if (normalizedDay == null)
                    return BadRequest(new { message = $"Invalid day '{dto.DayOfWeek}'. Must be one of: Mon, Tue, Wed, Thu, Fri, Sat." });

                // 2. Parse times
                if (!TimeOnly.TryParse(dto.StartTime, out var startTime))
                    return BadRequest(new { message = $"Invalid start time '{dto.StartTime}'. Expected HH:mm." });

                if (!TimeOnly.TryParse(dto.EndTime, out var endTime))
                    return BadRequest(new { message = $"Invalid end time '{dto.EndTime}'. Expected HH:mm." });

                if (startTime >= endTime)
                    return BadRequest(new { message = "Start time must be before end time." });

                // 3. Get or auto-create mentor row
                var mentor = await _context.Mentors
                    .FirstOrDefaultAsync(m => m.UserId == UserId);

                if (mentor == null)
                {
                    mentor = new Mentor { UserId = UserId!.Value, CreatedBy = UserId };
                    _context.Mentors.Add(mentor);
                    await _context.SaveChangesAsync();
                }

                // 4. Overlap check — fetch list then compare in memory
                var existingForDay = await _context.MentorAvailabilities
                    .Where(a => a.MentorId == mentor.MentorId && a.DayOfWeek == normalizedDay)
                    .ToListAsync();

                bool overlaps = existingForDay.Any(a =>
                    a.StartTime.HasValue && a.EndTime.HasValue &&
                    startTime < a.EndTime.Value && endTime > a.StartTime.Value);

                if (overlaps)
                    return BadRequest(new { message = "This time slot overlaps with an existing slot on " + normalizedDay + "." });

                // 5. Save — use raw SQL to avoid TimeOnly EF Core type issues
                var startStr = startTime.ToString("HH:mm:ss");
                var endStr   = endTime.ToString("HH:mm:ss");

                await _context.Database.ExecuteSqlRawAsync(
                    @"INSERT INTO Mentor_Availability
                        (mentor_id, day_of_week, start_time, end_time, is_active, created_by)
                      VALUES
                        ({0}, {1}, {2}, {3}, 1, {4})",
                    mentor.MentorId,
                    normalizedDay,
                    startStr,
                    endStr,
                    UserId
                );

                return Ok(new
                {
                    message   = "Slot added successfully.",
                    dayOfWeek = normalizedDay,
                    startTime = startTime.ToString("HH:mm"),
                    endTime   = endTime.ToString("HH:mm")
                });
            }
            catch (Exception ex)
            {
                var inner = ex.InnerException?.Message ?? "";
                return StatusCode(500, new
                {
                    message = "Server error while adding slot.",
                    error   = ex.Message + (inner.Length > 0 ? " | " + inner : "")
                });
            }
        }

        // ─────────────── DELETE ───────────────
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSlot(int id)
        {
            try
            {
                if (UserId == null) return Unauthorized(new { message = "Invalid token" });

                var mentor = await _context.Mentors
                    .FirstOrDefaultAsync(m => m.UserId == UserId);

                if (mentor == null)
                    return NotFound(new { message = "Mentor profile not found." });

                var slot = await _context.MentorAvailabilities
                    .FirstOrDefaultAsync(a => a.AvailabilityId == id && a.MentorId == mentor.MentorId);

                if (slot == null)
                    return NotFound(new { message = "Slot not found." });

                _context.MentorAvailabilities.Remove(slot);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Slot removed." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Server error while deleting slot.", error = ex.Message });
            }
        }
    }
}
