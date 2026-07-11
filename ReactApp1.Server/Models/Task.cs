using System;
using System.Collections.Generic;

namespace ReactApp1.Server.Models;

public partial class Task
{
    public int TaskId { get; set; }

    public int UserId { get; set; }

    public string? Title { get; set; }

    public DateOnly? DueDate { get; set; }

    public string? Status { get; set; }

    public int? CreatedBy { get; set; }

    public int? ModifiedBy { get; set; }

    public DateTime? ModifiedAt { get; set; }

    public virtual User? CreatedByNavigation { get; set; }

    public virtual User? ModifiedByNavigation { get; set; }

    public virtual User? User { get; set; }
}
