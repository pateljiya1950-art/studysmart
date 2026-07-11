using System;
using System.Collections.Generic;

namespace ReactApp1.Server.Models;

public partial class StudySession
{
    public int SessionId { get; set; }

    public int UserId { get; set; }

    public string? Subject { get; set; }

    public int? DurationMin { get; set; }

    public DateOnly? SessionDate { get; set; }

    public virtual User User { get; set; } = null!;
}
