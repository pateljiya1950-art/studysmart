using System;
using System.Collections.Generic;

namespace ReactApp1.Server.Models;

public partial class Student
{
    public int StudentId { get; set; }

    public int? UserId { get; set; }

    public string? Course { get; set; }

    public int? Semester { get; set; }

    public string? University { get; set; }

    public int? CreatedBy { get; set; }

    public int? ModifiedBy { get; set; }

    public DateTime? ModifiedAt { get; set; }

    public virtual ICollection<AssignmentSubmission> AssignmentSubmissions { get; set; } = new List<AssignmentSubmission>();

    public virtual User? CreatedByNavigation { get; set; }

    public virtual ICollection<DailyReflection> DailyReflections { get; set; } = new List<DailyReflection>();

    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();

    public virtual ICollection<MentorRequest> MentorRequests { get; set; } = new List<MentorRequest>();

    public virtual ICollection<MentorSession> MentorSessions { get; set; } = new List<MentorSession>();

    public virtual ICollection<MentorStudent> MentorStudents { get; set; } = new List<MentorStudent>();

    public virtual User? ModifiedByNavigation { get; set; }

    public virtual ICollection<StudentGoal> StudentGoals { get; set; } = new List<StudentGoal>();

    public virtual ICollection<StudentMentorFeedback> StudentMentorFeedbacks { get; set; } = new List<StudentMentorFeedback>();

    public virtual User User { get; set; } = null!;

    public virtual ICollection<ExamAssignment> ExamAssignments { get; set; } = new List<ExamAssignment>();
}
