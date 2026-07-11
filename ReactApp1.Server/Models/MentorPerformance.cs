using System;
using System.Collections.Generic;

namespace ReactApp1.Server.Models;

public partial class MentorPerformance
{
    public int MentorPerfId { get; set; }

    public int MentorId { get; set; }

    public DateOnly? PeriodStart { get; set; }

    public DateOnly? PeriodEnd { get; set; }

    public int? StudentsHandled { get; set; }

    public decimal? AvgStudentProductivity { get; set; }

    public int? FeedbackCount { get; set; }

    public decimal? AvgStudentRating { get; set; }

    public virtual Mentor Mentor { get; set; } = null!;
}
