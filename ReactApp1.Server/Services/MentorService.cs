using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.DTOs.Mentor;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.Services
{
    public class MentorService : IMentorService
    {
        private readonly StudentdbContext _context;

        private static readonly string[] ValidProficiencies =
            { "Beginner", "Intermediate", "Expert" };

        public MentorService(StudentdbContext context)
        {
            _context = context;
        }

        // ── Profile ────────────────────────────────────────────────

        public async Task<MentorProfileDto?> GetMentorProfileAsync(int userId)
        {
            return await _context.Mentors
                .Where(m => m.UserId == userId)
                .Select(m => new MentorProfileDto
                {
                    Department      = m.Department ?? "",
                    ExperienceYears = m.ExperienceYears,
                    MaxStudents     = m.MaxStudents
                })
                .FirstOrDefaultAsync();
        }

        public async Task<bool> HasProfileAsync(int userId)
            => await _context.Mentors.AnyAsync(m => m.UserId == userId);

        public async System.Threading.Tasks.Task UpdateMentorProfileAsync(int userId, MentorProfileDto dto)
        {
            var mentor = await _context.Mentors.FirstOrDefaultAsync(m => m.UserId == userId);

            if (mentor == null)
            {
                mentor = new Mentor
                {
                    UserId          = userId,
                    Department      = dto.Department,
                    ExperienceYears = dto.ExperienceYears,
                    MaxStudents     = dto.MaxStudents,
                    CreatedBy       = userId
                };
                _context.Mentors.Add(mentor);
            }
            else
            {
                mentor.Department      = dto.Department;
                mentor.ExperienceYears = dto.ExperienceYears;
                mentor.MaxStudents     = dto.MaxStudents;
                mentor.ModifiedBy      = userId;
                mentor.ModifiedAt      = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }

        // ── Skills — queries ───────────────────────────────────────

        public async Task<IEnumerable<SkillListItemDto>> GetAllActiveSkillsAsync()
        {
            return await _context.SubjectsSkills
                .Where(s => s.IsActive)
                .OrderBy(s => s.SkillName)
                .Select(s => new SkillListItemDto
                {
                    SkillId   = s.SkillId,
                    SkillName = s.SkillName,
                    SkillType = s.SkillType,
                    IsCustom  = s.IsCustom
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<MentorSkillResponseDto>> GetMentorSkillsAsync(int userId)
        {
            var mentor = await _context.Mentors.FirstOrDefaultAsync(m => m.UserId == userId);
            if (mentor == null) return Enumerable.Empty<MentorSkillResponseDto>();

            return await _context.MentorSkills
                .Include(ms => ms.Skill)
                .Where(ms => ms.MentorId == mentor.MentorId)
                .Select(ms => new MentorSkillResponseDto
                {
                    MentorSkillId    = ms.MentorSkillId,
                    SkillId          = ms.SkillId,
                    SkillName        = ms.Skill.SkillName,
                    SkillType        = ms.Skill.SkillType,
                    IsCustom         = ms.Skill.IsCustom,
                    ProficiencyLevel = ms.ProficiencyLevel,
                    ExperienceYears  = ms.ExperienceYears
                })
                .ToListAsync();
        }

        // ── Skills — add existing (predefined) ────────────────────

        public async Task<MentorSkillResponseDto> AddSkillAsync(int userId, AddSkillDto dto)
        {
            ValidateProficiency(dto.ProficiencyLevel);

            await using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                var mentor = await RequireMentorAsync(userId);

                // Duplicate guard (case-insensitive handled at DB level via unique key;
                // we do an in-memory check to give a friendlier error message).
                var alreadyMapped = await _context.MentorSkills
                    .AnyAsync(ms => ms.MentorId == mentor.MentorId && ms.SkillId == dto.SkillId);

                if (alreadyMapped)
                    throw new InvalidOperationException("This skill is already on your profile.");

                var skill = await _context.SubjectsSkills.FindAsync(dto.SkillId)
                    ?? throw new KeyNotFoundException($"Skill {dto.SkillId} not found.");

                var entry = new MentorSkill
                {
                    MentorId         = mentor.MentorId,
                    SkillId          = skill.SkillId,
                    ProficiencyLevel = dto.ProficiencyLevel,
                    ExperienceYears  = dto.ExperienceYears,
                    CreatedBy        = userId
                };

                _context.MentorSkills.Add(entry);
                await _context.SaveChangesAsync();
                await tx.CommitAsync();

                return Map(entry, skill);
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        // ── Skills — add custom ────────────────────────────────────

        public async Task<MentorSkillResponseDto> AddCustomSkillAsync(int userId, AddCustomSkillDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.SkillName))
                throw new ArgumentException("Skill name cannot be empty.");

            ValidateProficiency(dto.ProficiencyLevel);

            await using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                var mentor = await RequireMentorAsync(userId);

                // ── Case-insensitive duplicate check in Subjects_Skills ──
                var normalised = dto.SkillName.Trim();
                var existing = await _context.SubjectsSkills
                    .FirstOrDefaultAsync(s =>
                        EF.Functions.Like(s.SkillName, normalised));

                SubjectsSkill skill;

                if (existing != null)
                {
                    // The skill name already exists — just map it (don't duplicate)
                    skill = existing;
                }
                else
                {
                    // Insert the new custom skill
                    skill = new SubjectsSkill
                    {
                        SkillName  = normalised,
                        SkillType  = string.IsNullOrWhiteSpace(dto.SkillType) ? "Skill" : dto.SkillType.Trim(),
                        IsActive   = true,
                        IsCustom   = true,
                        CreatedBy  = userId
                    };
                    _context.SubjectsSkills.Add(skill);
                    await _context.SaveChangesAsync(); // get the new SkillId
                }

                // Duplicate mapping guard
                var alreadyMapped = await _context.MentorSkills
                    .AnyAsync(ms => ms.MentorId == mentor.MentorId && ms.SkillId == skill.SkillId);

                if (alreadyMapped)
                    throw new InvalidOperationException("This skill is already on your profile.");

                var entry = new MentorSkill
                {
                    MentorId         = mentor.MentorId,
                    SkillId          = skill.SkillId,
                    ProficiencyLevel = dto.ProficiencyLevel,
                    ExperienceYears  = dto.ExperienceYears,
                    CreatedBy        = userId
                };

                _context.MentorSkills.Add(entry);
                await _context.SaveChangesAsync();
                await tx.CommitAsync();

                return Map(entry, skill);
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        // ── Skills — delete ────────────────────────────────────────

        public async System.Threading.Tasks.Task DeleteSkillAsync(int userId, int skillId)
        {
            await using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                var mentor = await _context.Mentors.FirstOrDefaultAsync(m => m.UserId == userId);
                if (mentor == null) return;

                var mentorSkill = await _context.MentorSkills
                    .Include(ms => ms.Skill)
                    .FirstOrDefaultAsync(ms => ms.MentorId == mentor.MentorId && ms.SkillId == skillId);

                if (mentorSkill == null) return;

                var skill     = mentorSkill.Skill;
                bool isCustom = skill.IsCustom;

                // 1. Remove the mapping row
                _context.MentorSkills.Remove(mentorSkill);
                await _context.SaveChangesAsync();

                // 2. If custom and orphaned → purge from Subjects_Skills
                if (isCustom)
                {
                    bool stillUsed = await _context.MentorSkills
                        .AnyAsync(ms => ms.SkillId == skillId);

                    if (!stillUsed)
                    {
                        _context.SubjectsSkills.Remove(skill);
                        await _context.SaveChangesAsync();
                    }
                }

                await tx.CommitAsync();
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        // ── Legacy methods (keep existing controller calls compiling) ──

        public async System.Threading.Tasks.Task AddMentorSkillsAsync(int userId, List<MentorSkillDto> skills)
        {
            var mentor = await _context.Mentors.FirstOrDefaultAsync(m => m.UserId == userId)
                ?? throw new Exception("Mentor profile not found. Please create a profile first.");

            var existingSkillIds = await _context.MentorSkills
                .Where(ms => ms.MentorId == mentor.MentorId)
                .Select(ms => ms.SkillId)
                .ToListAsync();

            foreach (var skillDto in skills)
            {
                if (existingSkillIds.Contains(skillDto.SkillId)) continue;

                if (!ValidProficiencies.Contains(skillDto.ProficiencyLevel))
                    throw new ArgumentException($"Invalid proficiency level: {skillDto.ProficiencyLevel}");

                _context.MentorSkills.Add(new MentorSkill
                {
                    MentorId         = mentor.MentorId,
                    SkillId          = skillDto.SkillId,
                    ProficiencyLevel = skillDto.ProficiencyLevel,
                    ExperienceYears  = skillDto.ExperienceYears,
                    CreatedBy        = userId
                });
                existingSkillIds.Add(skillDto.SkillId);
            }

            await _context.SaveChangesAsync();
        }

        public async System.Threading.Tasks.Task RemoveMentorSkillAsync(int userId, int skillId)
            => await DeleteSkillAsync(userId, skillId);

        // ── Helpers ───────────────────────────────────────────────

        private async Task<Mentor> RequireMentorAsync(int userId)
        {
            return await _context.Mentors.FirstOrDefaultAsync(m => m.UserId == userId)
                ?? throw new InvalidOperationException("Mentor profile not found. Please create a profile first.");
        }

        private static void ValidateProficiency(string level)
        {
            if (!ValidProficiencies.Contains(level))
                throw new ArgumentException($"Invalid proficiency level: '{level}'. Must be Beginner, Intermediate, or Expert.");
        }

        private static MentorSkillResponseDto Map(MentorSkill ms, SubjectsSkill skill) =>
            new()
            {
                MentorSkillId    = ms.MentorSkillId,
                SkillId          = skill.SkillId,
                SkillName        = skill.SkillName,
                SkillType        = skill.SkillType,
                IsCustom         = skill.IsCustom,
                ProficiencyLevel = ms.ProficiencyLevel,
                ExperienceYears  = ms.ExperienceYears
            };
    }
}
