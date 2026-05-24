import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AuthModule } from './auth.module';

async function bootstrap() {
  const port = parseInt(process.env.AUTH_SERVICE_PORT || '3001', 10);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AuthModule, {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port,
    },
  });

  await app.listen();
  console.log(`Auth Service (TCP) listening on port ${port}`);
}

bootstrap().catch(console.error);
