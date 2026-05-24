import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { RefreshTokenPayload } from '@app/common';

/**
 * Refresh-token strategy. We extract the token from either:
 *   1. an httpOnly refreshToken cookie (preferred for browsers)
 *   2. the Authorization header (mobile / service-to-service)
 *
 * Storing the raw token from the request on `req.user.refreshToken` lets
 * the auth service compare against the hashed token in Redis/Mongo
 * before issuing new tokens.
 */
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => (req?.cookies as Record<string, string> | undefined)?.refreshToken ?? null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('jwt.refreshSecret'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: RefreshTokenPayload) {
    const refreshToken =
      (req.cookies as Record<string, string> | undefined)?.refreshToken ??
      (req.headers.authorization?.replace(/^Bearer\s+/, '') ?? null);
    return { ...payload, refreshToken };
  }
}
