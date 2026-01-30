export interface AuditLog {
  AuditId: string;
  CorrelationId: string;
  UserPromptHash: string;
  Timestamp: string;
  SafetyDecision: 'Approved' | 'Redacted' | 'Rejected' | 'Blocked';
  WasRedacted: boolean;
  DetectedPiiTypes: string[];
  OriginalPromptLength: number;
}

export interface ChatResponse {
  id: string;
  content: string;
  isRedacted: boolean;
  timestamp: string;
  auditRecord?: AuditLog;
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
