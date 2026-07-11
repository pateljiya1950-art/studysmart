namespace ReactApp1.Server.DTOs.Student
{
    public class ExamDto
    {
        public int ExamId { get; set; }
        public string? Subject { get; set; }
        public DateOnly? ExamDate { get; set; }
    }
}
