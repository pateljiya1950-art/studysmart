using System;

namespace ReactApp1.Server.DTOs.Admin
{
    public class MentorStudentAdminDto
    {
        public int Id { get; set; }
        public int MentorId { get; set; }
        public string MentorName { get; set; } = null!;
        public int StudentId { get; set; }
        public string StudentName { get; set; } = null!;
        public DateTime? AssignedAt { get; set; }
    }

    public class MentorStudentCreateDto
    {
        public int MentorId { get; set; }
        public int StudentId { get; set; }
    }

    public class MissingSubmissionAdminDto
    {
        public int StudentId { get; set; }
        public string StudentName { get; set; } = null!;
        public int AssignmentId { get; set; }
        public string AssignmentTitle { get; set; } = null!;
        public int MentorId { get; set; }
        public string MentorName { get; set; } = null!;
    }

    public class InvalidSubmissionAdminDto
    {
        public int SubmissionId { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; } = null!;
        public int AssignmentId { get; set; }
        public string AssignmentTitle { get; set; } = null!;
        public string? FilePath { get; set; }
    }

    public class GoalFixDto
    {
        public int GoalId { get; set; }
        public string Status { get; set; } = null!;
    }

    public class SessionConflictAdminDto
    {
        public int SessionId1 { get; set; }
        public int SessionId2 { get; set; }
        public int MentorId { get; set; }
        public string MentorName { get; set; } = null!;
        public string SessionDate { get; set; } = null!;
        public string StartTime1 { get; set; } = null!;
        public string StartTime2 { get; set; } = null!;
    }

    public class ChatMessageAdminDto
    {
        public int MessageId { get; set; }
        public int SenderId { get; set; }
        public string SenderName { get; set; } = null!;
        public int ReceiverId { get; set; }
        public string ReceiverName { get; set; } = null!;
        public string MessageText { get; set; } = null!;
        public DateTime? SentAt { get; set; }
    }

    public class SkillAdminDto
    {
        public int SkillId { get; set; }
        public string SkillName { get; set; } = null!;
    }

    public class SkillCreateUpdateDto
    {
        public string SkillName { get; set; } = null!;
    }

    public class NotificationAdminDto
    {
        public int NotifyId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = null!;
        public string Message { get; set; } = null!;
        public bool? IsRead { get; set; }
        public DateTime? CreatedAt { get; set; }
    }

    public class NotificationResendDto
    {
        public int NotifyId { get; set; }
    }
}
