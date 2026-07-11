using System;
using System.Collections.Generic;

namespace ReactApp1.Server.Models;

public partial class Announcement
{
    public int AnnouncementId { get; set; }

    public int AdminId { get; set; }

    public string? Message { get; set; }

    public DateTime? CreatedAt { get; set; }

    public int? CreatedBy { get; set; }

    public int? ModifiedBy { get; set; }

    public DateTime? ModifiedAt { get; set; }

    public virtual User Admin { get; set; } = null!;

    public virtual User? CreatedByNavigation { get; set; }

    public virtual User? ModifiedByNavigation { get; set; }
}
