using System.Net.Http;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using ReactApp1.Server.DTOs;

namespace ReactApp1.Server.Services
{
    public class AiService
    {
        private readonly HttpClient _httpClient;
        private readonly string? _apiKey;

        public AiService(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _apiKey = config["AiSettings:OpenAIKey"]; // 🔥 USE OPENAI KEY
        }

        // ================= AI QUESTION GENERATION =================
        public async Task<List<QuestionCreateDto>> GenerateQuestionsAsync(string subject, string difficultyLevel, int count)
        {
            if (string.IsNullOrWhiteSpace(_apiKey))
                return GetMockQuestions(subject, difficultyLevel, count);

            string prompt = $@"
Generate {count} exam questions about '{subject}' with difficulty '{difficultyLevel}'.

Rules:
- Mix MCQ and Subjective
- Return ONLY valid JSON array
- No markdown
- No explanation

Format:
[
  {{
    ""type"": ""MCQ"",
    ""difficultyLevel"": ""{difficultyLevel}"",
    ""questionText"": ""Question"",
    ""optionA"": ""A"",
    ""optionB"": ""B"",
    ""optionC"": ""C"",
    ""optionD"": ""D"",
    ""correctAnswer"": ""A""
  }},
  {{
    ""type"": ""Subjective"",
    ""difficultyLevel"": ""{difficultyLevel}"",
    ""questionText"": ""Explain..."",
    ""correctAnswer"": ""keyword1, keyword2, keyword3""
  }}
]";

            string raw = string.Empty;
            try
            {
                raw = await CallOpenAI(prompt);
            }
            catch (Exception ex)
            {
                // Fallback to mock data if OpenAI hits Quota errors or fails
                return GetMockQuestions(subject, difficultyLevel, count);
            }

            if (string.IsNullOrWhiteSpace(raw))
                return GetMockQuestions(subject, difficultyLevel, count);

            raw = CleanJson(raw);

            return JsonSerializer.Deserialize<List<QuestionCreateDto>>(raw,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
                ?? new List<QuestionCreateDto>();
        }

        // ================= SUBJECTIVE EVALUATION =================
        public async Task<decimal> EvaluateSubjectiveAsync(string question, string expectedKeywords, string studentAnswer)
        {
            if (string.IsNullOrWhiteSpace(_apiKey))
                return FallbackMockEvaluate(expectedKeywords, studentAnswer);

            string prompt = $@"
Evaluate answer and return ONLY JSON:
{{ ""score"": 4.0 }}

Question: {question}
Expected: {expectedKeywords}
Answer: {studentAnswer}
";

            try
            {
                var raw = await CallOpenAI(prompt);

                raw = CleanJson(raw);

                var result = JsonSerializer.Deserialize<AiScoreResponse>(raw,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                return result?.Score ?? FallbackMockEvaluate(expectedKeywords, studentAnswer);
            }
            catch
            {
                return FallbackMockEvaluate(expectedKeywords, studentAnswer);
            }
        }

        // ================= OPENAI CALL =================
        private async Task<string> CallOpenAI(string prompt)
        {
            var url = "https://api.openai.com/v1/chat/completions";

            var requestBody = new
            {
                model = "gpt-4o-mini",
                messages = new[]
                {
                    new { role = "user", content = prompt }
                }
            };

            var request = new HttpRequestMessage(HttpMethod.Post, url);

            request.Headers.Add("Authorization", $"Bearer {_apiKey}");

            request.Content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json"
            );

            var response = await _httpClient.SendAsync(request);
            var responseText = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                throw new Exception(responseText);

            using var doc = JsonDocument.Parse(responseText);

            return doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();
        }

        // ================= CLEAN RESPONSE =================
        private string CleanJson(string raw)
        {
            raw = raw.Trim();

            if (raw.StartsWith("```"))
            {
                raw = raw.Replace("```json", "")
                         .Replace("```", "")
                         .Trim();
            }

            return raw;
        }

        // ================= DYNAMIC MOCK DATA =================
        private List<QuestionCreateDto> GetMockQuestions(string subject, string difficulty, int count = 5)
        {
            // Generic question templates that use the subject dynamically
            var allQuestions = new List<QuestionCreateDto>
            {
                new QuestionCreateDto
                {
                    Type = "MCQ", DifficultyLevel = difficulty,
                    QuestionText = $"What is the primary purpose of {subject}?",
                    OptionA = $"To understand core concepts of {subject}",
                    OptionB = $"To ignore principles of {subject}",
                    OptionC = $"To replace all other fields with {subject}",
                    OptionD = $"None of the above",
                    CorrectAnswer = $"To understand core concepts of {subject}"
                },
                new QuestionCreateDto
                {
                    Type = "MCQ", DifficultyLevel = difficulty,
                    QuestionText = $"Which of the following best describes {subject}?",
                    OptionA = $"A structured methodology for {subject}",
                    OptionB = $"An unrelated concept",
                    OptionC = $"A deprecated practice",
                    OptionD = $"Only applicable in advanced scenarios",
                    CorrectAnswer = $"A structured methodology for {subject}"
                },
                new QuestionCreateDto
                {
                    Type = "MCQ", DifficultyLevel = difficulty,
                    QuestionText = $"What is a key advantage of using {subject}?",
                    OptionA = "Increased complexity",
                    OptionB = "Reduced performance",
                    OptionC = $"Improved understanding and application of {subject}",
                    OptionD = "Elimination of all standards",
                    CorrectAnswer = $"Improved understanding and application of {subject}"
                },
                new QuestionCreateDto
                {
                    Type = "MCQ", DifficultyLevel = difficulty,
                    QuestionText = $"Which statement about {subject} is FALSE?",
                    OptionA = $"{subject} has real-world applications",
                    OptionB = $"{subject} follows established principles",
                    OptionC = $"{subject} is irrelevant in modern use",
                    OptionD = $"{subject} can be studied systematically",
                    CorrectAnswer = $"{subject} is irrelevant in modern use"
                },
                new QuestionCreateDto
                {
                    Type = "MCQ", DifficultyLevel = difficulty,
                    QuestionText = $"In the context of {subject}, what does good practice typically involve?",
                    OptionA = "Skipping foundational steps",
                    OptionB = $"Understanding, applying, and evaluating {subject} principles",
                    OptionC = "Avoiding documentation",
                    OptionD = "Ignoring best practices",
                    CorrectAnswer = $"Understanding, applying, and evaluating {subject} principles"
                },
                new QuestionCreateDto
                {
                    Type = "Subjective", DifficultyLevel = difficulty,
                    QuestionText = $"Explain the core principles of {subject} and their real-world significance.",
                    CorrectAnswer = $"principles, concepts, application, significance, {subject}"
                },
                new QuestionCreateDto
                {
                    Type = "Subjective", DifficultyLevel = difficulty,
                    QuestionText = $"How would you apply your knowledge of {subject} to solve a practical problem?",
                    CorrectAnswer = $"problem-solving, application, methodology, {subject}, practical"
                },
                new QuestionCreateDto
                {
                    Type = "Subjective", DifficultyLevel = difficulty,
                    QuestionText = $"Compare and contrast different approaches to {subject}.",
                    CorrectAnswer = $"comparison, approaches, advantages, disadvantages, {subject}"
                }
            };

            // Shuffle to avoid repetition and return requested count
            var rng = new Random();
            return allQuestions.OrderBy(_ => rng.Next()).Take(count).ToList();
        }

        private decimal FallbackMockEvaluate(string expectedKeywords, string studentAnswer)
        {
            if (string.IsNullOrEmpty(studentAnswer) || string.IsNullOrEmpty(expectedKeywords))
                return 0;

            var keywords = expectedKeywords.Split(',').Select(k => k.Trim().ToLower());
            var answer = studentAnswer.ToLower();

            int match = keywords.Count(k => answer.Contains(k));

            return match switch
            {
                >= 3 => 5,
                2 => 3.5m,
                1 => 2,
                _ => 0.5m
            };
        }

        private class AiScoreResponse
        {
            public decimal Score { get; set; }
        }
    }
}