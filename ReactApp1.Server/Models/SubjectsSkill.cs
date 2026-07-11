using System;
using System.Collections.Generic;

namespace ReactApp1.Server.Models;

public partial class SubjectsSkill
{
    public int SkillId { get; set; }

    public string SkillName { get; set; } = null!;

    public string SkillType { get; set; } = null!;

    public bool IsActive { get; set; }

    /// <summary>
    /// false = predefined system skill, true = mentor-created custom skill
    /// </summary>
    public bool IsCustom { get; set; }

    public int? CreatedBy { get; set; }

    public int? ModifiedBy { get; set; }

    public DateTime? ModifiedAt { get; set; }

    public virtual User? CreatedByNavigation { get; set; }

    public virtual ICollection<MentorRequest> MentorRequests { get; set; } = new List<MentorRequest>();

    public virtual ICollection<MentorSkill> MentorSkills { get; set; } = new List<MentorSkill>();

    public virtual User? ModifiedByNavigation { get; set; }
}
