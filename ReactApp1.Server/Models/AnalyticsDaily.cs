using System;
using System.Collections.Generic;

namespace ReactApp1.Server.Models;

public partial class AnalyticsDaily
{
    public int AnalyticsId { get; set; }

    public int UserId { get; set; }

    public DateOnly? Date { get; set; }

    public int? StudyMinutes { get; set; }

    public int? CompletedTasks { get; set; }

    public virtual User User { get; set; } = null!;
}
