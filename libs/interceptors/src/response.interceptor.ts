import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Request, Response } from 'express';
import { ApiResponse } from '@app/common';

/**
 * Wraps every successful HTTP response in the standard ApiResponse envelope.
 *
 * Controllers may opt-out of wrapping by returning a payload that already has
 * `success` set (e.g. for streaming responses or custom shapes). This keeps
 * the interceptor stateless and prevents double-wrapping.
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T> | T> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T> | T> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request & { correlationId?: string }>();
    const res = http.getResponse<Response>();

    return next.handle().pipe(
      map((data: T) => {
        if (data && typeof data === 'object' && 'success' in (data as object)) return data;
        return {
          success: true,
          statusCode: res.statusCode || HttpStatus.OK,
          message: 'OK',
          data,
          timestamp: new Date().toISOString(),
          path: req.url,
          correlationId: req.correlationId,
        } as ApiResponse<T>;
      }),
    );
  }
}
