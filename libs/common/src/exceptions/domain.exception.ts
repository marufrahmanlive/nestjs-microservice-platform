import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Application-layer exception. Carries a stable `code` so clients can branch
 * on it without parsing free-text messages. AllExceptionsFilter unwraps this
 * into the standard ApiErrorResponse envelope.
 */
export class DomainException extends HttpException {
  public readonly code: string;
  public readonly details?: unknown;

  constructor(code: string, message: string, status: HttpStatus = HttpStatus.BAD_REQUEST, details?: unknown) {
    super({ code, message, details }, status);
    this.code = code;
    this.details = details;
  }
}
