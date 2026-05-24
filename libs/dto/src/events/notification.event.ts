export type NotificationChannel = 'push' | 'sms' | 'in-app';

export interface NotificationEvent {
  /** Stable id so consumers can dedupe replays. */
  messageId: string;
  userId: string;
  channel: NotificationChannel;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  occurredAt: string;
}
