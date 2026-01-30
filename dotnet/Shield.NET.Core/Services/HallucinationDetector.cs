using System;
using System.Threading.Tasks;

namespace Shield.NET.Core.Services
{
    public interface IHallucinationDetector
    {
        Task<bool> IsHallucinationAsync(string prompt, string response);
    }

    public class BasicHallucinationDetector : IHallucinationDetector
    {
        // In a real implementation, this would likely call a smaller, cheaper model (like GPT-4o-mini or a local ONNX model)
        // to verify if the 'response' is factually consistent with the 'prompt' context or internal knowledge base.
        
        public Task<bool> IsHallucinationAsync(string prompt, string response)
        {
            // Simulation for the "Self-Check" mechanism
            if (string.IsNullOrWhiteSpace(response)) return Task.FromResult(false);

            // Simple heuristic: If the model contradicts itself or uses uncertainty markers aggressively while claiming factuality.
            // For the demo/prototype, we flag responses that contain specific "uncertainty" keywords if the prompt asked for "Facts".
            
            bool promptAsksForFacts = prompt.Contains("fact", StringComparison.OrdinalIgnoreCase) || 
                                      prompt.Contains("history", StringComparison.OrdinalIgnoreCase);

            bool responseIsUncertain = response.Contains("I think", StringComparison.OrdinalIgnoreCase) || 
                                       response.Contains("maybe", StringComparison.OrdinalIgnoreCase);

            // This is a naive implementation for the sake of the C# example structure.
            if (promptAsksForFacts && responseIsUncertain)
            {
                return Task.FromResult(true); 
            }

            return Task.FromResult(false);
        }
    }
}