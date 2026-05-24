import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const message = exception.getResponse();

    this.logger.error(
      `HTTP ${status} ${request.method} ${request.url}`,
      exception.stack,
    );

    response.status(status).json({
      success: false,
      statusCode: status,
      message: message instanceof Object ? message : exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
