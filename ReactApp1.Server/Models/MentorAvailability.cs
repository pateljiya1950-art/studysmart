using System;
using System.Collections.Generic;

namespace ReactApp1.Server.Models;

public partial class MentorAvailability
{
    public int AvailabilityId { get; set; }

    public int MentorId { get; set; }

    public string DayOfWeek { get; set; } = null!;

    public TimeOnly? StartTime { get; set; }

    public TimeOnly? EndTime { get; set; }

    public bool? IsActive { get; set; }

    public int? CreatedBy { get; set; }

    public int? ModifiedBy { get; set; }

    public DateTime? ModifiedAt { get; set; }

    public virtual User? CreatedByNavigation { get; set; }

    public virtual Mentor Mentor { get; set; } = null!;

    public virtual User? ModifiedByNavigation { get; set; }
}
