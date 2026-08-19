using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ReactApp1.Server.Models;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<StudentdbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Conn"))
);
builder.Services.AddScoped<AdminService>();
builder.Services.AddScoped<ReactApp1.Server.Services.IMentorService, ReactApp1.Server.Services.MentorService>();
builder.Services.AddScoped<ReactApp1.Server.Services.IExamAssignmentService, ReactApp1.Server.Services.ExamAssignmentService>();
builder.Services.AddHttpClient<ReactApp1.Server.Services.AiService>();
builder.Services.AddControllers();
builder.Services.AddMemoryCache();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins(
            "https://studysmart-gold.vercel.app",
            "https://localhost:63349",
            "http://localhost:5173"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
        ),

        // ✅ Maps JWT "sub" → ClaimTypes.NameIdentifier (used in all controllers for UserId)
        NameClaimType = ClaimTypes.NameIdentifier,
        // ✅ Maps JWT role claim → ClaimTypes.Role (used by [Authorize(Roles="mentor")])
        RoleClaimType = ClaimTypes.Role
    };
});

builder.Services.AddAuthorization();

try
{
    var app = builder.Build();

    app.UseSwagger();
    app.UseSwaggerUI();

    app.UseHttpsRedirection();
    app.UseStaticFiles(); // Enable serving files from wwwroot
    app.UseCors("AllowReact");
    app.UseAuthentication();
    app.UseAuthorization();

    app.MapGet("/", () => Results.Ok(new { status = "Healthy", service = "StudySmart API", swagger = "/swagger" }));
    app.MapGet("/health", () => Results.Ok(new { status = "Healthy" }));

    app.MapControllers();
    app.Run();
}
catch (Exception ex)
{
    System.IO.File.WriteAllText("crash_dump.txt", ex.ToString());
    throw;
}
