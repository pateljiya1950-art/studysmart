using System;
using System.Collections.Generic;

namespace ReactApp1.Server.Models;

public partial class CalendarEvent
{
    public int EventId { get; set; }

    public int UserId { get; set; }

    public string? Title { get; set; }

    public string? EventType { get; set; }

    public DateOnly? EventDate { get; set; }

    public int? CreatedBy { get; set; }

    public int? ModifiedBy { get; set; }

    public DateTime? ModifiedAt { get; set; }

    public virtual User? CreatedByNavigation { get; set; }

    public virtual User? ModifiedByNavigation { get; set; }

    public virtual User User { get; set; } = null!;
}
