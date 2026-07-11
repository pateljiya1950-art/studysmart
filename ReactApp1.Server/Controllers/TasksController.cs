using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.DTOs.Student;
using ReactApp1.Server.Models;
using System.Security.Claims;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/tasks")]
    [Authorize(Roles = "student")]
    public class TasksController : ControllerBase
    {
        private readonly StudentdbContext _context;

        public TasksController(StudentdbContext context)
        {
            _context = context;
        }

        private int UserId =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // ================= GET TASKS =================
        [HttpGet]
        public async System.Threading.Tasks.Task<IActionResult> GetTasks()
        {
            var tasks = await _context.Tasks
                .Include(t => t.CreatedByNavigation)
                .Where(t => t.UserId == UserId)
                .OrderByDescending(t => t.DueDate)
                .Select(t => new
                {
                    t.TaskId,
                    t.Title,
                    t.DueDate,
                    t.Status,
                    isMentorTask = t.CreatedBy != null && t.CreatedBy != UserId,
                    mentorName = (t.CreatedBy != null && t.CreatedBy != UserId) ? t.CreatedByNavigation.Name : null
                })
                .ToListAsync();

            return Ok(tasks);
        }

        // ================= ADD TASK =================
        [HttpPost]
        public async System.Threading.Tasks.Task<IActionResult> AddTask([FromBody] TaskCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Title))
                return BadRequest("Title is required");

            var task = new ReactApp1.Server.Models.Task
            {
                UserId = UserId,
                Title = dto.Title,
                DueDate = dto.DueDate.HasValue
                    ? DateOnly.FromDateTime(dto.DueDate.Value)
                    : null,
                Status = "Pending"
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            return Ok(task);
        }

        // ================= COMPLETE TASK =================
        [HttpPut("{id}/complete")]
        public async System.Threading.Tasks.Task<IActionResult> CompleteTask(int id)
        {
            var task = await _context.Tasks
                .FirstOrDefaultAsync(t => t.TaskId == id && t.UserId == UserId);

            if (task == null)
                return NotFound();

            task.Status = "Completed";
            await _context.SaveChangesAsync();

            return Ok();
        }

        // ================= DELETE TASK =================
        [HttpDelete("{id}")]
        public async System.Threading.Tasks.Task<IActionResult> DeleteTask(int id)
        {
            var task = await _context.Tasks
                .FirstOrDefaultAsync(t => t.TaskId == id && t.UserId == UserId);

            if (task == null)
                return NotFound();

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}