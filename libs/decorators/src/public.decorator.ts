import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Opt a route out of the global JwtAuthGuard.
 * Use sparingly — e.g., /auth/login, /auth/register, /health.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
