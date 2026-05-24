import { CallHandler, ExecutionContext, Injectable, NestInterceptor, RequestTimeoutException } from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

/**
 * Hard cap on request duration. Prevents a stuck downstream from holding
 * the connection open and starving the gateway's request pool.
 */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly timeoutMs = 15_000) {}

  intercept(_: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      timeout(this.timeoutMs),
      catchError((err) => (err instanceof TimeoutError ? throwError(() => new RequestTimeoutException()) : throwError(() => err))),
    );
  }
}
