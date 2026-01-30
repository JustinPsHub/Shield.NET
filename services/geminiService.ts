import { ChatResponse, AuditLog, ShieldPolicy, RiskTier, RedactionEvent, ProviderType } from '../types';
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; 
  }
  return "HASH-" + Math.abs(hash).toString(16).toUpperCase();
};

const generateSmartMockResponse = (redactedText: string): string => {
  if (redactedText.includes("<EMAIL>") && redactedText.includes("<IP>")) {
    return "I cannot verify the user <EMAIL> originating from <IP> as I lack access to the identity provider's private records.";
  }
  if (redactedText.includes("<EMAIL>")) {
    return "I have received a request regarding <EMAIL>. I can process the account structure, but I cannot view the actual email address due to privacy filters.";
  }
  if (redactedText.includes("<IP>")) {
    return "The IP address <IP> has been logged. I cannot perform external network diagnostics on this specific address.";
  }
  
  if (redactedText.includes("PromptInjection")) return "I cannot fulfill that request.";
  if (redactedText.includes("Base64")) return "I have detected an encoded payload. I cannot execute obfuscated commands.";
  if (redactedText.includes("DROP TABLE")) return "Database operations are strictly prohibited in this chat context.";
  if (redactedText.includes("[REDACTED-CUSTOM]")) return "I noticed some content was redacted by a custom organizational policy. I will proceed with the remaining context.";
  
  const snippet = redactedText.substring(0, 40);
  return `I have processed the sanitized input: "${snippet}${redactedText.length > 40 ? '...' : ''}". The sensitive data has been successfully masked.`;
};

/**
 * Enhanced Redaction Engine that tracks EXACT replacements for the Diff Viewer
 */
const redactPII = (input: string, policy: ShieldPolicy): { redactedText: string; detectedTypes: string[]; redactions: RedactionEvent[] } => {
  let redactedText = input;
  const detectedTypes: string[] = [];
  const redactions: RedactionEvent[] = [];

  // Helper to replace and track
  const applyReplacement = (regex: RegExp, type: string, replacementTag: string) => {
    // We iterate manually to capture the exact string that was matched for the forensic log
    let match;
    // Reset regex index if global
    regex.lastIndex = 0;
    
    // Find all matches first to track them
    const matches: {str: string, index: number}[] = [];
    while ((match = regex.exec(redactedText)) !== null) {
        matches.push({ str: match[0], index: match.index });
    }

    if (matches.length > 0) {
        if (!detectedTypes.includes(type)) detectedTypes.push(type);
        
        // Apply replacement
        redactedText = redactedText.replace(regex, (matchedStr) => {
            // We push to redactions here, but we need to be careful about indices shifting if we were tracking strict indices.
            // For the visual diff, knowing the "original string" is usually enough to highlight it in the raw text.
            redactions.push({
                original: matchedStr,
                replacement: replacementTag,
                type: type,
                index: 0 // Index tracking in a multi-pass replacement is complex; simplifying for demo to "content match"
            });
            return replacementTag;
        });
    }
  };

  const lowerInput = input.toLowerCase();

  if (policy.enableRedaction) {
    if (policy.redactEmail) {
      applyReplacement(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, "Email", "<EMAIL>");
    }
    if (policy.redactIp) {
      applyReplacement(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "IPAddress", "<IP>");
    }
    if (policy.customRegexPattern) {
        try {
            const safePattern = policy.customRegexPattern;
            const replacement = policy.customRegexReplacement || '[REDACTED-CUSTOM]';
            const regex = new RegExp(safePattern, 'gi');
            applyReplacement(regex, "CustomRule", replacement);
        } catch (e) {
            console.warn("Invalid custom regex", e);
        }
    }
  }

  // Traps
  if (policy.blockPromptInjection) {
      if (lowerInput.includes("ignore previous instructions")) detectedTypes.push("PromptInjection");
      if (lowerInput.includes("do anything now") || lowerInput.includes("jailbreak")) detectedTypes.push("PromptInjection");
      if (lowerInput.includes("drop table") || lowerInput.includes("union select")) detectedTypes.push("SQLInjection");
      if (input.includes("VGhpcyBpcyBhIHNlY3JldA==") || lowerInput.includes("base64")) detectedTypes.push("Obfuscation");
  }

  return { redactedText, detectedTypes, redactions };
};

const determineRiskTier = (wasRedacted: boolean, detectedTypes: string[]): RiskTier => {
    if (detectedTypes.includes("SQLInjection") || detectedTypes.includes("Obfuscation")) return 'Critical';
    if (detectedTypes.includes("PromptInjection")) return 'Critical';
    if (wasRedacted) return 'High';
    return 'Info';
}

export const sendMessageToGemini = async (message: string, policy: ShieldPolicy, provider: ProviderType = 'Azure OpenAI'): Promise<ChatResponse> => {
  const { redactedText, detectedTypes, redactions } = redactPII(message, policy);
  const wasRedacted = detectedTypes.length > 0;
  
  const blockList = ["PromptInjection", "SQLInjection", "Obfuscation"];
  const isBlocked = detectedTypes.some(type => blockList.includes(type));
  const riskTier = determineRiskTier(wasRedacted, detectedTypes);

  // Provider Simulation Latency
  let baseLatency = 400; // Azure default
  if (provider === 'Ollama (Local)') baseLatency = 40; // Very fast network, slow tokens
  if (provider === 'AWS Bedrock') baseLatency = 550;
  if (provider === 'Google Vertex') baseLatency = 300;
  
  const jitter = Math.floor(Math.random() * 100);
  const totalLatency = baseLatency + jitter;

  const auditRecord: AuditLog = {
    AuditId: crypto.randomUUID(),
    CorrelationId: `CID-${Date.now()}`,
    UserPromptHash: simpleHash(message),
    Timestamp: new Date().toISOString(),
    SafetyDecision: isBlocked ? 'Blocked' : (wasRedacted ? "Redacted" : "Approved"),
    WasRedacted: wasRedacted,
    DetectedPiiTypes: detectedTypes,
    OriginalPromptLength: message.length,
    RiskTier: riskTier,
    // Forensic Data
    OriginalPrompt: message,
    RedactedPrompt: redactedText,
    RedactionDetails: redactions,
    Provider: provider,
    LatencyMs: totalLatency
  };

  if (isBlocked) {
    const violationType = detectedTypes.find(t => blockList.includes(t)) || "Unknown";
    return {
      id: crypto.randomUUID(),
      content: `[BLOCKED BY SHIELD.NET] Security Violation: ${violationType}. Sarah Connor Protocol Active.`,
      llmResponse: "N/A - Request terminated before egress.",
      isRedacted: wasRedacted,
      timestamp: new Date().toISOString(),
      auditRecord: auditRecord,
      isSimulation: true
    };
  }

  let llmOutput = "";
  let isSimulation = true;
  
  if (ai) {
    try {
       const result = await ai.models.generateContent({
         model: 'gemini-3-flash-preview',
         contents: redactedText, 
         config: { maxOutputTokens: 60 }
       });
       if (result.text) {
         llmOutput = result.text;
         isSimulation = false;
       }
    } catch (e) {
      llmOutput = generateSmartMockResponse(redactedText);
    }
  } else {
    llmOutput = generateSmartMockResponse(redactedText);
  }

  return {
    id: crypto.randomUUID(),
    content: redactedText,
    llmResponse: llmOutput,
    isRedacted: wasRedacted,
    timestamp: new Date().toISOString(),
    auditRecord: auditRecord,
    isSimulation
  };
};

export const analyzeInputWithShield = sendMessageToGemini;