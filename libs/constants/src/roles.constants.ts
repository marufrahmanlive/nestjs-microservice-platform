export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST',
}

/** Role hierarchy used by RolesGuard. Higher number = more privileged. */
export const ROLE_RANK: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 100,
  [UserRole.ADMIN]: 50,
  [UserRole.USER]: 10,
  [UserRole.GUEST]: 1,
};
