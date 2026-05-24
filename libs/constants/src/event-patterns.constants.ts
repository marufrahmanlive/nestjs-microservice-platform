/**
 * Fire-and-forget event patterns published to RabbitMQ.
 *
 * Naming: <domain>.<entity>.<past-tense-verb>
 * Past tense = "this already happened". Consumers should be idempotent.
 */
export const EVENT_PATTERNS = {
  USER_REGISTERED: 'user.registered',
  USER_PASSWORD_CHANGED: 'user.password.changed',
  USER_DELETED: 'user.deleted',

  NOTIFICATION_SEND: 'notification.send',
  EMAIL_SEND: 'email.send',

  AUDIT_LOG: 'audit.log',
} as const;

export type EventPattern = (typeof EVENT_PATTERNS)[keyof typeof EVENT_PATTERNS];
