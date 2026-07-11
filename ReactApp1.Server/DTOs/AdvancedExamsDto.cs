using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ReactApp1.Server.DTOs
{
    public class QuestionCreateDto
    {
        [Required]
        public string Type { get; set; } = null!;
        public string DifficultyLevel { get; set; } = "Medium";
        [Required]
        public string QuestionText { get; set; } = null!;
        public string? OptionA { get; set; }
        public string? OptionB { get; set; }
        public string? OptionC { get; set; }
        public string? OptionD { get; set; }
        public string? CorrectAnswer { get; set; }
    }

    public class ExamCreateDto
    {
        [Required]
        public string Title { get; set; } = null!;
        [Required]
        public string Subject { get; set; } = null!;
        public DateOnly ExamDate { get; set; }
        public int Duration { get; set; }
        public string DifficultyLevel { get; set; } = "Medium";
        public List<QuestionCreateDto> Questions { get; set; } = new();
    }

    public class AIGenerateRequestDto
    {
        [Required]
        public string Subject { get; set; } = null!;
        public string DifficultyLevel { get; set; } = "Medium";
        public int NumberOfQuestions { get; set; } = 5;
    }

    public class ExamSubmitAnswerDto
    {
        public int QuestionId { get; set; }
        public string? SelectedOption { get; set; }
        public string? DescriptiveAnswer { get; set; }
    }

    public class ExamSubmitRequestDto
    {
        public int ExamId { get; set; }
        public int AssignmentId { get; set; }
        public int CheatingViolations { get; set; }
        public List<ExamSubmitAnswerDto> Answers { get; set; } = new();
    }
}
