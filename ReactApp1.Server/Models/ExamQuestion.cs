using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ReactApp1.Server.Models;

[Table("ExamQuestions")]
public partial class ExamQuestion
{
    public int QuestionId { get; set; }
    public int ExamId { get; set; }
    
    // "MCQ" or "Subjective"
    public string Type { get; set; } = null!;
    
    public string DifficultyLevel { get; set; } = "Medium";
    
    public string QuestionText { get; set; } = null!;
    
    // For MCQ
    public string? OptionA { get; set; }
    public string? OptionB { get; set; }
    public string? OptionC { get; set; }
    public string? OptionD { get; set; }
    
    // Correct Option or Keyword reference
    public string? CorrectAnswer { get; set; }

    [JsonIgnore]
    public virtual Exam Exam { get; set; } = null!;
}
