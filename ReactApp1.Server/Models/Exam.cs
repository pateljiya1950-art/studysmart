using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace ReactApp1.Server.Models;

public partial class Exam
{
    public int ExamId { get; set; }
    public string Title { get; set; } = null!;
    public string Subject { get; set; } = null!;
    public DateOnly ExamDate { get; set; }
    public int Duration { get; set; } // stored in minutes
    public int CreatedBy { get; set; } // mentor_id
    public string? DifficultyLevel { get; set; } = "Medium";

    [JsonIgnore]
    public virtual Mentor Mentor { get; set; } = null!;

    [JsonIgnore]
    public virtual ICollection<ExamAssignment> ExamAssignments { get; set; } = new List<ExamAssignment>();

    [JsonIgnore]
    public virtual ICollection<ExamQuestion> ExamQuestions { get; set; } = new List<ExamQuestion>();
}
