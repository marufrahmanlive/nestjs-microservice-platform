/**
 * Centralized Redis cache key builders.
 *
 * Why functions instead of string templates everywhere:
 *  - One place to refactor when the namespace changes.
 *  - Prevents typos and accidental key collisions across services.
 */
export const CACHE_KEYS = {
  userById: (id: string) => `user:id:${id}`,
  userByEmail: (email: string) => `user:email:${email.toLowerCase()}`,
  userList: (hash: string) => `user:list:${hash}`,
  otp: (email: string) => `otp:${email.toLowerCase()}`,
  refreshToken: (userId: string) => `refresh:${userId}`,
  rateLimit: (key: string) => `rl:${key}`,
} as const;

export const CACHE_TTL = {
  SHORT: 60,
  MEDIUM: 300,
  LONG: 3600,
  ONE_DAY: 86400,
} as const;
