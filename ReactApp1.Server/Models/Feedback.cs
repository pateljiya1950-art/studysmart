using System;
using System.Collections.Generic;

namespace ReactApp1.Server.Models;

public partial class Feedback
{
    public int FeedbackId { get; set; }

    public int MentorId { get; set; }

    public int StudentId { get; set; }

    public string? Feedback1 { get; set; }

    public DateTime? CreatedAt { get; set; }

    public int? CreatedBy { get; set; }

    public int? ModifiedBy { get; set; }

    public DateTime? ModifiedAt { get; set; }

    public virtual User? CreatedByNavigation { get; set; }

    public virtual Mentor Mentor { get; set; } = null!;

    public virtual User? ModifiedByNavigation { get; set; }

    public virtual Student Student { get; set; } = null!;
}
