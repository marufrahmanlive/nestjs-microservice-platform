/**
 * Request/response message patterns (TCP transport, synchronous).
 *
 * Naming: <service>.<resource>.<action>
 * Keep these stable — they're effectively a wire contract between services.
 */
export const AUTH_PATTERNS = {
  REGISTER: 'auth.user.register',
  LOGIN: 'auth.user.login',
  VALIDATE_TOKEN: 'auth.token.validate',
  REFRESH_TOKEN: 'auth.token.refresh',
  LOGOUT: 'auth.user.logout',
} as const;

export const USER_PATTERNS = {
  CREATE: 'user.create',
  FIND_BY_ID: 'user.findById',
  FIND_BY_EMAIL: 'user.findByEmail',
  LIST: 'user.list',
  UPDATE: 'user.update',
  DELETE: 'user.delete',
  CHANGE_PASSWORD: 'user.changePassword',
} as const;
