export interface EmailEvent {
  messageId: string;
  to: string | string[];
  subject: string;
  template?: string;
  context?: Record<string, unknown>;
  html?: string;
  text?: string;
  occurredAt: string;
}
