namespace ReactApp1.Server.DTOs.Student
{
    public class StudentProfileDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Course { get; set; } = "";
        public int? Semester { get; set; }
        public string University { get; set; } = "";
    }
}
