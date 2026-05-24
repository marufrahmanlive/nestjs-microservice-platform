import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtAccessStrategy } from './jwt-access.strategy';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';
import { TokenService } from './token.service';

/**
 * Shared auth library wiring. Provides:
 *   - JwtModule configured with the *access* secret (refresh secret is used
 *     manually in TokenService to avoid mismatched defaults).
 *   - Two passport strategies registered side-by-side: 'jwt' (access) and
 *     'jwt-refresh' (refresh). Pick the right one in your guard.
 *
 * Any app that needs to issue or validate tokens imports AuthLibModule.
 */
@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('jwt.accessSecret'),
        signOptions: { expiresIn: config.get<string>('jwt.accessExpiresIn', '15m') as any },
      }),
    }),
  ],
  providers: [JwtAccessStrategy, JwtRefreshStrategy, TokenService],
  exports: [JwtModule, PassportModule, TokenService],
})
export class AuthLibModule {}
