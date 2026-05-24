import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@app/decorators';
import { ROLE_RANK, UserRole } from '@app/constants';
import { JwtPayload } from '@app/common';

/**
 * Role-based authorization. Uses a numeric role rank so "ADMIN-or-higher"
 * checks don't need exhaustive enum lists — any role with rank >= the
 * lowest required role satisfies the check.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const user = context.switchToHttp().getRequest().user as JwtPayload | undefined;
    if (!user) throw new ForbiddenException('Authentication required');

    const userRank = ROLE_RANK[user.role] ?? 0;
    const minRequiredRank = Math.min(...required.map((r) => ROLE_RANK[r] ?? Infinity));
    if (userRank < minRequiredRank) throw new ForbiddenException('Insufficient role');
    return true;
  }
}
