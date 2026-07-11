using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReactApp1.Server.DTOs.Mentor;
using ReactApp1.Server.Services;
using System.Security.Claims;

namespace ReactApp1.Server.Controllers
{
    /// <summary>
    /// POST /api/mentor/assignments   – create a new assignment
    /// GET  /api/mentor/assignments   – list assignments created by this mentor
    /// </summary>
    [ApiController]
    [Route("api/mentor/assignments")]
    [Authorize(Roles = "mentor")]
    public class MentorAssignmentsController : ControllerBase
    {
        private readonly IExamAssignmentService _service;

        public MentorAssignmentsController(IExamAssignmentService service)
        {
            _service = service;
        }

        private int UserId =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // POST /api/mentor/assignments
        [HttpPost]
        public async Task<IActionResult> CreateAssignment([FromBody] CreateAssignmentDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var created = await _service.CreateAssignmentAsync(UserId, dto);
                return StatusCode(StatusCodes.Status201Created, created);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // GET /api/mentor/assignments
        [HttpGet]
        public async Task<IActionResult> GetMyAssignments()
        {
            var assignments = await _service.GetMentorAssignmentsAsync(UserId);
            return Ok(assignments);
        }

        // GET /api/mentor/assignments/{assignmentId}/submissions
        [HttpGet("{assignmentId}/submissions")]
        public async Task<IActionResult> GetAssignmentSubmissions(int assignmentId)
        {
            var submissions = await _service.GetAssignmentSubmissionsAsync(UserId, assignmentId);
            return Ok(submissions);
        }

        // DELETE /api/mentor/assignments/{assignmentId}
        [HttpDelete("{assignmentId}")]
        public async Task<IActionResult> DeleteAssignment(int assignmentId)
        {
            var success = await _service.DeleteAssignmentAsync(UserId, assignmentId);
            if (!success)
                return NotFound(new { message = "Assignment not found or you do not have permission to delete it." });
            return NoContent();
        }
    }
}
