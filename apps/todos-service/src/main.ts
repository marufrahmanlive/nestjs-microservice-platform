import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { TodosModule } from './todos.module';

async function bootstrap() {
  const port = parseInt(process.env.TODOS_SERVICE_PORT || '3004', 10);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(TodosModule, {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port,
    },
  });

  await app.listen();
  console.log(`Todos Service (TCP) listening on port ${port}`);
}

bootstrap().catch(console.error);
