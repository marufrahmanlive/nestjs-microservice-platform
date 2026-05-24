import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { EmailModule } from './email.module';

async function bootstrap() {
  const logger = new Logger('EmailWorker');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(EmailModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URI || 'amqp://guest:guest@localhost:5672'],
      queue: process.env.RABBITMQ_EMAIL_QUEUE || process.env.EMAIL_QUEUE || 'email.queue',
      queueOptions: { durable: true },
      prefetch: 5,
    },
  });

  await app.listen();
  logger.log('🚀 Email Worker started (RabbitMQ consumer)');
}

bootstrap().catch((err) => {
  new Logger('Bootstrap').error(err);
  process.exit(1);
});
