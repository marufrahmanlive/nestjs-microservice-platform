import { Injectable, Scope } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

/**
 * Thin wrapper over PinoLogger that:
 *   - exposes a domain-friendly API (info/warn/error/debug)
 *   - lets services tag context with a module name
 *
 * Use this instead of `console.*` or the default Nest logger.
 */
@Injectable({ scope: Scope.TRANSIENT })
export class AppLoggerService {
  constructor(private readonly logger: PinoLogger) {}

  setContext(context: string): void {
    this.logger.setContext(context);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.logger.info(meta ?? {}, message);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.logger.warn(meta ?? {}, message);
  }

  error(message: string, error?: unknown, meta?: Record<string, unknown>): void {
    const err = error instanceof Error ? { err: { message: error.message, stack: error.stack } } : { err: error };
    this.logger.error({ ...meta, ...err }, message);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.logger.debug(meta ?? {}, message);
  }

  trace(message: string, meta?: Record<string, unknown>): void {
    this.logger.trace(meta ?? {}, message);
  }
}
