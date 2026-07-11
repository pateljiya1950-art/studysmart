using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReactApp1.Server.Services;
using System.Security.Claims;

namespace ReactApp1.Server.Controllers
{
    /// <summary>
    /// GET  /api/student/assignments              – list all available assignments (based on enrolled mentor)
    /// POST /api/student/assignments/{id}/submit  – submit an assignment (file required)
    /// </summary>
    [ApiController]
    [Route("api/student/assignments")]
    [Authorize(Roles = "student")]
    public class StudentAssignmentsController : ControllerBase
    {
        private readonly IExamAssignmentService _service;

        public StudentAssignmentsController(IExamAssignmentService service)
        {
            _service = service;
        }

        private int UserId =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // GET /api/student/assignments
        [HttpGet]
        public async Task<IActionResult> GetAssignments()
        {
            var assignments = await _service.GetAllAssignmentsAsync(UserId);
            return Ok(assignments);
        }

        // POST /api/student/assignments/{assignmentId}/submit
        [HttpPost("{assignmentId}/submit")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Submit(
            [FromRoute] int assignmentId,
            [FromForm] ReactApp1.Server.DTOs.Student.FileUploadDto dto)
        {
            // Validate file at controller level before hitting the service
            if (dto?.File == null || dto.File.Length == 0)
                return BadRequest(new { message = "A file is required to submit the assignment." });

            var (success, error, result) =
                await _service.SubmitAssignmentAsync(UserId, assignmentId, dto.File);

            if (!success)
            {
                if (error.Contains("not found", StringComparison.OrdinalIgnoreCase))
                    return NotFound(new { message = error });

                return BadRequest(new { message = error });
            }

            return Ok(new { message = "Assignment submitted successfully!", data = result });
        }
    }
}