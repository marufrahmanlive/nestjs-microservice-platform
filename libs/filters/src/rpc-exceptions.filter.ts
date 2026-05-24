import { ArgumentsHost, Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { ERROR_CODES } from '@app/constants';

/**
 * Microservice-side exception filter. Converts any thrown error into a stable
 * RpcException shape that the gateway can re-throw as the matching HttpException.
 *
 * Why we don't just rely on Nest's BaseRpcExceptionFilter: it serializes the
 * raw error which leaks stack traces. This filter strips internals and only
 * forwards a safe { code, message, status, details } payload.
 */
@Catch()
export class RpcExceptionsFilter extends BaseRpcExceptionFilter {
  private readonly logger = new Logger(RpcExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): Observable<never> {
    if (exception instanceof RpcException) return super.catch(exception, host);

    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      const status = exception.getStatus();
      const shape =
        typeof body === 'object' && body !== null
          ? {
              code: (body as { code?: string }).code ?? this.statusToCode(status),
              message: (body as { message?: string }).message ?? exception.message,
              status,
              details: (body as { errors?: unknown }).errors,
            }
          : { code: this.statusToCode(status), message: String(body), status };
      return throwError(() => new RpcException(shape));
    }

    if (exception instanceof Error) {
      this.logger.error(`Unhandled RPC error: ${exception.message}`, exception.stack);
    }
    return throwError(
      () =>
        new RpcException({
          code: ERROR_CODES.INTERNAL_ERROR,
          message: 'Internal microservice error',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        }),
    );
  }

  private statusToCode(status: number): string {
    switch (status) {
      case 400: return ERROR_CODES.VALIDATION_FAILED;
      case 401: return ERROR_CODES.UNAUTHORIZED;
      case 403: return ERROR_CODES.FORBIDDEN;
      case 404: return ERROR_CODES.NOT_FOUND;
      case 409: return ERROR_CODES.CONFLICT;
      default: return ERROR_CODES.INTERNAL_ERROR;
    }
  }
}
