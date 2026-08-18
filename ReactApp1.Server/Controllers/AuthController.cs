using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;
using ReactApp1.Server.DTOs;
using ReactApp1.Server.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ReactApp1.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly StudentdbContext _context;// database access
        private readonly IConfiguration _config;// read JWT settings from appsettings.json
        private readonly PasswordHasher<User> _hasher = new(); // secure password

        public AuthController(StudentdbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // ========================= REGISTER =========================
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (dto == null ||
                string.IsNullOrWhiteSpace(dto.Name) ||
                string.IsNullOrWhiteSpace(dto.Email) ||
                string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest("Invalid input");
            }

            var email = dto.Email.Trim().ToLower();
            // check duplicate email 
            if (await _context.Users.AnyAsync(u => u.Email == email))
                return BadRequest("Email already exists");

            var role = (dto.Role ?? "student").ToLower();

            if (role == "admin")
                return BadRequest("Admin registration not allowed");

            if (role != "student" && role != "mentor")
                return BadRequest("Invalid role");

           
            var user = new User
            {
                Name = dto.Name,
                Email = email,
                Role = role,
                Status = true,
                CreatedAt = DateTime.UtcNow
            };
            user.Password = _hasher.HashPassword(user, dto.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Auto-create Mentor or Student profile row
            if (role == "mentor")
            {
                _context.Mentors.Add(new Mentor
                {
                    UserId    = user.UserId,
                    CreatedBy = user.UserId
                });
                await _context.SaveChangesAsync();
            }
            else if (role == "student")
            {
                _context.Students.Add(new Student
                {
                    UserId    = user.UserId,
                    Course    = "General",
                    Semester  = 1,
                    University = "Not Specified",
                    CreatedBy = user.UserId
                });
                await _context.SaveChangesAsync();
            }

            return Ok("Registered successfully");
        }

        // ========================= LOGIN =========================
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (dto == null ||
                string.IsNullOrWhiteSpace(dto.Email) ||
                string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest("Invalid input");
            }

            var email = dto.Email.Trim().ToLower();

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email && u.Status == true);

            if (user == null)
                return Unauthorized("Invalid email or password");

            var result = _hasher.VerifyHashedPassword(
                user, user.Password, dto.Password);

            if (result == PasswordVerificationResult.Failed)
                return Unauthorized("Invalid email or password");

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),   // ✅ matches RoleClaimType in Program.cs
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Key"]!)
            );

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2), // generate token is valid for 2 hours
                signingCredentials: new SigningCredentials(
                    key, SecurityAlgorithms.HmacSha256)
            );
            if (user.Role == "student")
            {
                var studentExists = await _context.Students.AnyAsync(s => s.UserId == user.UserId);
                if (!studentExists)
                {
                    _context.Students.Add(new Student
                    {
                        UserId = user.UserId,
                        Course = "General",
                        Semester = 1,
                        University = "Not Specified",
                        CreatedBy = user.UserId
                    });
                    await _context.SaveChangesAsync();
                }
            }

            // react recives the token and role
            return Ok(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token),
                role = user.Role
            });
        }

        public class ForgotPasswordDto
        {
            public string Email { get; set; } = string.Empty;
        }

        public class ResetPasswordDto
        {
            public string Email { get; set; } = string.Empty;
            public string Otp { get; set; } = string.Empty;
            public string NewPassword { get; set; } = string.Empty;
        }

        // ========================= FORGOT PASSWORD =========================
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto, [FromServices] IMemoryCache cache)
        {
            if (string.IsNullOrWhiteSpace(dto.Email))
                return BadRequest("Invalid email");

            var email = dto.Email.Trim().ToLower();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            
            if (user == null)
            {
                // We shouldn't explicitly tell them the email doesn't exist for security reasons,
                // so we just return success in either case.
                return Ok(new { message = "If the email is registered, an OTP has been sent." });
            }

            // Generate 6-digit OTP
            var otp = new Random().Next(100000, 999999).ToString();
            
            // Save to memory cache for 10 minutes
            cache.Set($"OTP_{email}", otp, TimeSpan.FromMinutes(10));

            // ============================================
            // LIVE REAL EMAIL SENDING VIA SMTP
            // ============================================
            try
            {
                // Fetch email settings from appsettings.json
                var emailUser = _config["EmailSettings:EmailUser"];
                var emailPass = _config["EmailSettings:EmailPass"];
                
                using (var mail = new System.Net.Mail.MailMessage())
                {
                    mail.From = new System.Net.Mail.MailAddress(emailUser, "StudySmart IT");
                    mail.To.Add(email);
                    mail.Subject = "StudySmart - Password Reset OTP";
                    mail.Body = $"<div style='font-family: Arial, sans-serif; padding: 20px;'>" +
                                $"<h2>Password Reset</h2>" +
                                $"<p>We received a request to reset your password.</p>" +
                                $"<p>Your 6-digit OTP code is: <b style='color: #4CAF50; font-size: 20px;'>{otp}</b></p>" +
                                $"<p>This code will expire in 10 minutes.</p>" +
                                $"</div>";
                    mail.IsBodyHtml = true;

                    // Configure SMTP Client
                    // Note: If using Gmail, you MUST generate an 'App Password' from your Google Account Security settings.
                    using (var smtp = new System.Net.Mail.SmtpClient("smtp.gmail.com", 587))
                    {
                        smtp.Credentials = new System.Net.NetworkCredential(emailUser, emailPass);
                        smtp.EnableSsl = true;
                        await smtp.SendMailAsync(mail);
                    }
                }
            }
            catch (Exception ex)
            {
                // Fallback: If SMTP fails (credentials not set), print to terminal window instead!
                Console.WriteLine("\n[EMAIL FAILED -> MOCK FALLBACK ACTIVATED]");
                Console.WriteLine($"MOCK EMAIL SENT TO: {email}");
                Console.WriteLine($"SUBJECT: Password Reset OTP");
                Console.WriteLine($"BODY: Your reset OTP is: {otp}");
                Console.WriteLine($"SMTP Error Details: {ex.Message}");
                Console.WriteLine("========================================\n");
            }

            // Provide the OTP directly in frontend payload ONLY FOR EASE OF TESTING (REMOVE THIS FOR PRODUCTION)
            return Ok(new { message = "If the email is registered, an OTP has been sent.", mockOtpCode = otp });
        }


        // ========================= VERIFY OTP =========================
        [HttpPost("verify-otp")]
        public IActionResult VerifyOtp([FromBody] ResetPasswordDto dto, [FromServices] IMemoryCache cache)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Otp))
                return BadRequest("Invalid input");

            var email = dto.Email.Trim().ToLower();

            if (!cache.TryGetValue($"OTP_{email}", out string? savedOtp) || savedOtp != dto.Otp)
            {
                return BadRequest(new { msg = "Invalid or expired OTP" });
            }

            return Ok(new { msg = "OTP verified successfully" });
        }

        // ========================= RESET PASSWORD =========================
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto, [FromServices] IMemoryCache cache)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Otp) || string.IsNullOrWhiteSpace(dto.NewPassword))
                return BadRequest("Invalid input");

            var email = dto.Email.Trim().ToLower();

            if (!cache.TryGetValue($"OTP_{email}", out string? savedOtp) || savedOtp != dto.Otp)
            {
                return BadRequest("Invalid or expired OTP");
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return BadRequest("User not found");

            // Update password securely
            user.Password = _hasher.HashPassword(user, dto.NewPassword);
            await _context.SaveChangesAsync();

            // Clear OTP to prevent reuse
            cache.Remove($"OTP_{email}");

            return Ok(new { message = "Password updated successfully" });
        }

        // ========================= GET USERS (DEV / ADMIN) =========================
        [AllowAnonymous]
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .AsNoTracking()
                .Select(u => new
                {
                    u.UserId,
                    u.Name,
                    u.Email,
                    u.Role,
                    u.Status,
                    u.CreatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

    }
}