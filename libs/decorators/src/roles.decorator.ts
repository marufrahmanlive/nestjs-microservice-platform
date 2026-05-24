import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@app/constants';

export const ROLES_KEY = 'roles';

/** Mark a route/controller as requiring one of the listed roles. Use with RolesGuard. */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
