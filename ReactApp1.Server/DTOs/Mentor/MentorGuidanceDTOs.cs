using System;
using System.ComponentModel.DataAnnotations;

namespace ReactApp1.Server.DTOs.Mentor
{
    public class CreateMentorTaskDto
    {
        [Required]
        public int StudentId { get; set; }

        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = null!;

        public DateOnly? DueDate { get; set; }
    }

    public class CreateMentorAssignmentDto
    {
        [Required]
        public int StudentId { get; set; }

        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = null!;

        public DateOnly? DueDate { get; set; }
    }

    public class CreateMentorFeedbackDto
    {
        [Required]
        public int StudentId { get; set; }

        [Required]
        public string FeedbackText { get; set; } = null!;
    }
}
