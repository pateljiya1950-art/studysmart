namespace ReactApp1.Server.DTOs.Student
{
    public class StudentMentorFeedbackDto
    {
        public int MentorId { get; set; }
        public decimal Rating { get; set; }   // 1–5
        public string? Comments { get; set; }
    }
}
