using System;
using System.Collections.Generic;

namespace ReactApp1.Server.Models;

public partial class PerformanceReport
{
    public int ReportId { get; set; }

    public int UserId { get; set; }

    public decimal ProductivityScore { get; set; }

    public DateOnly? ReportDate { get; set; }

    public virtual User User { get; set; } = null!;
}
