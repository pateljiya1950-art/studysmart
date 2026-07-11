using System;
using System.Collections.Generic;

namespace ReactApp1.Server.Models;

public partial class User
{
    public int UserId { get; set; }

    public string Name { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;

    public string Role { get; set; } = null!;

    public bool? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? CreatedBy { get; set; }

    public int? ModifiedBy { get; set; }

    public virtual ICollection<AnalyticsDaily> AnalyticsDailies { get; set; } = new List<AnalyticsDaily>();

    public virtual ICollection<Announcement> AnnouncementAdmins { get; set; } = new List<Announcement>();

    public virtual ICollection<Announcement> AnnouncementCreatedByNavigations { get; set; } = new List<Announcement>();

    public virtual ICollection<Announcement> AnnouncementModifiedByNavigations { get; set; } = new List<Announcement>();

    public virtual ICollection<Assignment> AssignmentCreatedByNavigations { get; set; } = new List<Assignment>();

    public virtual ICollection<Assignment> AssignmentModifiedByNavigations { get; set; } = new List<Assignment>();

    public virtual ICollection<CalendarEvent> CalendarEventCreatedByNavigations { get; set; } = new List<CalendarEvent>();

    public virtual ICollection<CalendarEvent> CalendarEventModifiedByNavigations { get; set; } = new List<CalendarEvent>();

    public virtual ICollection<CalendarEvent> CalendarEventUsers { get; set; } = new List<CalendarEvent>();

    public virtual User? CreatedByNavigation { get; set; }



    public virtual ICollection<Feedback> FeedbackCreatedByNavigations { get; set; } = new List<Feedback>();

    public virtual ICollection<Feedback> FeedbackModifiedByNavigations { get; set; } = new List<Feedback>();

    public virtual ICollection<User> InverseCreatedByNavigation { get; set; } = new List<User>();

    public virtual ICollection<User> InverseModifiedByNavigation { get; set; } = new List<User>();

    public virtual ICollection<Material> MaterialCreatedByNavigations { get; set; } = new List<Material>();

    public virtual ICollection<Material> MaterialModifiedByNavigations { get; set; } = new List<Material>();

    public virtual ICollection<Material> MaterialUsers { get; set; } = new List<Material>();

    public virtual ICollection<MentorAvailability> MentorAvailabilityCreatedByNavigations { get; set; } = new List<MentorAvailability>();

    public virtual ICollection<MentorAvailability> MentorAvailabilityModifiedByNavigations { get; set; } = new List<MentorAvailability>();

    public virtual ICollection<Mentor> MentorCreatedByNavigations { get; set; } = new List<Mentor>();

    public virtual ICollection<Mentor> MentorModifiedByNavigations { get; set; } = new List<Mentor>();

    public virtual ICollection<MentorRequest> MentorRequestCreatedByNavigations { get; set; } = new List<MentorRequest>();

    public virtual ICollection<MentorRequest> MentorRequestModifiedByNavigations { get; set; } = new List<MentorRequest>();

    public virtual ICollection<MentorSession> MentorSessionCreatedByNavigations { get; set; } = new List<MentorSession>();

    public virtual ICollection<MentorSession> MentorSessionModifiedByNavigations { get; set; } = new List<MentorSession>();

    public virtual ICollection<MentorSkill> MentorSkillCreatedByNavigations { get; set; } = new List<MentorSkill>();

    public virtual ICollection<MentorSkill> MentorSkillModifiedByNavigations { get; set; } = new List<MentorSkill>();

    public virtual ICollection<MentorStudent> MentorStudentCreatedByNavigations { get; set; } = new List<MentorStudent>();

    public virtual ICollection<MentorStudent> MentorStudentModifiedByNavigations { get; set; } = new List<MentorStudent>();

    public virtual ICollection<Mentor> MentorUsers { get; set; } = new List<Mentor>();

    public virtual User? ModifiedByNavigation { get; set; }

    public virtual ICollection<Note> Notes { get; set; } = new List<Note>();

    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public virtual ICollection<PerformanceReport> PerformanceReports { get; set; } = new List<PerformanceReport>();

    public virtual ICollection<Student> StudentCreatedByNavigations { get; set; } = new List<Student>();

    public virtual ICollection<StudentGoal> StudentGoalCreatedByNavigations { get; set; } = new List<StudentGoal>();

    public virtual ICollection<StudentGoal> StudentGoalModifiedByNavigations { get; set; } = new List<StudentGoal>();

    public virtual ICollection<StudentMentorFeedback> StudentMentorFeedbackCreatedByNavigations { get; set; } = new List<StudentMentorFeedback>();

    public virtual ICollection<StudentMentorFeedback> StudentMentorFeedbackModifiedByNavigations { get; set; } = new List<StudentMentorFeedback>();

    public virtual ICollection<Student> StudentModifiedByNavigations { get; set; } = new List<Student>();

    public virtual ICollection<Student> StudentUsers { get; set; } = new List<Student>();

    public virtual ICollection<StudySession> StudySessions { get; set; } = new List<StudySession>();

    public virtual ICollection<SubjectsSkill> SubjectsSkillCreatedByNavigations { get; set; } = new List<SubjectsSkill>();

    public virtual ICollection<SubjectsSkill> SubjectsSkillModifiedByNavigations { get; set; } = new List<SubjectsSkill>();

    public virtual ICollection<Task> TaskCreatedByNavigations { get; set; } = new List<Task>();

    public virtual ICollection<Task> TaskModifiedByNavigations { get; set; } = new List<Task>();

    public virtual ICollection<Task> TaskUsers { get; set; } = new List<Task>();
}
