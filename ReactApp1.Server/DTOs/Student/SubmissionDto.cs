namespace ReactApp1.Server.DTOs.Student
{
    public class SubmissionDto
    {
        public int SubmissionId { get; set; }
        public int AssignmentId { get; set; }
        public int StudentId { get; set; }
        public DateTime? SubmittedAt { get; set; }
    }
}
