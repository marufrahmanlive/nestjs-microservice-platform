import { UserRole } from '@app/constants';

/** Decoded JWT body. Keep this minimal — anything large should be looked up server-side. */
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload extends JwtPayload {
  tokenId: string;
}
