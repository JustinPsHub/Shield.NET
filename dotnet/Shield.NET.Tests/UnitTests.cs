using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Shield.NET.Core;
using Shield.NET.Core.Configuration;
using Shield.NET.Core.Models;
using Shield.NET.Core.Services;
using Microsoft.Extensions.AI;

namespace Shield.NET.Tests
{
    public class MockChatClient : IChatClient
    {
        public IEnumerable<ChatMessage> LastReceivedMessages { get; private set; }
        
        public Task<ChatCompletion> CompleteAsync(IEnumerable<ChatMessage> messages, CancellationToken cancellationToken = default)
        {
            LastReceivedMessages = messages;
            return Task.FromResult(new ChatCompletion 
            { 
                Choice = new ChatMessage { Role = "Assistant", Content = "Ack" },
                TokenUsage = 10
            });
        }

        public void Dispose() { }
    }

    public class MockLogger : IComplianceLogger
    {
        public AuditRecord LastRecord { get; private set; }
        
        public Task LogDecisionAsync(AuditRecord record)
        {
            LastRecord = record;
            return Task.CompletedTask;
        }

        public Task<IEnumerable<AuditRecord>> GetRecentLogsAsync(int count) => Task.FromResult<IEnumerable<AuditRecord>>(new List<AuditRecord>());
    }

    public class ShieldUnitTests
    {
        [Fact]
        public void Should_Redact_Email_Before_Sending_To_LLM()
        {
            // Arrange
            var redactor = new RegexPiiRedactor();
            string input = "Contact admin@corp.com for access.";

            // Act
            var result = redactor.Redact(input);

            // Assert
            Assert.True(result.WasRedacted);
            Assert.Equal("Contact [REDACTED-EMAIL] for access.", result.RedactedText);
        }

        [Fact]
        public async Task Should_Create_Audit_Log_On_Completion()
        {
            // Arrange
            var mockClient = new MockChatClient();
            var mockLogger = new MockLogger();
            var config = new ShieldConfiguration { RedactPii = true };
            
            var middleware = new ShieldMiddleware(
                mockClient, 
                config, 
                new RegexPiiRedactor(), 
                new BasicHallucinationDetector(),
                mockLogger
            );

            var messages = new List<ChatMessage> 
            { 
                new ChatMessage { Role = "User", Content = "My SSN is 999-00-1234" } 
            };

            // Act
            await middleware.CompleteAsync(messages);

            // Assert
            // 1. Verify Middleware stripped PII before calling Inner Client
            var receivedMsg = mockClient.LastReceivedMessages.First();
            Assert.Contains("[REDACTED-SSN]", receivedMsg.Content);
            Assert.DoesNotContain("999-00-1234", receivedMsg.Content);

            // 2. Verify Audit Log was created
            Assert.NotNull(mockLogger.LastRecord);
            Assert.True(mockLogger.LastRecord.WasPiiRedacted);
            Assert.Equal(SafetyDecision.Redacted, mockLogger.LastRecord.SafetyDecision);
            
            // 3. Verify Hashing works (UserPromptHash should not be empty)
            Assert.False(string.IsNullOrEmpty(mockLogger.LastRecord.UserPromptHash));
        }
    }
}