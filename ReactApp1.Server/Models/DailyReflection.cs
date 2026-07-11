using System;
using System.Collections.Generic;

namespace ReactApp1.Server.Models;

public partial class DailyReflection
{
    public int ReflectionId { get; set; }

    public int StudentId { get; set; }

    public DateOnly? Date { get; set; }

    public string? Mood { get; set; }

    public string? Challenges { get; set; }

    public string? ImprovementPlan { get; set; }

    public virtual Student Student { get; set; } = null!;
}
