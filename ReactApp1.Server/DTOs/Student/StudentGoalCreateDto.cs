using System;
using System.Text.Json.Serialization;

namespace ReactApp1.Server.DTOs.Student
{
    public class StudentGoalCreateDto
    {
        [JsonPropertyName("goalTitle")]
        public string GoalTitle { get; set; } = string.Empty;

        [JsonPropertyName("targetTasks")]
        public int TargetTasks { get; set; }

        [JsonPropertyName("targetHours")]
        public int TargetHours { get; set; }

        [JsonPropertyName("startDate")]
        public DateTime StartDate { get; set; }

        [JsonPropertyName("endDate")]
        public DateTime EndDate { get; set; }
    }
}
