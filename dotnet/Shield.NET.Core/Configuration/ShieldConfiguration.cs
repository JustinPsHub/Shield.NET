using System;

namespace Shield.NET.Core.Configuration
{
    public class ShieldConfiguration
    {
        public bool Enabled { get; set; } = true;
        
        /// <summary>
        /// If true, sensitive patterns (SSN, Email) are replaced with [REDACTED] before sending to LLM.
        /// </summary>
        public bool RedactPii { get; set; } = true;

        /// <summary>
        /// If true, performs a secondary consistency check on the response.
        /// </summary>
        public bool DetectHallucinations { get; set; } = false;

        /// <summary>
        /// If true, throws an exception if high-risk content is detected, stopping the pipeline.
        /// </summary>
        public bool BlockPromptInjection { get; set; } = true;

        /// <summary>
        /// Directory or Endpoint to ship JSON audit logs to.
        /// </summary>
        public string LogOutputPath { get; set; } = "./logs";
        
        /// <summary>
        /// Name of the application utilizing the library (for audit trails).
        /// </summary>
        public string ApplicationName { get; set; } = "ShieldApp";
    }
}