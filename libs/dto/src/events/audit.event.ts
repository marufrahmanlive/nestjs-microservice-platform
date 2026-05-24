export interface AuditEvent {
  messageId: string;
  actorId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  occurredAt: string;
}
