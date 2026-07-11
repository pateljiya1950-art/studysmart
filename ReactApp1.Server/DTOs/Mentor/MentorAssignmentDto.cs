namespace ReactApp1.Server.DTOs.Mentor
{
    public class MentorAssignmentDto
    {
        public int AssignmentId { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public DateOnly? DueDate { get; set; }
        public int SubmissionCount { get; set; }
    }
}
