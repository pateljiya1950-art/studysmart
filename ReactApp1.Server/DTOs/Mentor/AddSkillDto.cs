namespace ReactApp1.Server.DTOs.Mentor
{
    /// <summary>POST /mentor/add-skill  — map an existing predefined skill</summary>
    public class AddSkillDto
    {
        public int    SkillId          { get; set; }
        public string ProficiencyLevel { get; set; } = "Beginner";
        public int    ExperienceYears  { get; set; }
    }

    /// <summary>POST /mentor/add-custom-skill  — create + map a brand-new skill</summary>
    public class AddCustomSkillDto
    {
        public string SkillName        { get; set; } = null!;
        public string SkillType        { get; set; } = "Custom";
        public string ProficiencyLevel { get; set; } = "Beginner";
        public int    ExperienceYears  { get; set; }
    }

    /// <summary>DELETE /mentor/delete-skill  — body payload</summary>
    public class DeleteSkillDto
    {
        public int SkillId { get; set; }
    }

    /// <summary>Unified skill response returned to the frontend</summary>
    public class MentorSkillResponseDto
    {
        public int     MentorSkillId    { get; set; }
        public int     SkillId          { get; set; }
        public string  SkillName        { get; set; } = null!;
        public string  SkillType        { get; set; } = null!;
        public bool    IsCustom         { get; set; }
        public string? ProficiencyLevel { get; set; }
        public int?    ExperienceYears  { get; set; }
    }

    /// <summary>Skill list item returned from GET /skills</summary>
    public class SkillListItemDto
    {
        public int    SkillId   { get; set; }
        public string SkillName { get; set; } = null!;
        public string SkillType { get; set; } = null!;
        public bool   IsCustom  { get; set; }
    }
}
