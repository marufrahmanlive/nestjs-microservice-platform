import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '@app/common';

/** Inject the authenticated JWT payload into a controller method param. */
export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): JwtPayload => {
  return ctx.switchToHttp().getRequest().user;
});
