import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { BooksModule } from './books.module';

async function bootstrap() {
  const port = parseInt(process.env.BOOKS_SERVICE_PORT || '3005', 10);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(BooksModule, {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port,
    },
  });

  await app.listen();
  console.log(`Books Service (TCP) listening on port ${port}`);
}

bootstrap().catch(console.error);
