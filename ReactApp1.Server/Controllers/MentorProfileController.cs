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
    public class MentorProfileController : ControllerBase
    {
        private readonly IMentorService _mentorService;

        public MentorProfileController(IMentorService mentorService)
        {
            _mentorService = mentorService;
        }

        private int UserId =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // GET api/mentor/profile
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var profile = await _mentorService.GetMentorProfileAsync(UserId);
            return Ok(profile ?? new MentorProfileDto());
        }

        // GET api/mentor/has-profile
        [HttpGet("has-profile")]
        public async Task<IActionResult> HasProfile()
        {
            var exists = await _mentorService.HasProfileAsync(UserId);
            return Ok(new { hasProfile = exists });
        }

        // PUT api/mentor/profile
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile(MentorProfileDto dto)
        {
            await _mentorService.UpdateMentorProfileAsync(UserId, dto);
            return Ok(new { message = "Profile updated successfully" });
        }
    }
}