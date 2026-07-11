namespace ReactApp1.Server.DTOs.Student
{
    public class StudentProfileUpdateDto
    {
        public string Course { get; set; } = "";
        public int? Semester { get; set; }
        public string University { get; set; } = "";
    }
}
