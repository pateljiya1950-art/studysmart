using System;
using System.Collections.Generic;

namespace ReactApp1.Server.Models;

public partial class Note
{
    public int NoteId { get; set; }

    public int UserId { get; set; }

    public string? Title { get; set; }

    public string? Content { get; set; }

    public virtual User User { get; set; } = null!;
}
