using ReactApp1.Server.DTOs.Mentor;
using ReactApp1.Server.DTOs.Student;

namespace ReactApp1.Server.Services
{
    public interface IExamAssignmentService
    {
        // Mentor Assignments
        Task<MentorAssignmentDto> CreateAssignmentAsync(int userId, CreateAssignmentDto dto);
        Task<List<MentorAssignmentDto>> GetMentorAssignmentsAsync(int userId);
        Task<List<AssignmentSubmissionViewDto>> GetAssignmentSubmissionsAsync(int userId, int assignmentId);
        Task<bool> DeleteAssignmentAsync(int userId, int assignmentId);

        // Student Assignments
        Task<List<AssignmentDto>> GetAllAssignmentsAsync(int userId);
        Task<(bool Success, string Error, SubmissionDto? Result)> SubmitAssignmentAsync(int userId, int assignmentId, Microsoft.AspNetCore.Http.IFormFile? file);
    }
}
