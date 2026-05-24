import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DatabaseModule } from '@app/database';
import { JwtAuthGuard, RolesGuard } from '@app/common';
import { JwtStrategy } from './common/strategies/jwt.strategy';
import { PostsModule } from './posts/posts.module';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
        limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
      },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        ({
          secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
          signOptions: {
            expiresIn: config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m') as any,
          },
        }) as JwtModuleOptions,
    }),
    DatabaseModule,
    PostsModule,
  ],
  providers: [
    JwtStrategy,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
