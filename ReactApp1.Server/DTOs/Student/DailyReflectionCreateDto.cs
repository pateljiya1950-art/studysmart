using System.Text.Json.Serialization;

namespace ReactApp1.Server.DTOs.Student
{
    public class DailyReflectionCreateDto
    {
        [JsonPropertyName("mood")]
        public string Mood { get; set; } = string.Empty;

        [JsonPropertyName("challenges")]
        public string Challenges { get; set; } = string.Empty;

        [JsonPropertyName("improvementPlan")]
        public string ImprovementPlan { get; set; } = string.Empty;
    }
}
