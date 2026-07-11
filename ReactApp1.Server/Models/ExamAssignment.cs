using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace ReactApp1.Server.Models;

public partial class ExamAssignment
{
    public int AssignmentId { get; set; }
    public int ExamId { get; set; }
    public int StudentId { get; set; }
    public int AssignedBy { get; set; } // mentor_id
    public DateOnly DueDate { get; set; }
    public string Status { get; set; } = "Pending";

    [JsonIgnore]
    public virtual Exam Exam { get; set; } = null!;

    [JsonIgnore]
    public virtual Student Student { get; set; } = null!;

    [JsonIgnore]
    public virtual Mentor Mentor { get; set; } = null!;

    [JsonIgnore]
    public virtual ICollection<ExamSubmission> ExamSubmissions { get; set; } = new List<ExamSubmission>();
}
