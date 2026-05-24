import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NotificationModule } from './notification.module';

async function bootstrap() {
  const rabbitMqUri = process.env.RABBITMQ_URI || 'amqp://guest:guest@localhost:5672';
  const wsPort = parseInt(process.env.WS_PORT || '3003', 10);

  // Create as hybrid: HTTP for WebSocket + RabbitMQ for consumer
  const app = await NestFactory.create(NotificationModule);

  // Connect RabbitMQ consumer
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitMqUri],
      queue: process.env.RABBITMQ_QUEUE_NOTIFICATIONS || 'notification.queue',
      queueOptions: { durable: true },
      noAck: false,
      prefetch: 5,
    },
  });

  await app.startAllMicroservices();
  await app.listen(wsPort);
  console.log(`Notification Worker started`);
  console.log(`  - RabbitMQ consumer on queue: notification.queue`);
  console.log(`  - WebSocket gateway on port ${wsPort}`);
}

bootstrap().catch(console.error);
