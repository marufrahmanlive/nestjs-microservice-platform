import { DynamicModule, Global, Logger, Module, OnApplicationShutdown, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as amqpManager from 'amqp-connection-manager';
import type { AmqpConnectionManager, ChannelWrapper } from 'amqp-connection-manager';
import type { ConfirmChannel } from 'amqplib';
import { RABBIT_CHANNEL, RABBIT_CONNECTION } from './rabbitmq.constants';
import { assertTopology } from './topology';
import { RabbitMQPublisher } from './rabbitmq.publisher';

interface RabbitMQModuleOptions {
  /** Queues this process should declare/bind at startup. Set to [] in publisher-only services. */
  queues: { name: string; routingKey: string }[];
}

/**
 * Provides:
 *   - a resilient AmqpConnectionManager (auto-reconnect with backoff)
 *   - a single ConfirmChannel that asserts the canonical topology
 *   - the RabbitMQPublisher service
 *
 * Used by both publishers (api-gateway) and consumers (workers).
 */
@Global()
@Module({})
export class RabbitMQModule implements OnApplicationShutdown {
  private static connection: AmqpConnectionManager | null = null;
  private readonly logger = new Logger(RabbitMQModule.name);

  static register(options: RabbitMQModuleOptions): DynamicModule {
    const connectionProvider: Provider = {
      provide: RABBIT_CONNECTION,
      inject: [ConfigService],
      useFactory: (config: ConfigService): AmqpConnectionManager => {
        const uri = config.getOrThrow<string>('rabbitmq.uri');
        const connection = amqpManager.connect([uri], {
          heartbeatIntervalInSeconds: 15,
          reconnectTimeInSeconds: 5,
        });
        connection.on('connect', () => Logger.log('RabbitMQ connected', 'RabbitMQModule'));
        connection.on('disconnect', ({ err }) =>
          Logger.warn(`RabbitMQ disconnected: ${err?.message ?? 'unknown'}`, 'RabbitMQModule'),
        );
        RabbitMQModule.connection = connection;
        return connection;
      },
    };

    const channelProvider: Provider = {
      provide: RABBIT_CHANNEL,
      inject: [RABBIT_CONNECTION, ConfigService],
      useFactory: (connection: AmqpConnectionManager, config: ConfigService): ChannelWrapper => {
        const prefetch = config.get<number>('rabbitmq.prefetch', 20);
        const channel = connection.createChannel({
          json: true,
          // setup() runs on every (re)connect — perfect place to (re)assert topology.
          setup: async (ch: ConfirmChannel) => {
            await ch.prefetch(prefetch);
            await assertTopology(ch, {
              exchange: config.getOrThrow<string>('rabbitmq.exchange'),
              dlx: config.getOrThrow<string>('rabbitmq.dlx'),
              dlq: config.getOrThrow<string>('rabbitmq.dlq'),
              queues: options.queues,
              retryDelayMs: config.get<number>('rabbitmq.retryDelayMs', 10000),
            });
          },
        });
        return channel;
      },
    };

    return {
      module: RabbitMQModule,
      imports: [ConfigModule],
      providers: [connectionProvider, channelProvider, RabbitMQPublisher],
      exports: [RABBIT_CONNECTION, RABBIT_CHANNEL, RabbitMQPublisher],
    };
  }

  async onApplicationShutdown(): Promise<void> {
    if (RabbitMQModule.connection) {
      try {
        await RabbitMQModule.connection.close();
      } catch (err) {
        this.logger.warn(`RabbitMQ close error: ${(err as Error).message}`);
      }
    }
  }
}
