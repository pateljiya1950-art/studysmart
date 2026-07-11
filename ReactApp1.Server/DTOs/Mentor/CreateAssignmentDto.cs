using System.ComponentModel.DataAnnotations;

namespace ReactApp1.Server.DTOs.Mentor
{
    public class CreateAssignmentDto
    {
        [Required(ErrorMessage = "Title is required.")]
        [MaxLength(200, ErrorMessage = "Title cannot exceed 200 characters.")]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required(ErrorMessage = "Due date is required.")]
        public DateOnly DueDate { get; set; }
    }
}
