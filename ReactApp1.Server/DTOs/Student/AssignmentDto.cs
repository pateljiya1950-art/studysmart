namespace ReactApp1.Server.DTOs.Student
{
    public class AssignmentDto
    {
        public int AssignmentId { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public DateOnly? DueDate { get; set; }
        public bool IsSubmitted { get; set; }
    }
}
