export type RiskTier = 'Info' | 'Low' | 'Medium' | 'High' | 'Critical';
export type ProviderType = 'Azure OpenAI' | 'AWS Bedrock' | 'Google Vertex' | 'Ollama (Local)';

export interface RedactionEvent {
  original: string;
  replacement: string;
  type: string;
  index: number;
}

export interface AuditLog {
  AuditId: string;
  CorrelationId: string;
  UserPromptHash: string;
  Timestamp: string;
  SafetyDecision: 'Approved' | 'Redacted' | 'Rejected' | 'Blocked';
  WasRedacted: boolean;
  DetectedPiiTypes: string[];
  OriginalPromptLength: number;
  RiskTier: RiskTier;
  // Forensic Data
  OriginalPrompt: string;
  RedactedPrompt: string;
  RedactionDetails: RedactionEvent[];
  Provider: ProviderType;
  LatencyMs: number;
}

export interface ChatResponse {
  id: string;
  content: string; // The redacted content
  llmResponse?: string;
  isRedacted: boolean;
  timestamp: string;
  auditRecord?: AuditLog;
  isSimulation: boolean;
}

export interface ShieldPolicy {
  enableRedaction: boolean;
  redactEmail: boolean;
  redactIp: boolean;
  blockPromptInjection: boolean;
  detectHallucination: boolean;
  customRegexPattern?: string;
  customRegexReplacement?: string;
}

export interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  highlight?: boolean;
}

export interface FeatureProps {
  title: string;
  description: string;
  active?: boolean;
  onClick?: () => void;
}

export interface AttackVector {
    id: string;
    name: string;
    description: string;
    payload: string;
    difficulty: 'Low' | 'Medium' | 'High';
}

export interface MetricPoint {
    time: string;
    tokensSaved: number;
    latency: number;
    allowedRequests: number;
    blockedRequests: number;
}