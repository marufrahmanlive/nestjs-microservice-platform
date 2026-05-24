import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TODOS_SERVICE_TOKEN } from '@app/common';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: TODOS_SERVICE_TOKEN,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: '127.0.0.1',
            port: parseInt(config.get<string>('TODOS_SERVICE_PORT', '3004'), 10),
          },
        }),
      },
    ]),
  ],
  controllers: [TodosController],
  providers: [TodosService],
})
export class TodosModule {}
