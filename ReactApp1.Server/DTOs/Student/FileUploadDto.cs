using Microsoft.AspNetCore.Http;

namespace ReactApp1.Server.DTOs.Student
{
    public class FileUploadDto
    {
        public IFormFile? File { get; set; }
    }
}
