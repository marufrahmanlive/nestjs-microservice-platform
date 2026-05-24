import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** Inject the request's correlation id (set by CorrelationIdMiddleware). */
export const CorrelationId = createParamDecorator((_: unknown, ctx: ExecutionContext): string | undefined => {
  return ctx.switchToHttp().getRequest().correlationId;
});
