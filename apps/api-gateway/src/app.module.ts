import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './common/strategies/jwt.strategy';
import {
  JwtAuthGuard,
  RolesGuard,
  AUTH_PATTERNS,
  USER_PATTERNS,
  AUTH_SERVICE_TOKEN,
  USER_SERVICE_TOKEN,
} from '@app/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TodosModule } from './todos/todos.module';
import { BooksModule } from './books/books.module';
import { HealthController } from './health.controller';

@Module({
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
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m') as any,
        },
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE_TOKEN,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: '127.0.0.1',
            port: parseInt(config.get<string>('AUTH_SERVICE_PORT', '3001'), 10),
          },
        }),
      },
      {
        name: USER_SERVICE_TOKEN,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: '127.0.0.1',
            port: parseInt(config.get<string>('USER_SERVICE_PORT', '3002'), 10),
          },
        }),
      },
    ]),
    AuthModule,
    UsersModule,
    TodosModule,
    BooksModule,
  ],
  providers: [
    JwtStrategy,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  controllers: [HealthController],
})
export class AppModule {}
