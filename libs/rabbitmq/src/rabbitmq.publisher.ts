import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ChannelWrapper } from 'amqp-connection-manager';
import { RABBIT_CHANNEL } from './rabbitmq.constants';

export interface PublishOptions {
  /** Stable id for idempotent consumers. Defaults to a generated UUID. */
  messageId?: string;
  /** Persist on disk in RabbitMQ — survives broker restart. */
  persistent?: boolean;
  /** Correlation ID for distributed tracing. */
  correlationId?: string;
  /** Additional AMQP headers. */
  headers?: Record<string, unknown>;
  /** TTL on the message itself in ms. Beyond this, message is dead-lettered. */
  expiration?: number;
}

/**
 * Async event publisher. Uses publisher confirms so we know the broker
 * accepted the message — without this, a network blip silently loses events.
 */
@Injectable()
export class RabbitMQPublisher {
  private readonly logger = new Logger(RabbitMQPublisher.name);
  private readonly exchange: string;

  constructor(
    @Inject(RABBIT_CHANNEL) private readonly channel: ChannelWrapper,
    config: ConfigService,
  ) {
    this.exchange = config.getOrThrow<string>('rabbitmq.exchange');
  }

  async publish<T>(routingKey: string, payload: T, options: PublishOptions = {}): Promise<void> {
    try {
      await this.channel.publish(this.exchange, routingKey, payload, {
        contentType: 'application/json',
        persistent: options.persistent ?? true,
        messageId: options.messageId,
        correlationId: options.correlationId,
        headers: { 'x-attempt': 0, ...(options.headers || {}) },
        expiration: options.expiration?.toString(),
      });
      this.logger.debug(`Published to ${this.exchange}/${routingKey}`);
    } catch (err) {
      // Publish to amqp-connection-manager is buffered when offline,
      // so a thrown error here is a genuine fatal condition (e.g. serialization).
      this.logger.error(`Publish failed (${routingKey}): ${(err as Error).message}`);
      throw err;
    }
  }
}
