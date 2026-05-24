import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { UsersModule } from './users.module';

async function bootstrap() {
  const port = parseInt(process.env.USER_SERVICE_PORT || '3002', 10);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(UsersModule, {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port,
    },
  });

  await app.listen();
  console.log(`User Service (TCP) listening on port ${port}`);
}

bootstrap().catch(console.error);
