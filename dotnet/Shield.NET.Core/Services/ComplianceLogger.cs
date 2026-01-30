using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Shield.NET.Core.Models;

namespace Shield.NET.Core.Services
{
    public interface IComplianceLogger
    {
        Task LogDecisionAsync(AuditRecord record);
        Task<IEnumerable<AuditRecord>> GetRecentLogsAsync(int count);
    }

    public class FileComplianceLogger : IComplianceLogger
    {
        private readonly string _logPath;
        private static readonly ConcurrentQueue<AuditRecord> _inMemoryCache = new ConcurrentQueue<AuditRecord>();

        public FileComplianceLogger(string logDirectory = "./logs")
        {
            if (!Directory.Exists(logDirectory))
            {
                Directory.CreateDirectory(logDirectory);
            }
            _logPath = Path.Combine(logDirectory, "shield_audit.jsonl");
        }

        public async Task LogDecisionAsync(AuditRecord record)
        {
            // 1. Add to In-Memory Cache for real-time Dashboard
            _inMemoryCache.Enqueue(record);
            if (_inMemoryCache.Count > 100) _inMemoryCache.TryDequeue(out _);

            // 2. Persist to Disk (JSON Lines format)
            var json = JsonSerializer.Serialize(record);
            await File.AppendAllTextAsync(_logPath, json + Environment.NewLine);
        }

        public Task<IEnumerable<AuditRecord>> GetRecentLogsAsync(int count)
        {
            // Returns cached logs for the Dashboard API
            return Task.FromResult<IEnumerable<AuditRecord>>(_inMemoryCache.ToArray());
        }

        public static string ComputeHash(string input)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(input));
            return Convert.ToBase64String(bytes);
        }
    }
}