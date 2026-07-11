namespace ReactApp1.Server.DTOs.Student
{
    public class MentorDiscoveryDto
    {
        public int MentorId { get; set; }
        public string MentorName { get; set; } = null!;
        public string Skill { get; set; } = null!;
        public string? Proficiency { get; set; }
        public int? ExperienceYears { get; set; }
    }
}
