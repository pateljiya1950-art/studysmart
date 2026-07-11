using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace ReactApp1.Server.Models;

public partial class StudentdbContext : DbContext
{
    public StudentdbContext()
    {
    }

    public StudentdbContext(DbContextOptions<StudentdbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AnalyticsDaily> AnalyticsDailies { get; set; }

    public virtual DbSet<Announcement> Announcements { get; set; }

    public virtual DbSet<Assignment> Assignments { get; set; }

    public virtual DbSet<AssignmentSubmission> AssignmentSubmissions { get; set; }

    public virtual DbSet<CalendarEvent> CalendarEvents { get; set; }

    public virtual DbSet<DailyReflection> DailyReflections { get; set; }

    public virtual DbSet<Exam> Exams { get; set; }

    public virtual DbSet<ExamAssignment> ExamAssignments { get; set; }

    public virtual DbSet<ExamSubmission> ExamSubmissions { get; set; }
    
    public virtual DbSet<ExamQuestion> ExamQuestions { get; set; }
    
    public virtual DbSet<ExamAnswer> ExamAnswers { get; set; }

    public virtual DbSet<Feedback> Feedbacks { get; set; }

    public virtual DbSet<Material> Materials { get; set; }

    public virtual DbSet<Mentor> Mentors { get; set; }

    public virtual DbSet<MentorAvailability> MentorAvailabilities { get; set; }

    public virtual DbSet<MentorPerformance> MentorPerformances { get; set; }

    public virtual DbSet<MentorRequest> MentorRequests { get; set; }

    public virtual DbSet<MentorSession> MentorSessions { get; set; }

    public virtual DbSet<MentorSkill> MentorSkills { get; set; }

    public virtual DbSet<MentorStudent> MentorStudents { get; set; }

    public virtual DbSet<Note> Notes { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<PerformanceReport> PerformanceReports { get; set; }

    public virtual DbSet<Student> Students { get; set; }

    public virtual DbSet<StudentGoal> StudentGoals { get; set; }

    public virtual DbSet<StudentMentorFeedback> StudentMentorFeedbacks { get; set; }

    public virtual DbSet<StudySession> StudySessions { get; set; }

    public virtual DbSet<SubjectsSkill> SubjectsSkills { get; set; }

    public virtual DbSet<Task> Tasks { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<QAMessage> QAMessages { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Data Source=(localdb)\\mssqllocaldb;Initial Catalog=studentdb;Integrated Security=True;Trust Server Certificate=True");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AnalyticsDaily>(entity =>
        {
            entity.HasKey(e => e.AnalyticsId).HasName("PK__Analytic__D5DC3DE1ABD258CA");

            entity.ToTable("Analytics_Daily");

            entity.Property(e => e.AnalyticsId).HasColumnName("analytics_id");
            entity.Property(e => e.CompletedTasks).HasColumnName("completed_tasks");
            entity.Property(e => e.Date).HasColumnName("date");
            entity.Property(e => e.StudyMinutes).HasColumnName("study_minutes");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.AnalyticsDailies)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Analytics__user___236943A5");
        });

        modelBuilder.Entity<Announcement>(entity =>
        {
            entity.HasKey(e => e.AnnouncementId).HasName("PK__Announce__C640A82D367A1503");

            entity.Property(e => e.AnnouncementId).HasColumnName("announcement_id");
            entity.Property(e => e.AdminId).HasColumnName("admin_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.Message).HasColumnName("message");
            entity.Property(e => e.ModifiedAt).HasColumnName("modified_at");
            entity.Property(e => e.ModifiedBy).HasColumnName("modified_by");

            entity.HasOne(d => d.Admin).WithMany(p => p.AnnouncementAdmins)
                .HasForeignKey(d => d.AdminId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Announcem__admin__09A971A2");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.AnnouncementCreatedByNavigations)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__Announcem__creat__0A9D95DB");

            entity.HasOne(d => d.ModifiedByNavigation).WithMany(p => p.AnnouncementModifiedByNavigations)
                .HasForeignKey(d => d.ModifiedBy)
                .HasConstraintName("FK__Announcem__modif__0B91BA14");
        });

        modelBuilder.Entity<Assignment>(entity =>
        {
            entity.HasKey(e => e.AssignmentId).HasName("PK__Assignme__DA89181467C232C0");

            entity.Property(e => e.AssignmentId).HasColumnName("assignment_id");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.DueDate).HasColumnName("due_date");
            entity.Property(e => e.MentorId).HasColumnName("mentor_id");
            entity.Property(e => e.ModifiedAt).HasColumnName("modified_at");
            entity.Property(e => e.ModifiedBy).HasColumnName("modified_by");
            entity.Property(e => e.Title)
                .HasMaxLength(200)
                .HasColumnName("title");
            entity.Property(e => e.Description)
                .HasColumnName("description");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.AssignmentCreatedByNavigations)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__Assignmen__creat__797309D9");

            entity.HasOne(d => d.Mentor).WithMany(p => p.Assignments)
                .HasForeignKey(d => d.MentorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Assignmen__mento__787EE5A0");

            entity.HasOne(d => d.ModifiedByNavigation).WithMany(p => p.AssignmentModifiedByNavigations)
                .HasForeignKey(d => d.ModifiedBy)
                .HasConstraintName("FK__Assignmen__modif__7A672E12");
        });

        modelBuilder.Entity<AssignmentSubmission>(entity =>
        {
            entity.HasKey(e => e.SubmissionId).HasName("PK__Assignme__9B535595F8FEE8A6");

            entity.ToTable("Assignment_Submissions");

            entity.Property(e => e.SubmissionId).HasColumnName("submission_id");
            entity.Property(e => e.AssignmentId).HasColumnName("assignment_id");
            entity.Property(e => e.StudentId).HasColumnName("student_id");
            entity.Property(e => e.SubmittedAt)
                .HasColumnName("submitted_at");
            entity.Property(e => e.FilePath)
                .HasMaxLength(255)
                .HasColumnName("file_path");

            entity.HasOne(d => d.Assignment).WithMany(p => p.AssignmentSubmissions)
                .HasForeignKey(d => d.AssignmentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Assignmen__assig__7E37BEF6");

            entity.HasOne(d => d.Student).WithMany(p => p.AssignmentSubmissions)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Assignmen__stude__7F2BE32F");
        });

        modelBuilder.Entity<CalendarEvent>(entity =>
        {
            entity.HasKey(e => e.EventId).HasName("PK__Calendar__2370F7270ACF0B8B");

            entity.ToTable("Calendar_Events");

            entity.Property(e => e.EventId).HasColumnName("event_id");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.EventDate).HasColumnName("event_date");
            entity.Property(e => e.EventType)
                .HasMaxLength(20)
                .HasColumnName("event_type");
            entity.Property(e => e.ModifiedAt).HasColumnName("modified_at");
            entity.Property(e => e.ModifiedBy).HasColumnName("modified_by");
            entity.Property(e => e.Title)
                .HasMaxLength(200)
                .HasColumnName("title");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.CalendarEventCreatedByNavigations)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__Calendar___creat__1F98B2C1");

            entity.HasOne(d => d.ModifiedByNavigation).WithMany(p => p.CalendarEventModifiedByNavigations)
                .HasForeignKey(d => d.ModifiedBy)
                .HasConstraintName("FK__Calendar___modif__208CD6FA");

            entity.HasOne(d => d.User).WithMany(p => p.CalendarEventUsers)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Calendar___user___1EA48E88");
        });

        modelBuilder.Entity<DailyReflection>(entity =>
        {
            entity.HasKey(e => e.ReflectionId).HasName("PK__Daily_Re__D8E1913AA540B17D");

            entity.ToTable("Daily_Reflection");

            entity.Property(e => e.ReflectionId).HasColumnName("reflection_id");
            entity.Property(e => e.Challenges).HasColumnName("challenges");
            entity.Property(e => e.Date).HasColumnName("date");
            entity.Property(e => e.ImprovementPlan).HasColumnName("improvement_plan");
            entity.Property(e => e.Mood)
                .HasMaxLength(10)
                .HasColumnName("mood");
            entity.Property(e => e.StudentId).HasColumnName("student_id");

            entity.HasOne(d => d.Student).WithMany(p => p.DailyReflections)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Daily_Ref__stude__1AD3FDA4");
        });

        modelBuilder.Entity<Feedback>(entity =>
        {
            entity.HasKey(e => e.FeedbackId).HasName("PK__Feedback__7A6B2B8C33E38C9B");

            entity.ToTable("Feedback");

            entity.Property(e => e.FeedbackId).HasColumnName("feedback_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.Feedback1).HasColumnName("feedback");
            entity.Property(e => e.MentorId).HasColumnName("mentor_id");
            entity.Property(e => e.ModifiedAt).HasColumnName("modified_at");
            entity.Property(e => e.ModifiedBy).HasColumnName("modified_by");
            entity.Property(e => e.StudentId).HasColumnName("student_id");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.FeedbackCreatedByNavigations)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__Feedback__create__04E4BC85");

            entity.HasOne(d => d.Mentor).WithMany(p => p.Feedbacks)
                .HasForeignKey(d => d.MentorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Feedback__mentor__02FC7413");

            entity.HasOne(d => d.ModifiedByNavigation).WithMany(p => p.FeedbackModifiedByNavigations)
                .HasForeignKey(d => d.ModifiedBy)
                .HasConstraintName("FK__Feedback__modifi__05D8E0BE");

            entity.HasOne(d => d.Student).WithMany(p => p.Feedbacks)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Feedback__studen__03F0984C");
        });

        modelBuilder.Entity<Exam>(entity =>
        {
            entity.HasKey(e => e.ExamId);
            entity.ToTable("Exams");

            entity.Property(e => e.ExamId).HasColumnName("exam_id");
            entity.Property(e => e.Title).HasMaxLength(255).HasColumnName("title");
            entity.Property(e => e.Subject).HasMaxLength(255).HasColumnName("subject");
            entity.Property(e => e.ExamDate).HasColumnName("exam_date");
            entity.Property(e => e.Duration).HasColumnName("duration");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.DifficultyLevel).HasMaxLength(50).HasColumnName("difficulty_level");

            entity.HasOne(d => d.Mentor).WithMany(p => p.Exams)
                .HasForeignKey(d => d.CreatedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Exams_Mentors");
        });

        modelBuilder.Entity<ExamAssignment>(entity =>
        {
            entity.HasKey(e => e.AssignmentId);
            entity.ToTable("ExamAssignments");

            entity.Property(e => e.AssignmentId).HasColumnName("assignment_id");
            entity.Property(e => e.ExamId).HasColumnName("exam_id");
            entity.Property(e => e.StudentId).HasColumnName("student_id");
            entity.Property(e => e.AssignedBy).HasColumnName("assigned_by");
            entity.Property(e => e.DueDate).HasColumnName("due_date");
            entity.Property(e => e.Status).HasMaxLength(50).HasColumnName("status");

            entity.HasOne(d => d.Exam).WithMany(p => p.ExamAssignments)
                .HasForeignKey(d => d.ExamId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_ExamAssignments_Exams");

            entity.HasOne(d => d.Student).WithMany(p => p.ExamAssignments)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ExamAssignments_Students");

            entity.HasOne(d => d.Mentor).WithMany()
                .HasForeignKey(d => d.AssignedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ExamAssignments_Mentors");
        });

        modelBuilder.Entity<ExamSubmission>(entity =>
        {
            entity.HasKey(e => e.SubmissionId);
            entity.ToTable("ExamSubmissions");

            entity.Property(e => e.SubmissionId).HasColumnName("submission_id");
            entity.Property(e => e.AssignmentId).HasColumnName("assignment_id");
            entity.Property(e => e.StudentId).HasColumnName("student_id");
            entity.Property(e => e.Score).HasColumnType("decimal(5, 2)").HasColumnName("score");
            entity.Property(e => e.AiScore).HasColumnType("decimal(5, 2)").HasColumnName("ai_score");
            entity.Property(e => e.CheatingViolations).HasDefaultValue(0).HasColumnName("cheating_violations");
            entity.Property(e => e.SubmittedAt).HasColumnName("submitted_at");

            entity.HasOne(d => d.ExamAssignment).WithMany(p => p.ExamSubmissions)
                .HasForeignKey(d => d.AssignmentId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_ExamSubmissions_ExamAssignments");

            entity.HasOne(d => d.Student).WithMany()
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ExamSubmissions_Students");
        });

        modelBuilder.Entity<ExamQuestion>(entity =>
        {
            entity.HasKey(e => e.QuestionId);
            entity.ToTable("ExamQuestions");

            entity.Property(e => e.QuestionId).HasColumnName("question_id");
            entity.Property(e => e.ExamId).HasColumnName("exam_id");
            entity.Property(e => e.Type).HasMaxLength(50).HasColumnName("type");
            entity.Property(e => e.DifficultyLevel).HasMaxLength(50).HasColumnName("difficulty_level");
            entity.Property(e => e.QuestionText).HasColumnName("question_text");
            entity.Property(e => e.OptionA).HasColumnName("option_a");
            entity.Property(e => e.OptionB).HasColumnName("option_b");
            entity.Property(e => e.OptionC).HasColumnName("option_c");
            entity.Property(e => e.OptionD).HasColumnName("option_d");
            entity.Property(e => e.CorrectAnswer).HasColumnName("correct_answer");

            entity.HasOne(d => d.Exam).WithMany(p => p.ExamQuestions)
                .HasForeignKey(d => d.ExamId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_ExamQuestions_Exams");
        });

        modelBuilder.Entity<ExamAnswer>(entity =>
        {
            entity.HasKey(e => e.AnswerId);
            entity.ToTable("ExamAnswers");

            entity.Property(e => e.AnswerId).HasColumnName("answer_id");
            entity.Property(e => e.SubmissionId).HasColumnName("submission_id");
            entity.Property(e => e.QuestionId).HasColumnName("question_id");
            entity.Property(e => e.SelectedOption).HasColumnName("selected_option");
            entity.Property(e => e.DescriptiveAnswer).HasColumnName("descriptive_answer");
            entity.Property(e => e.Score).HasColumnType("decimal(5, 2)").HasColumnName("score");

            entity.HasOne(d => d.Submission).WithMany(p => p.ExamAnswers)
                .HasForeignKey(d => d.SubmissionId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_ExamAnswers_Submissions");

            entity.HasOne(d => d.Question).WithMany()
                .HasForeignKey(d => d.QuestionId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_ExamAnswers_Questions");
        });

        modelBuilder.Entity<Material>(entity =>
        {
            entity.HasKey(e => e.MaterialId).HasName("PK__Material__6BFE1D28B6ABCEE3");

            entity.Property(e => e.MaterialId).HasColumnName("material_id");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.FilePath)
                .HasMaxLength(255)
                .HasColumnName("file_path");
            entity.Property(e => e.ModifiedAt).HasColumnName("modified_at");
            entity.Property(e => e.ModifiedBy).HasColumnName("modified_by");
            entity.Property(e => e.Title)
                .HasMaxLength(200)
                .HasColumnName("title");
            entity.Property(e => e.UploadedAt)
                .HasDefaultValueSql("(sysdatetime())")
                .HasColumnName("uploaded_at");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.MaterialCreatedByNavigations)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__Materials__creat__6FE99F9F");

            entity.HasOne(d => d.ModifiedByNavigation).WithMany(p => p.MaterialModifiedByNavigations)
                .HasForeignKey(d => d.ModifiedBy)
                .HasConstraintName("FK__Materials__modif__70DDC3D8");

            entity.HasOne(d => d.User).WithMany(p => p.MaterialUsers)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Materials__user___6EF57B66");
        });

        modelBuilder.Entity<Mentor>(entity =>
        {
            entity.HasKey(e => e.MentorId).HasName("PK__Mentors__E5D27EF37A466080");

            entity.Property(e => e.MentorId).HasColumnName("mentor_id");
            entity.Property(e => e.AvailabilityStatus)
                .HasDefaultValue(true)
                .HasColumnName("availability_status");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.Department)
                .HasMaxLength(100)
                .HasColumnName("department");
            entity.Property(e => e.ExperienceYears).HasColumnName("experience_years");
            entity.Property(e => e.MaxStudents).HasColumnName("max_students");
            entity.Property(e => e.ModifiedAt).HasColumnName("modified_at");
            entity.Property(e => e.ModifiedBy).HasColumnName("modified_by");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.MentorCreatedByNavigations)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__Mentors__created__32E0915F");

            entity.HasOne(d => d.ModifiedByNavigation).WithMany(p => p.MentorModifiedByNavigations)
                .HasForeignKey(d => d.ModifiedBy)
                .HasConstraintName("FK__Mentors__modifie__33D4B598");

            entity.HasOne(d => d.User).WithMany(p => p.MentorUsers)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Mentors__user_id__31EC6D26");
        });

        modelBuilder.Entity<MentorAvailability>(entity =>
        {
            entity.HasKey(e => e.AvailabilityId).HasName("PK__Mentor_A__86E3A80175419AE7");

            entity.ToTable("Mentor_Availability");

            entity.Property(e => e.AvailabilityId).HasColumnName("availability_id");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.DayOfWeek)
                .HasMaxLength(10)
                .HasColumnName("day_of_week");
            entity.Property(e => e.EndTime).HasColumnName("end_time");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.MentorId).HasColumnName("mentor_id");
            entity.Property(e => e.ModifiedAt).HasColumnName("modified_at");
            entity.Property(e => e.ModifiedBy).HasColumnName("modified_by");
            entity.Property(e => e.StartTime).HasColumnName("start_time");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.MentorAvailabilityCreatedByNavigations)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__Mentor_Av__creat__5629CD9C");

            entity.HasOne(d => d.Mentor).WithMany(p => p.MentorAvailabilities)
                .HasForeignKey(d => d.MentorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Mentor_Av__mento__5535A963");

            entity.HasOne(d => d.ModifiedByNavigation).WithMany(p => p.MentorAvailabilityModifiedByNavigations)
                .HasForeignKey(d => d.ModifiedBy)
                .HasConstraintName("FK__Mentor_Av__modif__571DF1D5");
        });

        modelBuilder.Entity<MentorPerformance>(entity =>
        {
            entity.HasKey(e => e.MentorPerfId).HasName("PK__Mentor_P__564C58C5911ED805");

            entity.ToTable("Mentor_Performance");

            entity.Property(e => e.MentorPerfId).HasColumnName("mentor_perf_id");
            entity.Property(e => e.AvgStudentProductivity)
                .HasColumnType("decimal(5, 2)")
                .HasColumnName("avg_student_productivity");
            entity.Property(e => e.AvgStudentRating)
                .HasColumnType("decimal(3, 1)")
                .HasColumnName("avg_student_rating");
            entity.Property(e => e.FeedbackCount).HasColumnName("feedback_count");
            entity.Property(e => e.MentorId).HasColumnName("mentor_id");
            entity.Property(e => e.PeriodEnd).HasColumnName("period_end");
            entity.Property(e => e.PeriodStart).HasColumnName("period_start");
            entity.Property(e => e.StudentsHandled).HasColumnName("students_handled");

            entity.HasOne(d => d.Mentor).WithMany(p => p.MentorPerformances)
                .HasForeignKey(d => d.MentorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Mentor_Pe__mento__29221CFB");
        });

        modelBuilder.Entity<MentorRequest>(entity =>
        {
            entity.HasKey(e => e.RequestId).HasName("PK__Mentor_R__18D3B90F2AAB317F");

            entity.ToTable("Mentor_Requests");

            entity.Property(e => e.RequestId).HasColumnName("request_id");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.MentorId).HasColumnName("mentor_id");
            entity.Property(e => e.ModifiedAt).HasColumnName("modified_at");
            entity.Property(e => e.ModifiedBy).HasColumnName("modified_by");
            entity.Property(e => e.RequestStatus)
                .HasMaxLength(20)
                .HasDefaultValue("Pending")
                .HasColumnName("request_status");
            entity.Property(e => e.RequestedAt)
                .HasDefaultValueSql("(sysdatetime())")
                .HasColumnName("requested_at");
            entity.Property(e => e.RespondedAt).HasColumnName("responded_at");
            entity.Property(e => e.SkillId).HasColumnName("skill_id");
            entity.Property(e => e.StudentId).HasColumnName("student_id");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.MentorRequestCreatedByNavigations)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__Mentor_Re__creat__48CFD27E");

            entity.HasOne(d => d.Mentor).WithMany(p => p.MentorRequests)
                .HasForeignKey(d => d.MentorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Mentor_Re__mento__46E78A0C");

            entity.HasOne(d => d.ModifiedByNavigation).WithMany(p => p.MentorRequestModifiedByNavigations)
                .HasForeignKey(d => d.ModifiedBy)
                .HasConstraintName("FK__Mentor_Re__modif__49C3F6B7");

            entity.HasOne(d => d.Skill).WithMany(p => p.MentorRequests)
                .HasForeignKey(d => d.SkillId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Mentor_Re__skill__47DBAE45");

            entity.HasOne(d => d.Student).WithMany(p => p.MentorRequests)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Mentor_Re__stude__45F365D3");
        });

        modelBuilder.Entity<MentorSession>(entity =>
        {
            entity.HasKey(e => e.SessionId).HasName("PK__Mentor_S__69B13FDC9C8E5C11");

            entity.ToTable("Mentor_Sessions");

            entity.Property(e => e.SessionId).HasColumnName("session_id");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.MentorId).HasColumnName("mentor_id");
            entity.Property(e => e.ModifiedAt).HasColumnName("modified_at");
            entity.Property(e => e.ModifiedBy).HasColumnName("modified_by");
            entity.Property(e => e.ScheduledDatetime).HasColumnName("scheduled_datetime");
            entity.Property(e => e.SessionStatus)
                .HasMaxLength(20)
                .HasDefaultValue("Scheduled")
                .HasColumnName("session_status");
            entity.Property(e => e.StudentId).HasColumnName("student_id");

            // New fields — map to nullable columns added via migration
            entity.Property(e => e.Title).HasMaxLength(200).HasColumnName("title");
            entity.Property(e => e.SessionDate).HasMaxLength(10).HasColumnName("session_date");
            entity.Property(e => e.StartTime).HasMaxLength(5).HasColumnName("start_time");
            entity.Property(e => e.EndTime).HasMaxLength(5).HasColumnName("end_time");
            entity.Property(e => e.MeetingLink).HasMaxLength(500).HasColumnName("meeting_link");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.MentorSessionCreatedByNavigations)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__Mentor_Se__creat__5DCAEF64");

            entity.HasOne(d => d.Mentor).WithMany(p => p.MentorSessions)
                .HasForeignKey(d => d.MentorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Mentor_Se__mento__5BE2A6F2");

            entity.HasOne(d => d.ModifiedByNavigation).WithMany(p => p.MentorSessionModifiedByNavigations)
                .HasForeignKey(d => d.ModifiedBy)
                .HasConstraintName("FK__Mentor_Se__modif__5EBF139D");

            entity.HasOne(d => d.Student).WithMany(p => p.MentorSessions)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Mentor_Se__stude__5CD6CB2B");
        });


        modelBuilder.Entity<MentorSkill>(entity =>
        {
            entity.HasKey(e => e.MentorSkillId).HasName("PK__Mentor_S__90A45BD5305BD820");

            entity.ToTable("Mentor_Skills");

            entity.Property(e => e.MentorSkillId).HasColumnName("mentor_skill_id");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.ExperienceYears).HasColumnName("experience_years");
            entity.Property(e => e.MentorId).HasColumnName("mentor_id");
            entity.Property(e => e.ModifiedAt).HasColumnName("modified_at");
            entity.Property(e => e.ModifiedBy).HasColumnName("modified_by");
            entity.Property(e => e.ProficiencyLevel)
                .HasMaxLength(20)
                .HasColumnName("proficiency_level");
            entity.Property(e => e.SkillId).HasColumnName("skill_id");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.MentorSkillCreatedByNavigations)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__Mentor_Sk__creat__3F466844");

            entity.HasOne(d => d.Mentor).WithMany(p => p.MentorSkills)
                .HasForeignKey(d => d.MentorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Mentor_Sk__mento__3D5E1FD2");

            entity.HasOne(d => d.ModifiedByNavigation).WithMany(p => p.MentorSkillModifiedByNavigations)
                .HasForeignKey(d => d.ModifiedBy)
                .HasConstraintName("FK__Mentor_Sk__modif__403A8C7D");

            entity.HasOne(d => d.Skill).WithMany(p => p.MentorSkills)
                .HasForeignKey(d => d.SkillId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Mentor_Sk__skill__3E52440B");
        });

        modelBuilder.Entity<MentorStudent>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Mentor_S__3213E83F3614C67E");

            entity.ToTable("Mentor_Student");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AssignedAt)
                .HasDefaultValueSql("(sysdatetime())")
                .HasColumnName("assigned_at");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.MentorId).HasColumnName("mentor_id");
            entity.Property(e => e.ModifiedAt).HasColumnName("modified_at");
            entity.Property(e => e.ModifiedBy).HasColumnName("modified_by");
            entity.Property(e => e.StudentId).HasColumnName("student_id");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.MentorStudentCreatedByNavigations)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__Mentor_St__creat__4F7CD00D");

            entity.HasOne(d => d.Mentor).WithMany(p => p.MentorStudents)
                .HasForeignKey(d => d.MentorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Mentor_St__mento__4D94879B");

            entity.HasOne(d => d.ModifiedByNavigation).WithMany(p => p.MentorStudentModifiedByNavigations)
                .HasForeignKey(d => d.ModifiedBy)
                .HasConstraintName("FK__Mentor_St__modif__5070F446");

            entity.HasOne(d => d.Student).WithMany(p => p.MentorStudents)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Mentor_St__stude__4E88ABD4");
        });

        modelBuilder.Entity<Note>(entity =>
        {
            entity.HasKey(e => e.NoteId).HasName("PK__Notes__CEDD0FA47B0D9DD5");

            entity.Property(e => e.NoteId).HasColumnName("note_id");
            entity.Property(e => e.Content).HasColumnName("content");
            entity.Property(e => e.Title)
                .HasMaxLength(200)
                .HasColumnName("title");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.Notes)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Notes__user_id__6B24EA82");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotifyId).HasName("PK__Notifica__DD351C9692495855");

            entity.Property(e => e.NotifyId).HasColumnName("notify_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.IsRead)
                .HasDefaultValue(false)
                .HasColumnName("is_read");
            entity.Property(e => e.Message)
                .HasMaxLength(255)
                .HasColumnName("message");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Notificat__user___10566F31");
        });

        modelBuilder.Entity<PerformanceReport>(entity =>
        {
            entity.HasKey(e => e.ReportId).HasName("PK__Performa__779B7C587A74BA95");

            entity.ToTable("Performance_Report");

            entity.Property(e => e.ReportId).HasColumnName("report_id");
            entity.Property(e => e.ProductivityScore)
                .HasColumnType("decimal(5, 2)")
                .HasColumnName("productivity_score");
            entity.Property(e => e.ReportDate).HasColumnName("report_date");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.PerformanceReports)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Performan__user___2645B050");
        });

        modelBuilder.Entity<Student>(entity =>
        {
            entity.HasKey(e => e.StudentId).HasName("PK__Students__2A33069A72758BB4");

            entity.Property(e => e.StudentId).HasColumnName("student_id");
            entity.Property(e => e.Course)
                .HasMaxLength(100)
                .HasColumnName("course");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.ModifiedAt).HasColumnName("modified_at");
            entity.Property(e => e.ModifiedBy).HasColumnName("modified_by");
            entity.Property(e => e.Semester).HasColumnName("semester");
            entity.Property(e => e.University)
                .HasMaxLength(150)
                .HasColumnName("university");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.StudentCreatedByNavigations)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK_Students_CreatedBy");

            entity.HasOne(d => d.ModifiedByNavigation).WithMany(p => p.StudentModifiedByNavigations)
                .HasForeignKey(d => d.ModifiedBy)
                .HasConstraintName("FK_Students_ModifiedBy");

            entity.HasOne(d => d.User).WithMany(p => p.StudentUsers)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Students__user_i__2C3393D0");
        });

        modelBuilder.Entity<StudentGoal>(entity =>
        {
            entity.HasKey(e => e.GoalId).HasName("PK__Student___76679A24749B0B3A");

            entity.ToTable("Student_Goals");

            entity.Property(e => e.GoalId).HasColumnName("goal_id");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.EndDate).HasColumnName("end_date");
            entity.Property(e => e.GoalStatus)
                .HasMaxLength(20)
                .HasDefaultValue("Active")
                .HasColumnName("goal_status");
            entity.Property(e => e.GoalTitle)
                .HasMaxLength(150)
                .HasColumnName("goal_title");
            entity.Property(e => e.ModifiedAt).HasColumnName("modified_at");
            entity.Property(e => e.ModifiedBy).HasColumnName("modified_by");
            entity.Property(e => e.StartDate).HasColumnName("start_date");
            entity.Property(e => e.StudentId).HasColumnName("student_id");
            entity.Property(e => e.TargetHours).HasColumnName("target_hours");
            entity.Property(e => e.TargetTasks).HasColumnName("target_tasks");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.StudentGoalCreatedByNavigations)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__Student_G__creat__160F4887");

            entity.HasOne(d => d.ModifiedByNavigation).WithMany(p => p.StudentGoalModifiedByNavigations)
                .HasForeignKey(d => d.ModifiedBy)
                .HasConstraintName("FK__Student_G__modif__17036CC0");

            entity.HasOne(d => d.Student).WithMany(p => p.StudentGoals)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Student_G__stude__151B244E");
        });

        modelBuilder.Entity<StudentMentorFeedback>(entity =>
        {
            entity.HasKey(e => e.FeedbackId).HasName("PK__Student___7A6B2B8C8B8469CD");

            entity.ToTable("Student_Mentor_Feedback");

            entity.Property(e => e.FeedbackId).HasColumnName("feedback_id");
            entity.Property(e => e.Comments).HasColumnName("comments");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.MentorId).HasColumnName("mentor_id");
            entity.Property(e => e.ModifiedAt).HasColumnName("modified_at");
            entity.Property(e => e.ModifiedBy).HasColumnName("modified_by");
            entity.Property(e => e.Rating)
                .HasColumnType("decimal(2, 1)")
                .HasColumnName("rating");
            entity.Property(e => e.StudentId).HasColumnName("student_id");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.StudentMentorFeedbackCreatedByNavigations)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__Student_M__creat__2EDAF651");

            entity.HasOne(d => d.Mentor).WithMany(p => p.StudentMentorFeedbacks)
                .HasForeignKey(d => d.MentorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Student_M__mento__2DE6D218");

            entity.HasOne(d => d.ModifiedByNavigation).WithMany(p => p.StudentMentorFeedbackModifiedByNavigations)
                .HasForeignKey(d => d.ModifiedBy)
                .HasConstraintName("FK__Student_M__modif__2FCF1A8A");

            entity.HasOne(d => d.Student).WithMany(p => p.StudentMentorFeedbacks)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Student_M__stude__2CF2ADDF");
        });

        modelBuilder.Entity<StudySession>(entity =>
        {
            entity.HasKey(e => e.SessionId).HasName("PK__Study_Se__69B13FDC3892D0A0");

            entity.ToTable("Study_Sessions");

            entity.Property(e => e.SessionId).HasColumnName("session_id");
            entity.Property(e => e.DurationMin).HasColumnName("duration_min");
            entity.Property(e => e.SessionDate).HasColumnName("session_date");
            entity.Property(e => e.Subject)
                .HasMaxLength(100)
                .HasColumnName("subject");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.StudySessions)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Study_Ses__user___68487DD7");
        });

        modelBuilder.Entity<SubjectsSkill>(entity =>
        {
            entity.HasKey(e => e.SkillId).HasName("PK__Subjects__FBBA83799463EB5B");

            entity.ToTable("Subjects_Skills");

            entity.Property(e => e.SkillId).HasColumnName("skill_id");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.ModifiedAt).HasColumnName("modified_at");
            entity.Property(e => e.ModifiedBy).HasColumnName("modified_by");
            entity.Property(e => e.SkillName)
                .HasMaxLength(100)
                .HasColumnName("skill_name");
            entity.Property(e => e.SkillType)
                .HasMaxLength(20)
                .HasColumnName("skill_type");
            entity.Property(e => e.IsCustom)
                .HasDefaultValue(false)
                .HasColumnName("is_custom");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.SubjectsSkillCreatedByNavigations)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__Subjects___creat__38996AB5");

            entity.HasOne(d => d.ModifiedByNavigation).WithMany(p => p.SubjectsSkillModifiedByNavigations)
                .HasForeignKey(d => d.ModifiedBy)
                .HasConstraintName("FK__Subjects___modif__398D8EEE");
        });

        modelBuilder.Entity<Task>(entity =>
        {
            entity.HasKey(e => e.TaskId).HasName("PK__Tasks__0492148DE89F3958");

            entity.Property(e => e.TaskId).HasColumnName("task_id");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.DueDate).HasColumnName("due_date");
            entity.Property(e => e.ModifiedAt).HasColumnName("modified_at");
            entity.Property(e => e.ModifiedBy).HasColumnName("modified_by");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Pending")
                .HasColumnName("status");
            entity.Property(e => e.Title)
                .HasMaxLength(200)
                .HasColumnName("title");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.TaskCreatedByNavigations)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__Tasks__created_b__6477ECF3");

            entity.HasOne(d => d.ModifiedByNavigation).WithMany(p => p.TaskModifiedByNavigations)
                .HasForeignKey(d => d.ModifiedBy)
                .HasConstraintName("FK__Tasks__modified___656C112C");

            entity.HasOne(d => d.User).WithMany(p => p.TaskUsers)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Tasks__user_id__6383C8BA");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__B9BE370F60A8A2F1");

            entity.HasIndex(e => e.Email, "UQ__Users__AB6E616429FBAA00").IsUnique();

            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(sysdatetime())")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .HasColumnName("email");
            entity.Property(e => e.ModifiedBy).HasColumnName("modified_by");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.Password)
                .HasMaxLength(255)
                .HasColumnName("password");
            entity.Property(e => e.Role)
                .HasMaxLength(20)
                .HasColumnName("role");
            entity.Property(e => e.Status)
                .HasDefaultValue(true)
                .HasColumnName("status");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.InverseCreatedByNavigation)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__Users__created_b__286302EC");

            entity.HasOne(d => d.ModifiedByNavigation).WithMany(p => p.InverseModifiedByNavigation)
                .HasForeignKey(d => d.ModifiedBy)
                .HasConstraintName("FK__Users__modified___29572725");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
