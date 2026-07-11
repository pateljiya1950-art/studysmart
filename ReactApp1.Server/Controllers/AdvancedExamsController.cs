using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1.Server.DTOs;
using ReactApp1.Server.DTOs.Mentor;
using ReactApp1.Server.Models;
using ReactApp1.Server.Services;
using System.Security.Claims;

namespace ReactApp1.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AdvancedExamsController : ControllerBase
    {
        private readonly StudentdbContext _context;
        private readonly AiService _aiService;

        public AdvancedExamsController(StudentdbContext context, AiService aiService)
        {
            _context = context;
            _aiService = aiService;
        }

        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null) throw new Exception("Invalid token");

            return int.Parse(claim.Value);
        }

        // ================= CREATE EXAM =================
        [HttpPost("create")]
        public async Task<IActionResult> CreateExam([FromBody] ExamCreateDto dto)
        {
            try
            {
                int userId = GetUserId();

                var mentor = await _context.Mentors
                    .FirstOrDefaultAsync(m => m.UserId == userId);

                if (mentor == null)
                    return Unauthorized("Only mentors allowed");

                var exam = new Exam
                {
                    Title = dto.Title,
                    Subject = dto.Subject,
                    ExamDate = dto.ExamDate,
                    Duration = dto.Duration,
                    DifficultyLevel = dto.DifficultyLevel,
                    CreatedBy = mentor.MentorId,
                    ExamQuestions = new List<ExamQuestion>()
                };

                foreach (var q in dto.Questions ?? new List<QuestionCreateDto>())
                {
                    exam.ExamQuestions.Add(new ExamQuestion
                    {
                        Type = q.Type,
                        DifficultyLevel = q.DifficultyLevel,
                        QuestionText = q.QuestionText,
                        OptionA = q.OptionA,
                        OptionB = q.OptionB,
                        OptionC = q.OptionC,
                        OptionD = q.OptionD,
                        CorrectAnswer = q.CorrectAnswer
                    });
                }

                _context.Exams.Add(exam);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    examId = exam.ExamId
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        // ================= AI GENERATE =================
        [HttpPost("ai-generate")]
        public async Task<IActionResult> AiGenerateQuestions([FromBody] AIGenerateRequestDto request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Subject))
                    return BadRequest("Subject required");

                var questions = await _aiService.GenerateQuestionsAsync(
                    request.Subject,
                    request.DifficultyLevel,
                    request.NumberOfQuestions
                );

                return Ok(questions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "AI generation failed",
                    error = ex.Message
                });
            }
        }

        // ================= GET EXAM =================
        [HttpGet("{examId}")]
        public async Task<IActionResult> GetExam(int examId)
        {
            var exam = await _context.Exams
                .Include(e => e.ExamQuestions)
                .FirstOrDefaultAsync(e => e.ExamId == examId);

            if (exam == null)
                return NotFound();

            return Ok(new
            {
                exam.ExamId,
                exam.Title,
                exam.Subject,
                exam.Duration,
                exam.DifficultyLevel,
                Questions = exam.ExamQuestions.Select(q => new
                {
                    q.QuestionId,
                    q.Type,
                    q.QuestionText,
                    q.OptionA,
                    q.OptionB,
                    q.OptionC,
                    q.OptionD
                })
            });
        }

        // ================= SUBMIT EXAM =================
        [HttpPost("submit")]
        public async Task<IActionResult> SubmitExam([FromBody] ExamSubmitRequestDto dto)
        {
            try
            {
                int userId = GetUserId();

                var student = await _context.Students
                    .FirstOrDefaultAsync(s => s.UserId == userId);

                if (student == null)
                    return Unauthorized("Student only");

                var assignment = await _context.ExamAssignments
                    .FirstOrDefaultAsync(a => a.AssignmentId == dto.AssignmentId);

                if (assignment == null || assignment.StudentId != student.StudentId)
                    return BadRequest("Invalid assignment");

                var submission = new ExamSubmission
                {
                    AssignmentId = dto.AssignmentId,
                    StudentId = student.StudentId,
                    CheatingViolations = dto.CheatingViolations,
                    SubmittedAt = DateTime.UtcNow,
                    ExamAnswers = new List<ExamAnswer>()
                };

                decimal total = 0;
                decimal aiScore = 0;

                foreach (var ans in dto.Answers)
                {
                    var q = await _context.ExamQuestions.FindAsync(ans.QuestionId);
                    decimal score = 0;

                    if (q != null)
                    {
                        if (q.Type == "MCQ")
                        {
                            if (ans.SelectedOption == q.CorrectAnswer)
                            {
                                score = 1;
                                total += score;
                            }
                        }
                        else if (q.Type == "Subjective")
                        {
                            score = await _aiService.EvaluateSubjectiveAsync(
                                q.QuestionText,
                                q.CorrectAnswer,
                                ans.DescriptiveAnswer
                            );

                            aiScore += score;
                            total += score;
                        }
                    }

                    submission.ExamAnswers.Add(new ExamAnswer
                    {
                        QuestionId = ans.QuestionId,
                        SelectedOption = ans.SelectedOption,
                        DescriptiveAnswer = ans.DescriptiveAnswer,
                        Score = score
                    });
                }

                submission.Score = total;
                submission.AiScore = aiScore;

                _context.ExamSubmissions.Add(submission);

                assignment.Status = "Completed";

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    score = total,
                    aiScore = aiScore
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ================= STUDENT: MY RESULTS =================
        [HttpGet("my-results")]
        public async Task<IActionResult> GetMyResults()
        {
            try
            {
                int userId = GetUserId();
                var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
                if (student == null) return Unauthorized("Student only");

                var results = await _context.ExamSubmissions
                    .Include(s => s.ExamAssignment)
                        .ThenInclude(a => a.Exam)
                    .Where(s => s.StudentId == student.StudentId)
                    .OrderByDescending(s => s.SubmittedAt)
                    .Select(s => new
                    {
                        s.SubmissionId,
                        examTitle    = s.ExamAssignment.Exam.Title,
                        examSubject  = s.ExamAssignment.Exam.Subject,
                        s.Score,
                        s.AiScore,
                        s.CheatingViolations,
                        s.SubmittedAt
                    })
                    .ToListAsync();

                return Ok(results);
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ================= MENTOR: ALL RESULTS =================
        [HttpGet("mentor-results")]
        public async Task<IActionResult> GetMentorResults()
        {
            try
            {
                int userId = GetUserId();
                var mentor = await _context.Mentors.FirstOrDefaultAsync(m => m.UserId == userId);
                if (mentor == null) return Unauthorized("Mentor only");

                var results = await _context.ExamSubmissions
                    .Include(s => s.ExamAssignment)
                        .ThenInclude(a => a.Exam)
                    .Include(s => s.Student)
                        .ThenInclude(st => st.User)
                    .Where(s => s.ExamAssignment.Exam.CreatedBy == mentor.MentorId)
                    .OrderByDescending(s => s.SubmittedAt)
                    .Select(s => new
                    {
                        s.SubmissionId,
                        examTitle    = s.ExamAssignment.Exam.Title,
                        examSubject  = s.ExamAssignment.Exam.Subject,
                        studentName  = s.Student.User.Name,
                        s.Score,
                        s.AiScore,
                        s.CheatingViolations,
                        s.SubmittedAt
                    })
                    .ToListAsync();

                return Ok(results);
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }
    }
}
