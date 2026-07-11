using System;
using System.Text.Json.Serialization;

namespace ReactApp1.Server.Models;

public partial class ExamSubmission
{
    public int SubmissionId { get; set; }
    public int AssignmentId { get; set; }
    public int StudentId { get; set; }
    public decimal? Score { get; set; }
    public decimal? AiScore { get; set; }
    public int? CheatingViolations { get; set; } = 0;
    public DateTime? SubmittedAt { get; set; }

    [JsonIgnore]
    public virtual ExamAssignment ExamAssignment { get; set; } = null!;

    [JsonIgnore]
    public virtual Student Student { get; set; } = null!;

    [JsonIgnore]
    public virtual ICollection<ExamAnswer> ExamAnswers { get; set; } = new List<ExamAnswer>();
}
