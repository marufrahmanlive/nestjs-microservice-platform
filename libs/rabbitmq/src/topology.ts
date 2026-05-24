import type { ConfirmChannel } from 'amqplib';

export interface TopologyConfig {
  exchange: string;
  dlx: string;
  dlq: string;
  queues: { name: string; routingKey: string }[];
  retryDelayMs: number;
}

/**
 * Declares the canonical RabbitMQ topology on a channel.
 *
 *   exchange (topic) ──> queue (with x-dead-letter-exchange = dlx)
 *                                                    │
 *                              consumer NACKs ──────►│
 *                                                    ▼
 *                                              dlx ──> dlq
 *
 * Why a dedicated DLX:
 *   - Operators get one queue (`app.dlq`) to inspect for poison messages.
 *   - The consumer code stays simple: NACK with requeue=false hands off to the DLX.
 *
 * Retry strategy: see RabbitMQPublisher.publishWithRetry — we use the
 * x-delay header pattern via a header on republish, with attempt-count
 * tracked in the message headers.
 */
export async function assertTopology(channel: ConfirmChannel, config: TopologyConfig): Promise<void> {
  await channel.assertExchange(config.exchange, 'topic', { durable: true });
  await channel.assertExchange(config.dlx, 'topic', { durable: true });

  await channel.assertQueue(config.dlq, { durable: true });
  await channel.bindQueue(config.dlq, config.dlx, '#');

  for (const q of config.queues) {
    await channel.assertQueue(q.name, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': config.dlx,
        'x-dead-letter-routing-key': q.routingKey,
      },
    });
    await channel.bindQueue(q.name, config.exchange, q.routingKey);
  }
}
