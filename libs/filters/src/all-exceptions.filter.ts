import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse, DomainException } from '@app/common';
import { ERROR_CODES } from '@app/constants';

/**
 * Global HTTP exception filter. Three layers, in order:
 *   1. DomainException  -> already carries `code` + `status`, pass through.
 *   2. HttpException    -> map to a generic code derived from the status.
 *   3. Anything else    -> 500 INTERNAL_ERROR (do NOT leak the stack to clients).
 *
 * Always returns the standard ApiErrorResponse envelope.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request & { correlationId?: string }>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: string = ERROR_CODES.INTERNAL_ERROR;
    let message = 'Internal server error';
    let errors: unknown = undefined;

    if (exception instanceof DomainException) {
      status = exception.getStatus();
      code = exception.code;
      message = exception.message;
      errors = exception.details;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (typeof body === 'object' && body !== null) {
        const obj = body as { code?: string; message?: string | string[]; errors?: unknown };
        message = Array.isArray(obj.message) ? obj.message.join('; ') : (obj.message ?? exception.message);
        if (obj.code) code = obj.code;
        if (obj.errors) errors = obj.errors;
        if (!obj.code) code = this.statusToCode(status);
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
    }

    // Never leak stack traces to clients in non-dev environments.
    const payload: ApiErrorResponse = {
      success: false,
      statusCode: status,
      code,
      message,
      errors,
      timestamp: new Date().toISOString(),
      path: req.url,
      correlationId: req.correlationId,
    };

    res.status(status).json(payload);
  }

  private statusToCode(status: number): string {
    switch (status) {
      case 400: return ERROR_CODES.VALIDATION_FAILED;
      case 401: return ERROR_CODES.UNAUTHORIZED;
      case 403: return ERROR_CODES.FORBIDDEN;
      case 404: return ERROR_CODES.NOT_FOUND;
      case 409: return ERROR_CODES.CONFLICT;
      case 429: return ERROR_CODES.RATE_LIMITED;
      case 503: return ERROR_CODES.SERVICE_UNAVAILABLE;
      default: return ERROR_CODES.INTERNAL_ERROR;
    }
  }
}
