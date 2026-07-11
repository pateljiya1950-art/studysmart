using System;
using System.Collections.Generic;

namespace ReactApp1.Server.Models;

public partial class Notification
{
    public int NotifyId { get; set; }

    public int UserId { get; set; }

    public string? Message { get; set; }

    public bool? IsRead { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User User { get; set; } = null!;
}
