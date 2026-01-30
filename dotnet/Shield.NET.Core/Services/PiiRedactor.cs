using System;
using System.Text.RegularExpressions;

namespace Shield.NET.Core.Services
{
    public interface IPiiRedactor
    {
        (string RedactedText, bool WasRedacted) Redact(string input);
    }

    public class RegexPiiRedactor : IPiiRedactor
    {
        // Optimized Regex for performance (Edge/Hybrid requirement)
        private static readonly Regex SsnRegex = new Regex(@"\b\d{3}-\d{2}-\d{4}\b", RegexOptions.Compiled | RegexOptions.IgnoreCase);
        private static readonly Regex EmailRegex = new Regex(@"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", RegexOptions.Compiled | RegexOptions.IgnoreCase);

        public (string RedactedText, bool WasRedacted) Redact(string input)
        {
            if (string.IsNullOrEmpty(input))
                return (input, false);

            bool modified = false;
            string processed = input;

            // 1. Redact SSNs
            if (SsnRegex.IsMatch(processed))
            {
                processed = SsnRegex.Replace(processed, "[REDACTED-SSN]");
                modified = true;
            }

            // 2. Redact Emails
            if (EmailRegex.IsMatch(processed))
            {
                processed = EmailRegex.Replace(processed, "[REDACTED-EMAIL]");
                modified = true;
            }

            return (processed, modified);
        }
    }
}