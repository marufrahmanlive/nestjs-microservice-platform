import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '@app/database';
import { RedisModule } from '@app/redis';
import { RabbitMQModule } from '@app/rabbitmq';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    ClientsModule.registerAsync([
      {
        name: 'EVENTS_CLIENT',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RABBITMQ_URI') || 'amqp://guest:guest@localhost:5672'],
            queue: config.get<string>('RABBITMQ_QUEUE_EVENTS') || 'notification.queue',
            queueOptions: { durable: true },
            noAck: false,
            prefetch: 5,
          },
        }),
      },
    ]),
    RedisModule,
    RabbitMQModule.register({
      queues: [], // Publisher only - no consumer queues needed
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
