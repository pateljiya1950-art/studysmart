namespace ReactApp1.Server.DTOs.Mentor
{
    public class MentorDashboardDto
    {
        public int ActiveStudents { get; set; }
        public int PendingRequests { get; set; }
        public int TotalSessions { get; set; }
        public decimal AvgStudentRating { get; set; }
    }
}
