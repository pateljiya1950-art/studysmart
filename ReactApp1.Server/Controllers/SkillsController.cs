using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReactApp1.Server.Services;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/skills")]
    [Authorize] // Can be accessed by any authenticated user
    public class SkillsController : ControllerBase
    {
        private readonly IMentorService _mentorService;

        public SkillsController(IMentorService mentorService)
        {
            _mentorService = mentorService;
        }

        // GET api/skills
        [HttpGet]
        public async Task<IActionResult> GetAllSkills()
        {
            var skills = await _mentorService.GetAllActiveSkillsAsync();
            return Ok(skills);
        }
    }
}
