using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReactApp1.Server.DTOs.Mentor;
using ReactApp1.Server.Services;
using System.Security.Claims;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/mentor")]
    [Authorize(Roles = "mentor")]
    public class MentorSkillsController : ControllerBase
    {
        private readonly IMentorService _mentorService;

        public MentorSkillsController(IMentorService mentorService)
        {
            _mentorService = mentorService;
        }

        private int UserId =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // ────────────────────────────────────────────────────────────
        // GET  api/mentor/skills
        // ────────────────────────────────────────────────────────────
        [HttpGet("skills")]
        public async Task<IActionResult> GetMentorSkills()
        {
            var skills = await _mentorService.GetMentorSkillsAsync(UserId);
            return Ok(skills);
        }

        // ────────────────────────────────────────────────────────────
        // POST api/mentor/add-skill
        // Body: { skillId, proficiencyLevel, experienceYears }
        // Maps an existing predefined skill to the mentor
        // ────────────────────────────────────────────────────────────
        [HttpPost("add-skill")]
        public async Task<IActionResult> AddSkill([FromBody] AddSkillDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _mentorService.AddSkillAsync(UserId, dto);
                return Ok(new { message = "Skill added successfully.", skill = result });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred.", detail = ex.Message });
            }
        }

        // ────────────────────────────────────────────────────────────
        // POST api/mentor/add-custom-skill
        // Body: { skillName, skillType?, proficiencyLevel, experienceYears }
        // Inserts into Subjects_Skills (is_custom=1) then maps to mentor
        // ────────────────────────────────────────────────────────────
        [HttpPost("add-custom-skill")]
        public async Task<IActionResult> AddCustomSkill([FromBody] AddCustomSkillDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _mentorService.AddCustomSkillAsync(UserId, dto);
                return Ok(new { message = "Custom skill added successfully.", skill = result });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred.", detail = ex.Message });
            }
        }

        // ────────────────────────────────────────────────────────────
        // DELETE api/mentor/delete-skill
        // Body: { skillId }
        // Removes from Mentor_Skills; purges custom orphan from Subjects_Skills
        // ────────────────────────────────────────────────────────────
        [HttpDelete("delete-skill")]
        public async Task<IActionResult> DeleteSkill([FromBody] DeleteSkillDto dto)
        {
            try
            {
                await _mentorService.DeleteSkillAsync(UserId, dto.SkillId);
                return Ok(new { message = "Skill removed successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to remove skill.", detail = ex.Message });
            }
        }

        // ────────────────────────────────────────────────────────────
        // Legacy endpoints kept for backwards compatibility
        // ────────────────────────────────────────────────────────────

        // POST api/mentor/skills  (legacy bulk add)
        [HttpPost("skills")]
        public async Task<IActionResult> AddMentorSkills([FromBody] List<MentorSkillDto> skills)
        {
            try
            {
                await _mentorService.AddMentorSkillsAsync(UserId, skills);
                return Ok(new { message = "Skills added successfully." });
            }
            catch (ArgumentException ex)   { return BadRequest(new { message = ex.Message }); }
            catch (Exception ex)           { return BadRequest(new { message = ex.Message }); }
        }

        // DELETE api/mentor/skills/{id}  (legacy single remove)
        [HttpDelete("skills/{id}")]
        public async Task<IActionResult> RemoveMentorSkill(int id)
        {
            await _mentorService.RemoveMentorSkillAsync(UserId, id);
            return Ok(new { message = "Skill removed successfully." });
        }
    }
}
