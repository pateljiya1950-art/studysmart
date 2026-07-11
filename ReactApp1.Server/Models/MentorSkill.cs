using System;
using System.Collections.Generic;

namespace ReactApp1.Server.Models;

public partial class MentorSkill
{
    public int MentorSkillId { get; set; }

    public int MentorId { get; set; }

    public int SkillId { get; set; }

    public string? ProficiencyLevel { get; set; }

    public int? ExperienceYears { get; set; }

    public int? CreatedBy { get; set; }

    public int? ModifiedBy { get; set; }

    public DateTime? ModifiedAt { get; set; }

    public virtual User? CreatedByNavigation { get; set; }

    public virtual Mentor Mentor { get; set; } = null!;

    public virtual User? ModifiedByNavigation { get; set; }

    public virtual SubjectsSkill Skill { get; set; } = null!;
}
