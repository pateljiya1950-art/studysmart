using System;

namespace ReactApp1.Server.DTOs.Mentor
{
    public class AssignmentSubmissionViewDto
    {
        public int SubmissionId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public DateTime? SubmittedAt { get; set; }
        public string? FilePath { get; set; }
    }
}
