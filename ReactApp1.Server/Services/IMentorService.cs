using ReactApp1.Server.DTOs.Mentor;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.Services
{
    public interface IMentorService
    {
        Task<MentorProfileDto?> GetMentorProfileAsync(int userId);
        Task<bool> HasProfileAsync(int userId);
        System.Threading.Tasks.Task UpdateMentorProfileAsync(int userId, MentorProfileDto profileDto);

        // ── Skills ─────────────────────────────────────────────────
        Task<IEnumerable<SkillListItemDto>> GetAllActiveSkillsAsync();
        Task<IEnumerable<MentorSkillResponseDto>> GetMentorSkillsAsync(int userId);

        /// <summary>Map an existing predefined skill to this mentor (transactional).</summary>
        Task<MentorSkillResponseDto> AddSkillAsync(int userId, AddSkillDto dto);

        /// <summary>Insert a new custom skill into Subjects_Skills, then map it (transactional).</summary>
        Task<MentorSkillResponseDto> AddCustomSkillAsync(int userId, AddCustomSkillDto dto);

        /// <summary>
        /// Remove from Mentor_Skills.
        /// If the skill is custom and no other mentor uses it, also purge from Subjects_Skills.
        /// Transactional.
        /// </summary>
        System.Threading.Tasks.Task DeleteSkillAsync(int userId, int skillId);

        // Legacy overload kept so existing callers still compile
        System.Threading.Tasks.Task AddMentorSkillsAsync(int userId, List<MentorSkillDto> skills);
        System.Threading.Tasks.Task RemoveMentorSkillAsync(int userId, int skillId);
    }
}
