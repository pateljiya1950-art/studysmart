using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReactApp1.Server.DTOs.Admin;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "admin")]
    public class AdminController : ControllerBase
    {
        private readonly AdminService _adminService;

        public AdminController(AdminService adminService)
        {
            _adminService = adminService;
        }

        private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // ================= USER MANAGEMENT =================
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _adminService.GetUsers();
            return Ok(users);
        }

        [HttpPut("users/{id}/toggle-status")]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            var result = await _adminService.ToggleUserStatus(id);
            if (!result) return NotFound("User not found");
            return Ok(new { message = "User status updated" });
        }

        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> UpdateRole(int id, [FromBody] RoleUpdateDto dto)
        {
            var result = await _adminService.UpdateUserRole(id, dto.Role);
            if (!result) return NotFound("User not found");
            return Ok(new { message = "User role updated" });
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id, [FromQuery] bool softDelete = false)
        {
            if (softDelete)
            {
                var softResult = await _adminService.SoftDeleteUser(id);
                if (!softResult.Success) 
                    return softResult.Error == "User not found." ? NotFound(softResult.Error) : BadRequest(new { message = softResult.Error });
                return Ok(new { message = "User soft-deleted successfully" });
            }

            var result = await _adminService.DeleteUser(id);
            if (!result.Success) 
                return result.Error == "User not found." ? NotFound(result.Error) : BadRequest(new { message = result.Error });
            
            return Ok(new { message = "User deleted successfully" });
        }

        // ================= MENTOR MANAGEMENT =================
        [HttpGet("mentors")]
        public async Task<IActionResult> GetMentors()
        {
            var mentors = await _adminService.GetMentors();
            return Ok(mentors);
        }

        [HttpPut("mentors/{id}/suspend")]
        public async Task<IActionResult> SuspendMentor(int id)
        {
            var result = await _adminService.SuspendMentor(id);
            if (!result) return NotFound("Mentor not found");
            return Ok(new { message = "Mentor suspended" });
        }

        // ================= STUDENT ANALYTICS =================
        [HttpGet("students")]
        public async Task<IActionResult> GetStudents()
        {
            var students = await _adminService.GetStudents();
            return Ok(students);
        }

        // ================= REQUEST MANAGEMENT =================
        [HttpGet("requests")]
        public async Task<IActionResult> GetRequests()
        {
            var requests = await _adminService.GetRequests();
            return Ok(requests);
        }

        [HttpPut("requests/{id}/approve")]
        public async Task<IActionResult> ApproveRequest(int id)
        {
            var result = await _adminService.ApproveRequest(id);
            if (!result) return NotFound("Request not found");
            return Ok(new { message = "Request approved" });
        }

        [HttpPut("requests/{id}/reject")]
        public async Task<IActionResult> RejectRequest(int id)
        {
            var result = await _adminService.RejectRequest(id);
            if (!result) return NotFound("Request not found");
            return Ok(new { message = "Request rejected" });
        }

        // ================= SESSION CONTROL =================
        [HttpGet("sessions")]
        public async Task<IActionResult> GetSessions()
        {
            var sessions = await _adminService.GetSessions();
            return Ok(sessions);
        }

        [HttpPut("sessions/{id}/cancel")]
        public async Task<IActionResult> CancelSession(int id)
        {
            var result = await _adminService.CancelSession(id);
            if (!result) return NotFound("Session not found");
            return Ok(new { message = "Session cancelled" });
        }

        // ================= ASSIGNMENT CONTROL =================
        [HttpGet("assignments")]
        public async Task<IActionResult> GetAssignments()
        {
            var assignments = await _adminService.GetAssignments();
            return Ok(assignments);
        }

        [HttpGet("submissions")]
        public async Task<IActionResult> GetSubmissions()
        {
            var submissions = await _adminService.GetSubmissions();
            return Ok(submissions);
        }

        // ================= ANALYTICS DASHBOARD =================
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var dashboard = await _adminService.GetDashboardStats();
            return Ok(dashboard);
        }

        // ================= ANNOUNCEMENTS =================
        [HttpPost("announcements")]
        public async Task<IActionResult> CreateAnnouncement([FromBody] AnnouncementCreateDto dto)
        {
            var result = await _adminService.CreateAnnouncement(UserId, dto.Message);
            return Ok(new { message = "Announcement sent to all users" });
        }

        // ================= MENTOR-STUDENT CONTROL =================
        [HttpGet("mentor-students")]
        public async Task<IActionResult> GetMentorStudents()
        {
            var data = await _adminService.GetAllMentorStudents();
            return Ok(data);
        }

        [HttpPost("mentor-students")]
        public async Task<IActionResult> AssignMentorStudent([FromBody] MentorStudentCreateDto dto)
        {
            var result = await _adminService.AssignMentorStudent(dto);
            if (!result) return BadRequest("Assignment failed or already exists.");
            return Ok(new { message = "Student assigned to mentor successfully" });
        }

        [HttpDelete("mentor-students/{id}")]
        public async Task<IActionResult> RemoveMentorStudent(int id)
        {
            var result = await _adminService.RemoveMentorStudent(id);
            if (!result) return NotFound("Mapping not found");
            return Ok(new { message = "Mapping removed successfully" });
        }

        // ================= ASSIGNMENT VALIDATION =================
        [HttpGet("assignments/missing-submissions")]
        public async Task<IActionResult> GetMissingSubmissions()
        {
            var data = await _adminService.GetMissingSubmissions();
            return Ok(data);
        }

        [HttpGet("assignments/invalid-submissions")]
        public async Task<IActionResult> GetInvalidSubmissions()
        {
            var data = await _adminService.GetInvalidSubmissions();
            return Ok(data);
        }

        // ================= DATA FIX SYSTEM =================
        [HttpPut("goals/fix-status")]
        public async Task<IActionResult> FixGoalStatus([FromBody] GoalFixDto dto)
        {
            var result = await _adminService.FixGoalStatus(dto);
            if (!result) return NotFound("Goal not found");
            return Ok(new { message = "Goal status fixed successfully" });
        }

        [HttpPost("analytics/recalculate")]
        public async Task<IActionResult> RecalculateAnalytics()
        {
            var result = await _adminService.RecalculateProductivity();
            return Ok(new { message = "Productivity recalculated successfully" });
        }

        // ================= SESSION CONTROL =================
        [HttpGet("sessions/conflicts")]
        public async Task<IActionResult> GetSessionConflicts()
        {
            var data = await _adminService.GetSessionConflicts();
            return Ok(data);
        }

        // ================= CHAT MONITORING =================
        [HttpGet("chats")]
        public async Task<IActionResult> GetAllChats()
        {
            var data = await _adminService.GetAllChats();
            return Ok(data);
        }

        // ================= SKILL MANAGEMENT =================
        [HttpGet("skills")]
        public async Task<IActionResult> GetSkills()
        {
            var skills = await _adminService.GetSkills();
            return Ok(skills);
        }

        [HttpPost("skills")]
        public async Task<IActionResult> CreateSkill([FromBody] SkillCreateUpdateDto dto)
        {
            var result = await _adminService.CreateSkill(dto);
            return Ok(new { message = "Skill created successfully" });
        }

        [HttpPut("skills/{id}")]
        public async Task<IActionResult> UpdateSkill(int id, [FromBody] SkillCreateUpdateDto dto)
        {
            var result = await _adminService.UpdateSkill(id, dto);
            if (!result) return NotFound("Skill not found");
            return Ok(new { message = "Skill updated successfully" });
        }

        [HttpDelete("skills/{id}")]
        public async Task<IActionResult> DeleteSkill(int id)
        {
            var result = await _adminService.DeleteSkill(id);
            if (!result) return NotFound("Skill not found");
            return Ok(new { message = "Skill deleted successfully" });
        }

        // ================= NOTIFICATION CONTROL =================
        [HttpGet("notifications")]
        public async Task<IActionResult> GetNotifications()
        {
            var data = await _adminService.GetAllNotifications();
            return Ok(data);
        }

        [HttpPost("notifications/resend")]
        public async Task<IActionResult> ResendNotification([FromBody] NotificationResendDto dto)
        {
            var result = await _adminService.ResendNotification(dto.NotifyId);
            if (!result) return NotFound("Notification not found");
            return Ok(new { message = "Notification resent successfully" });
        }
    }
}