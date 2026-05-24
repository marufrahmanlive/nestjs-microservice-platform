export const QUEUES = {
  NOTIFICATION: 'notification.queue',
  EMAIL: 'email.queue',
  AUDIT: 'audit.queue',
} as const;

/** Exchange names used by the topology defined in libs/rabbitmq. */
export const EXCHANGES = {
  MAIN: 'app.events',
  DLX: 'app.dlx',
} as const;

export const DEAD_LETTER = {
  EXCHANGE: 'app.dlx',
  QUEUE: 'app.dlq',
  ROUTING_KEY: 'dead',
} as const;
