using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ReactApp1.Server.Models;

[Table("ExamAnswers")]
public partial class ExamAnswer
{
    public int AnswerId { get; set; }
    public int SubmissionId { get; set; }
    public int QuestionId { get; set; }
    
    public string? SelectedOption { get; set; }
    public string? DescriptiveAnswer { get; set; }
    
    public decimal? Score { get; set; }

    [JsonIgnore]
    public virtual ExamSubmission Submission { get; set; } = null!;

    [JsonIgnore]
    public virtual ExamQuestion Question { get; set; } = null!;
}
