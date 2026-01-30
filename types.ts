export type RiskTier = 'Info' | 'Low' | 'Medium' | 'High' | 'Critical';

export interface AuditLog {
  AuditId: string;
  CorrelationId: string;
  UserPromptHash: string;
  Timestamp: string;
  SafetyDecision: 'Approved' | 'Redacted' | 'Rejected' | 'Blocked';
  WasRedacted: boolean;
  DetectedPiiTypes: string[];
  OriginalPromptLength: number;
  RiskTier: RiskTier; // ISO 42001 Risk Classification
}

export interface ChatResponse {
  id: string;
  content: string; // The redacted content (what the LLM sees)
  llmResponse?: string; // What the LLM replies (simulated or real)
  isRedacted: boolean;
  timestamp: string;
  auditRecord?: AuditLog;
  isSimulation: boolean; // Indicates if the response was generated locally (Zero Cost)
}

export interface ShieldPolicy {
  enableRedaction: boolean;
  redactEmail: boolean;
  redactIp: boolean;
  blockPromptInjection: boolean;
  detectHallucination: boolean; // Placeholder for future logic
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
