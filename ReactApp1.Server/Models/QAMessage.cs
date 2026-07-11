using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ReactApp1.Server.Models;

[Table("QA_Messages")]
public partial class QAMessage
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("mentor_id")]
    public int MentorId { get; set; }

    [Column("student_id")]
    public int StudentId { get; set; }

    [Column("sender_type")]
    [MaxLength(20)]
    public string SenderType { get; set; } = null!;

    [Column("message_text")]
    public string MessageText { get; set; } = null!;

    [Column("sent_at")]
    public DateTime SentAt { get; set; }

    [ForeignKey("MentorId")]
    public virtual Mentor Mentor { get; set; } = null!;

    [ForeignKey("StudentId")]
    public virtual Student Student { get; set; } = null!;
}
