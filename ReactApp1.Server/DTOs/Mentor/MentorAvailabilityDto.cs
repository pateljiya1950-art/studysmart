namespace ReactApp1.Server.DTOs.Mentor
{
    public class MentorAvailabilityDto
    {
        public string DayOfWeek { get; set; } = null!;
        public string StartTime { get; set; } = null!; // Format HH:mm
        public string EndTime { get; set; } = null!;   // Format HH:mm
    }
}
