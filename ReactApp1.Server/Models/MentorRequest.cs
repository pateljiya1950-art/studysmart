using System;
using System.Collections.Generic;

namespace ReactApp1.Server.Models;

public partial class MentorRequest
{
    public int RequestId { get; set; }

    public int StudentId { get; set; }

    public int MentorId { get; set; }

    public int SkillId { get; set; }

    public string? RequestStatus { get; set; }

    public DateTime? RequestedAt { get; set; }

    public DateTime? RespondedAt { get; set; }

    public int? CreatedBy { get; set; }

    public int? ModifiedBy { get; set; }

    public DateTime? ModifiedAt { get; set; }

    public virtual User? CreatedByNavigation { get; set; }

    public virtual Mentor Mentor { get; set; } = null!;

    public virtual User? ModifiedByNavigation { get; set; }

    public virtual SubjectsSkill Skill { get; set; } = null!;

    public virtual Student Student { get; set; } = null!;
}
