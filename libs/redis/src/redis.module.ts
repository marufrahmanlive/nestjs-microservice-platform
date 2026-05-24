import { Global, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';
import { RedisService } from './redis.service';

/**
 * Global Redis module. One ioredis client per process — connection pooling
 * is handled by ioredis. Includes graceful shutdown so SIGTERM doesn't drop
 * in-flight commands.
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new Redis({
          host: config.getOrThrow<string>('redis.host'),
          port: config.getOrThrow<number>('redis.port'),
          password: config.get<string>('redis.password') || undefined,
          db: config.get<number>('redis.db', 0),
          keyPrefix: config.get<string>('redis.keyPrefix', 'app:'),
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          // Auto-reconnect with jittered backoff capped at 2s.
          retryStrategy: (times) => Math.min(times * 100 + Math.random() * 100, 2000),
        }),
    },
    RedisService,
  ],
  exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(private readonly redisService: RedisService) {}

  async onApplicationShutdown(): Promise<void> {
    await this.redisService.quit();
  }
}
