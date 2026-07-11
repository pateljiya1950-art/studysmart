using System;

namespace ReactApp1.Server.DTOs.Admin
{
    public class RoleUpdateDto
    {
        public string Role { get; set; } = null!;
    }

    public class MentorAdminDto
    {
        public int MentorId { get; set; }
        public int UserId { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Department { get; set; } = null!;
        public int TotalStudents { get; set; }
        public decimal AvgRating { get; set; }
        public bool Status { get; set; }
    }

    public class StudentAdminDto
    {
        public int StudentId { get; set; }
        public int UserId { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Course { get; set; } = null!;
        public int StudyMinutes { get; set; }
        public decimal ProductivityScore { get; set; }
        public bool Status { get; set; }
    }

    public class RequestAdminDto
    {
        public int RequestId { get; set; }
        public string StudentName { get; set; } = null!;
        public string MentorName { get; set; } = null!;
        public string Status { get; set; } = null!;
        public DateTime RequestedAt { get; set; }
    }

    public class SessionAdminDto
    {
        public int SessionId { get; set; }
        public string Title { get; set; } = null!;
        public string MentorName { get; set; } = null!;
        public string StudentName { get; set; } = null!;
        public string SessionDate { get; set; } = null!;
        public string StartTime { get; set; } = null!;
        public string Status { get; set; } = null!;
    }

    public class AssignmentAdminDto
    {
        public int AssignmentId { get; set; }
        public string Title { get; set; } = null!;
        public string MentorName { get; set; } = null!;
        public DateOnly? DueDate { get; set; }
        public int SubmissionsCount { get; set; }
    }

    public class SubmissionAdminDto
    {
        public int SubmissionId { get; set; }
        public string AssignmentTitle { get; set; } = null!;
        public string StudentName { get; set; } = null!;
        public DateTime? SubmittedAt { get; set; }
    }

    public class DashboardStatsDto
    {
        public int TotalUsers { get; set; }
        public int ActiveUsers { get; set; }
        public int TotalMentors { get; set; }
        public int TotalStudents { get; set; }
        public int TotalSessions { get; set; }
        public decimal AvgSystemRating { get; set; }
    }

    public class AnnouncementCreateDto
    {
        public string Message { get; set; } = null!;
    }
}
