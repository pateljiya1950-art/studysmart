using Microsoft.AspNetCore.Http;

namespace ReactApp1.Server.DTOs.Student
{
    public class MaterialUploadDto
    {
        public IFormFile File { get; set; } = null!;
        public string Title { get; set; } = string.Empty;
    }
}
