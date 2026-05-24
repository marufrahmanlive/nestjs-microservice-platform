import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

/**
 * Thin, typed wrapper over ioredis. Two patterns it exists to encourage:
 *
 *   1. `getOrSet(key, ttl, fetch)` — the read-through cache. Always prefer this
 *      over `if (cached) return cached; else compute() and set()`, because it
 *      eliminates the race condition between the two branches.
 *
 *   2. `incrWithTtl(key, ttl)` — atomic INCR + EXPIRE for rate limiting / counters.
 *      Pipelined to avoid a separate round-trip for the TTL set.
 */
@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private readonly defaultTtl: number;

  constructor(
    @Inject(REDIS_CLIENT) private readonly client: Redis,
    config: ConfigService,
  ) {
    this.defaultTtl = config.get<number>('redis.defaultTtl', 300);
    this.client.on('error', (err) => this.logger.error(`Redis error: ${err.message}`));
    this.client.on('connect', () => this.logger.log('Redis connected'));
  }

  getClient(): Redis {
    return this.client;
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number = this.defaultTtl): Promise<void> {
    const payload = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds > 0) await this.client.set(key, payload, 'EX', ttlSeconds);
    else await this.client.set(key, payload);
  }

  async del(...keys: string[]): Promise<number> {
    if (!keys.length) return 0;
    return this.client.del(...keys);
  }

  /**
   * Read-through cache. The fetch closure only runs on a miss.
   * On Redis failure we log and fall back to the live source — caching is
   * an optimization, not a hard dependency.
   */
  async getOrSet<T>(key: string, ttlSeconds: number, fetch: () => Promise<T>): Promise<T> {
    try {
      const hit = await this.get<T>(key);
      if (hit !== null) return hit;
    } catch (err) {
      this.logger.warn(`Cache read failed for ${key}: ${(err as Error).message}`);
    }

    const value = await fetch();

    try {
      if (value !== undefined && value !== null) await this.set(key, value, ttlSeconds);
    } catch (err) {
      this.logger.warn(`Cache write failed for ${key}: ${(err as Error).message}`);
    }
    return value;
  }

  /** Atomic INCR + EXPIRE (only on first increment). Used by rate limiter. */
  async incrWithTtl(key: string, ttlSeconds: number): Promise<number> {
    const pipeline = this.client.multi();
    pipeline.incr(key);
    pipeline.expire(key, ttlSeconds, 'NX');
    const result = await pipeline.exec();
    return Number((result?.[0]?.[1] as number | undefined) ?? 0);
  }

  /**
   * Invalidate cache keys matching a pattern. Uses SCAN — never KEYS,
   * which blocks Redis on large datasets.
   */
  async deletePattern(pattern: string): Promise<number> {
    let cursor = '0';
    let deleted = 0;
    do {
      const [next, batch] = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = next;
      if (batch.length) deleted += await this.client.del(...batch);
    } while (cursor !== '0');
    return deleted;
  }

  async ping(): Promise<boolean> {
    try {
      const res = await this.client.ping();
      return res === 'PONG';
    } catch {
      return false;
    }
  }

  async quit(): Promise<void> {
    try {
      await this.client.quit();
    } catch {
      /* already closed */
    }
  }
}
