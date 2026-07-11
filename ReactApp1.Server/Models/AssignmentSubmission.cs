using System;
using System.Collections.Generic;

namespace ReactApp1.Server.Models;

public partial class AssignmentSubmission
{
    public int SubmissionId { get; set; }

    public int AssignmentId { get; set; }

    public int StudentId { get; set; }

    public DateTime? SubmittedAt { get; set; }

    public string? FilePath { get; set; }

    public virtual Assignment Assignment { get; set; } = null!;

    public virtual Student Student { get; set; } = null!;
}
