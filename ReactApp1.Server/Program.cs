using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
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

// ── CORS: read allowed origins from configuration ───────────────────────────
// In development  → appsettings.json / appsettings.Development.json
// In production   → environment variable AllowedOrigins (comma-separated string or array keys)
var allowedOriginsRaw = builder.Configuration["AllowedOrigins"];
string[] allowedOrigins;
if (!string.IsNullOrWhiteSpace(allowedOriginsRaw))
{
    allowedOrigins = allowedOriginsRaw.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
}
else
{
    allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
        ?? new[] { "https://localhost:63349" };
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ── JWT ──────────────────────────────────────────────────────────────────────
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

// ── Forward proxy headers (required on Render / Railway / Azure etc.) ────────
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders =
        ForwardedHeaders.XForwardedFor |
        ForwardedHeaders.XForwardedProto;
    // Clear known networks/proxies so the headers are always trusted on cloud
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

try
{
    var app = builder.Build();

    // ── Forwarded headers must be first ─────────────────────────────────────
    app.UseForwardedHeaders();

    app.UseSwagger();
    app.UseSwaggerUI();

    // Only redirect to HTTPS locally; in production the platform handles TLS
    if (app.Environment.IsDevelopment())
    {
        app.UseHttpsRedirection();
    }

    app.UseStaticFiles(); // Enable serving files from wwwroot
    app.UseCors("AllowReact");
    app.UseAuthentication();
    app.UseAuthorization();

    // ── Health-check endpoint ────────────────────────────────────────────────
    app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "StudySmart API" }))
       .AllowAnonymous();

    app.MapControllers();
    app.Run();
}
catch (Exception ex)
{
    System.IO.File.WriteAllText("crash_dump.txt", ex.ToString());
    throw;
}
