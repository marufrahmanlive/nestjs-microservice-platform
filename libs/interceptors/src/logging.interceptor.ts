import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

/**
 * One structured log line per request, with duration in ms.
 * Pairs with the correlation-id middleware so log lines can be joined across services.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request & { correlationId?: string }>();
    const res = http.getResponse<Response>();
    const start = process.hrtime.bigint();

    return next.handle().pipe(
      tap({
        next: () => this.log(req, res, start, 'OK'),
        error: () => this.log(req, res, start, 'ERR'),
      }),
    );
  }

  private log(
    req: Request & { correlationId?: string },
    res: Response,
    start: bigint,
    outcome: 'OK' | 'ERR',
  ): void {
    const elapsedMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    this.logger.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${outcome} ${elapsedMs.toFixed(1)}ms cid=${req.correlationId ?? '-'}`,
    );
  }
}
