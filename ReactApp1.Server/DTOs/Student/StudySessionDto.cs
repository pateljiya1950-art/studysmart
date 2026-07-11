namespace ReactApp1.Server.DTOs.Student
{
    public class StudySessionDto
    {
        public string Subject { get; set; } = null!;
        public int DurationMin { get; set; }
        public DateTime Session_date { get; set; }
    }
}
