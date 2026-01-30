using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Shield.NET.Core.Configuration;
using Shield.NET.Core.Models;
using Shield.NET.Core.Services;

// Simulating Microsoft.Extensions.AI abstraction for .NET 10
namespace Microsoft.Extensions.AI
{
    public class ChatMessage
    {
        public string Role { get; set; } // System, User, Assistant
        public string Content { get; set; }
    }

    public class ChatCompletion
    {
        public ChatMessage Choice { get; set; }
        public int TokenUsage { get; set; }
    }

    public interface IChatClient : IDisposable
    {
        Task<ChatCompletion> CompleteAsync(IEnumerable<ChatMessage> messages, CancellationToken cancellationToken = default);
    }

    public abstract class DelegatingChatClient : IChatClient
    {
        protected IChatClient InnerClient { get; }
        protected DelegatingChatClient(IChatClient innerClient)
        {
            InnerClient = innerClient;
        }
        
        public virtual Task<ChatCompletion> CompleteAsync(IEnumerable<ChatMessage> messages, CancellationToken cancellationToken = default)
        {
            return InnerClient.CompleteAsync(messages, cancellationToken);
        }

        public void Dispose() => InnerClient.Dispose();
    }
}

namespace Shield.NET.Core
{
    using Microsoft.Extensions.AI;

    /// <summary>
    /// Shield.NET Middleware adhering to the DelegatingChatClient pattern.
    /// Acts as a "Privacy Firewall" and "Compliance Sidecar".
    /// </summary>
    public class ShieldMiddleware : DelegatingChatClient
    {
        private readonly ShieldConfiguration _config;
        private readonly IPiiRedactor _piiRedactor;
        private readonly IHallucinationDetector _hallucinationDetector;
        private readonly IComplianceLogger _logger;

        public ShieldMiddleware(
            IChatClient innerClient,
            ShieldConfiguration config,
            IPiiRedactor piiRedactor,
            IHallucinationDetector hallucinationDetector,
            IComplianceLogger logger)
            : base(innerClient)
        {
            _config = config;
            _piiRedactor = piiRedactor;
            _hallucinationDetector = hallucinationDetector;
            _logger = logger;
        }

        public override async Task<ChatCompletion> CompleteAsync(IEnumerable<ChatMessage> messages, CancellationToken cancellationToken = default)
        {
            var start = DateTime.UtcNow;
            var safeMessages = new List<ChatMessage>();
            bool anyPiiRedacted = false;
            string rawPromptContent = "";

            // --- 1. Pre-Processing: PII Redaction & Inspection ---
            foreach (var msg in messages)
            {
                rawPromptContent += msg.Content; // Aggregate for hashing
                
                if (msg.Role == "User" && _config.RedactPii)
                {
                    var (sanitized, redacted) = _piiRedactor.Redact(msg.Content);
                    safeMessages.Add(new ChatMessage { Role = msg.Role, Content = sanitized });
                    if (redacted) anyPiiRedacted = true;
                }
                else
                {
                    safeMessages.Add(msg);
                }
            }

            // Prompt Injection Check
            if (_config.BlockPromptInjection && rawPromptContent.Contains("Ignore previous instructions", StringComparison.OrdinalIgnoreCase))
            {
                await LogAsync(rawPromptContent, true, SafetyDecision.Blocked, start, "Prompt Injection Detected");
                throw new UnauthorizedAccessException("Shield.NET: Request blocked due to Prompt Injection.");
            }

            // --- 2. Inner Execution ---
            ChatCompletion response;
            try
            {
                response = await base.CompleteAsync(safeMessages, cancellationToken);
            }
            catch (Exception ex)
            {
                await LogAsync(rawPromptContent, anyPiiRedacted, SafetyDecision.Flagged, start, $"LLM Error: {ex.Message}");
                throw;
            }

            // --- 3. Post-Processing: Hallucination Detection ---
            SafetyDecision decision = anyPiiRedacted ? SafetyDecision.Redacted : SafetyDecision.Approved;
            string notes = "Request processed successfully";

            if (_config.DetectHallucinations)
            {
                bool isHallucination = await _hallucinationDetector.IsHallucinationAsync(safeMessages.Last().Content, response.Choice.Content);
                if (isHallucination)
                {
                    decision = SafetyDecision.Flagged;
                    notes = "Potential Hallucination detected";
                }
            }

            // --- 4. Compliance Logging ---
            await LogAsync(rawPromptContent, anyPiiRedacted, decision, start, notes, response.TokenUsage);

            return response;
        }

        private async Task LogAsync(string prompt, bool piiRedacted, SafetyDecision decision, DateTime start, string details, int tokens = 0)
        {
            var record = new AuditRecord
            {
                UserPromptHash = FileComplianceLogger.ComputeHash(prompt),
                WasPiiRedacted = piiRedacted,
                SafetyDecision = decision,
                Timestamp = DateTimeOffset.UtcNow,
                LatencyMs = (long)(DateTime.UtcNow - start).TotalMilliseconds,
                EventDetails = details,
                TokensUsed = tokens,
                CorrelationId = Guid.NewGuid().ToString()
            };

            await _logger.LogDecisionAsync(record);
        }
    }
}