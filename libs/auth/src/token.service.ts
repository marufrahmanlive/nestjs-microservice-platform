import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { JwtPayload, RefreshTokenPayload } from '@app/common';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
}

/**
 * Issues access + refresh token pairs.
 *
 * Why separate secrets:
 *   - Compromising the access secret doesn't grant long-lived refresh tokens.
 *   - Lets you rotate them on different schedules.
 *
 * The `tokenId` on the refresh token is what the auth service stores hashed
 * in Redis — that's what gets revoked on logout / suspicious activity.
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async issueTokenPair(
    payload: Pick<JwtPayload, 'sub' | 'email' | 'role'>,
  ): Promise<TokenPair & { tokenId: string }> {
    const tokenId = uuidv4();

    const accessTokenExpiresIn = this.config.get<string>('jwt.accessExpiresIn', '15m');
    const refreshTokenExpiresIn = this.config.get<string>('jwt.refreshExpiresIn', '7d');

    const accessToken = await this.jwt.signAsync(payload as any, {
      secret: this.config.getOrThrow<string>('jwt.accessSecret') as any,
      expiresIn: accessTokenExpiresIn as any,
    });

    const refreshPayload: RefreshTokenPayload = { ...payload, tokenId };
    const refreshToken = await this.jwt.signAsync(refreshPayload as any, {
      secret: this.config.getOrThrow<string>('jwt.refreshSecret') as any,
      expiresIn: refreshTokenExpiresIn as any,
    });

    return { accessToken, refreshToken, accessTokenExpiresIn, refreshTokenExpiresIn, tokenId };
  }

  async verifyAccess(token: string): Promise<JwtPayload> {
    return this.jwt.verifyAsync<JwtPayload>(token, {
      secret: this.config.getOrThrow<string>('jwt.accessSecret'),
    });
  }

  async verifyRefresh(token: string): Promise<RefreshTokenPayload> {
    return this.jwt.verifyAsync<RefreshTokenPayload>(token, {
      secret: this.config.getOrThrow<string>('jwt.refreshSecret'),
    });
  }
}
