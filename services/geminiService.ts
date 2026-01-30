import { ChatResponse, AuditLog, ShieldPolicy, RiskTier } from '../types';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini (Safe failover if no key)
// In "Showcase" mode (GitHub Demo), this is often undefined, ensuring zero cost.
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

/**
 * Smart Mock Engine
 * Generates context-aware "LLM Responses" locally to demonstrate guardrail utility
 * without incurring API costs.
 */
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
  if (redactedText.includes("PromptInjection")) {
    return "I cannot fulfill that request.";
  }
  
  // Default generic response echoing the input to prove the LLM "sees" the redacted version
  const snippet = redactedText.substring(0, 40);
  return `I have processed the sanitized input: "${snippet}${redactedText.length > 40 ? '...' : ''}". The sensitive data has been successfully masked.`;
};

/**
 * Enhanced Redaction Engine that respects the active ShieldPolicy.
 */
const redactPII = (input: string, policy: ShieldPolicy): { redactedText: string; detectedTypes: string[] } => {
  let redactedText = input;
  const detectedTypes: string[] = [];

  if (policy.enableRedaction) {
    // Regex for Email
    if (policy.redactEmail) {
      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
      if (emailRegex.test(redactedText)) {
        detectedTypes.push("Email");
        redactedText = redactedText.replace(emailRegex, "<EMAIL>");
      }
    }

    // Regex for IPv4
    if (policy.redactIp) {
      const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
      if (ipRegex.test(redactedText)) {
        detectedTypes.push("IPAddress");
        redactedText = redactedText.replace(ipRegex, "<IP>");
      }
    }
  }

  // Trap for Prompt Injection
  if (policy.blockPromptInjection && input.toLowerCase().includes("ignore previous instructions")) {
     detectedTypes.push("PromptInjection");
  }

  return { redactedText, detectedTypes };
};

const determineRiskTier = (wasRedacted: boolean, isBlocked: boolean): RiskTier => {
    if (isBlocked) return 'Critical';
    if (wasRedacted) return 'High';
    return 'Info';
}

/**
 * Processes the message through the Shield Middleware simulation.
 * Prioritizes Zero-Cost simulation if no API key is present.
 */
export const sendMessageToGemini = async (message: string, policy: ShieldPolicy): Promise<ChatResponse> => {
  // 1. Execute the PII Detection Logic based on Policy
  const { redactedText, detectedTypes } = redactPII(message, policy);
  const wasRedacted = detectedTypes.length > 0;
  const isBlocked = detectedTypes.includes("PromptInjection");
  
  // 2. Determine Risk Tier (ISO 42001)
  const riskTier = determineRiskTier(wasRedacted, isBlocked);

  // 3. Generate the Audit Record
  const auditRecord: AuditLog = {
    AuditId: crypto.randomUUID(),
    CorrelationId: `CID-${Date.now()}`,
    UserPromptHash: simpleHash(message),
    Timestamp: new Date().toISOString(),
    SafetyDecision: isBlocked ? 'Blocked' : (wasRedacted ? "Redacted" : "Approved"),
    WasRedacted: wasRedacted,
    DetectedPiiTypes: detectedTypes,
    OriginalPromptLength: message.length,
    RiskTier: riskTier
  };

  if (isBlocked) {
    return {
      id: crypto.randomUUID(),
      content: "[BLOCKED BY SHIELD.NET] Prompt Injection pattern detected. Sarah Connor Protocol Active.",
      llmResponse: "N/A - Request terminated before egress.",
      isRedacted: wasRedacted,
      timestamp: new Date().toISOString(),
      auditRecord: auditRecord,
      isSimulation: true
    };
  }

  // 4. (Optional) Real LLM Round-Trip vs Smart Simulation
  // We send the *REDACTED* text to the model to show safety.
  let llmOutput = "";
  let isSimulation = true;
  
  if (ai) {
    try {
       // We use a fast model to demonstrate the 'Context' understanding despite redaction
       const result = await ai.models.generateContent({
         model: 'gemini-3-flash-preview',
         contents: redactedText, 
         config: {
           maxOutputTokens: 60, // Keep it short for the UI
         }
       });
       if (result.text) {
         llmOutput = result.text;
         isSimulation = false;
       }
    } catch (e) {
      console.warn("Gemini API call failed, falling back to smart simulation", e);
      llmOutput = generateSmartMockResponse(redactedText);
    }
  } else {
    // Zero-Cost Path
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
