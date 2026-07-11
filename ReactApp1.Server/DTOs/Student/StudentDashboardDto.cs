namespace ReactApp1.Server.DTOs.Student
{
    public class StudentDashboardDto
    {
        public int CompletedTasks { get; set; }
        public int PendingTasks { get; set; }
        public int StudyMinutesToday { get; set; }
        public decimal ProductivityScore { get; set; }
    }
}
