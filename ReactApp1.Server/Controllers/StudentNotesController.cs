using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;
using ReactApp1.Server.DTOs.Student;
using System.Security.Claims;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/student/notes")]
    [Authorize(Roles = "student")]
    public class StudentNotesController : ControllerBase
    {
        private readonly StudentdbContext _context;

        public StudentNotesController(StudentdbContext context)
        {
            _context = context;
        }

        private int UserId =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // ================= GET ALL NOTES =================
        [HttpGet]
        public async Task<IActionResult> GetNotes()
        {
            var notes = await _context.Notes
                .Where(n => n.UserId == UserId)
                .OrderByDescending(n => n.NoteId)
                .Select(n => new
                {
                    n.NoteId,
                    n.Title,
                    n.Content
                })
                .ToListAsync();

            return Ok(notes);
        }

        // ================= CREATE NOTE =================
        [HttpPost]
        public async Task<IActionResult> CreateNote([FromBody] NoteCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Title))
                return BadRequest(new { message = "Title is required" });

            var note = new Note
            {
                UserId = UserId,
                Title = dto.Title,
                Content = dto.Content
            };

            _context.Notes.Add(note);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                note.NoteId,
                note.Title,
                note.Content
            });
        }

        // ================= DELETE NOTE =================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNote(int id)
        {
            var note = await _context.Notes
                .FirstOrDefaultAsync(n => n.NoteId == id && n.UserId == UserId);

            if (note == null)
                return NotFound(new { message = "Note not found" });

            _context.Notes.Remove(note);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Note deleted successfully" });
        }
    }
}