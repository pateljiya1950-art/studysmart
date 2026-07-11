using System;
using System.Collections.Generic;

namespace ReactApp1.Server.Models;

public partial class Mentor
{
    public int MentorId { get; set; }

    public int UserId { get; set; }

    public string? Department { get; set; }

    public int? ExperienceYears { get; set; }

    public int? MaxStudents { get; set; }

    public bool? AvailabilityStatus { get; set; }

    public int? CreatedBy { get; set; }

    public int? ModifiedBy { get; set; }

    public DateTime? ModifiedAt { get; set; }

    public virtual ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();

    public virtual User? CreatedByNavigation { get; set; }

    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();

    public virtual ICollection<MentorAvailability> MentorAvailabilities { get; set; } = new List<MentorAvailability>();

    public virtual ICollection<MentorPerformance> MentorPerformances { get; set; } = new List<MentorPerformance>();

    public virtual ICollection<MentorRequest> MentorRequests { get; set; } = new List<MentorRequest>();

    public virtual ICollection<MentorSession> MentorSessions { get; set; } = new List<MentorSession>();

    public virtual ICollection<MentorSkill> MentorSkills { get; set; } = new List<MentorSkill>();

    public virtual ICollection<MentorStudent> MentorStudents { get; set; } = new List<MentorStudent>();

    public virtual User? ModifiedByNavigation { get; set; }

    public virtual ICollection<StudentMentorFeedback> StudentMentorFeedbacks { get; set; } = new List<StudentMentorFeedback>();

    public virtual User User { get; set; } = null!;

    public virtual ICollection<Exam> Exams { get; set; } = new List<Exam>();
}
