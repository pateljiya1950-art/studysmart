using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.Models;
using ReactApp1.Server.DTOs.Student;
using System.Security.Claims;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/student/materials")]
    [Authorize(Roles = "student")]
    public class StudentMaterialsController : ControllerBase
    {
        private readonly StudentdbContext _context;

        public StudentMaterialsController(StudentdbContext context)
        {
            _context = context;
        }

        private int UserId =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<IActionResult> GetMaterials()
        {
            var materials = await _context.Materials
                .Where(m => m.UserId == UserId)
                .OrderByDescending(m => m.UploadedAt)
                .Select(m => new {
                    m.MaterialId,
                    m.Title,
                    m.FilePath,
                    m.UploadedAt
                })
                .ToListAsync();

            return Ok(materials);
        }

        [HttpPost]
        public async Task<IActionResult> AddMaterial(MaterialCreateDto dto)
        {
            var material = new Material
            {
                UserId = UserId,
                Title = dto.Title,
                FilePath = dto.FilePath,
                CreatedBy = UserId
            };

            _context.Materials.Add(material);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Material added successfully" });
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadMaterial([FromForm] MaterialUploadDto request)
        {
            var file = request.File;
            var title = request.Title;

            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            // Ensure wwwroot/uploads/materials exists
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "materials");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            // Generate unique filename securely
            var uniqueFileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(file.FileName);
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Create record
            var material = new Material
            {
                UserId = UserId,
                Title = title,
                FilePath = $"/uploads/materials/{uniqueFileName}", // Served via app.UseStaticFiles()
                CreatedBy = UserId
            };

            _context.Materials.Add(material);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Material uploaded successfully" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMaterial(int id)
        {
            var material = await _context.Materials
                .FirstOrDefaultAsync(m => m.MaterialId == id && m.UserId == UserId);

            if (material == null)
                return NotFound();

            _context.Materials.Remove(material);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}