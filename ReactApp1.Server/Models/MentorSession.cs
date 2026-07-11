using System;
using System.Collections.Generic;

namespace ReactApp1.Server.Models;

public partial class MentorSession
{
    public int SessionId { get; set; }

    public int MentorId { get; set; }

    public int StudentId { get; set; }

    // Legacy single-datetime field (kept for backwards compatibility)
    public DateTime? ScheduledDatetime { get; set; }

    // ── New scheduling fields ──────────────────────────────────
    public string? Title { get; set; }

    // Date stored as "YYYY-MM-DD"
    public string? SessionDate { get; set; }

    // Times stored as "HH:mm"
    public string? StartTime { get; set; }

    public string? EndTime { get; set; }

    public string? MeetingLink { get; set; }
    // ─────────────────────────────────────────────────────────

    public string? SessionStatus { get; set; }

    public int? CreatedBy { get; set; }

    public int? ModifiedBy { get; set; }

    public DateTime? ModifiedAt { get; set; }

    public virtual User? CreatedByNavigation { get; set; }

    public virtual Mentor Mentor { get; set; } = null!;

    public virtual User? ModifiedByNavigation { get; set; }

    public virtual Student Student { get; set; } = null!;
}

