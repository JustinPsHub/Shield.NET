using System;
using System.Text.Json.Serialization;

namespace Shield.NET.Core.Models
{
    public enum LogSeverity
    {
        Info,
        Warning,
        Critical
    }

    public enum SafetyDecision
    {
        Approved,
        Redacted,
        Blocked,
        Flagged
    }

    public class AuditRecord
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [JsonPropertyName("timestamp")]
        public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;

        [JsonPropertyName("correlation_id")]
        public string CorrelationId { get; set; }

        // Security: Hash the prompt so we can verify integrity without storing cleartext PII
        [JsonPropertyName("user_prompt_hash")]
        public string UserPromptHash { get; set; }

        [JsonPropertyName("was_pii_redacted")]
        public bool WasPiiRedacted { get; set; }

        [JsonPropertyName("safety_decision")]
        public SafetyDecision SafetyDecision { get; set; }

        [JsonPropertyName("latency_ms")]
        public long LatencyMs { get; set; }

        [JsonPropertyName("event_details")]
        public string EventDetails { get; set; }

        [JsonPropertyName("tokens_used")]
        public int TokensUsed { get; set; }
    }
}