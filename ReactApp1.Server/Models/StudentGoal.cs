using System;
using System.Collections.Generic;

namespace ReactApp1.Server.Models;

public partial class StudentGoal
{
    public int GoalId { get; set; }

    public int StudentId { get; set; }

    public string? GoalTitle { get; set; }

    public int? TargetTasks { get; set; }

    public int? TargetHours { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public string? GoalStatus { get; set; }

    public int? CreatedBy { get; set; }

    public int? ModifiedBy { get; set; }

    public DateTime? ModifiedAt { get; set; }

    public virtual User? CreatedByNavigation { get; set; }

    public virtual User? ModifiedByNavigation { get; set; }

    public virtual Student Student { get; set; } = null!;
}
