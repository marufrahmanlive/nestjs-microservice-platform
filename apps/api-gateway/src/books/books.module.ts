import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BOOKS_SERVICE_TOKEN } from '@app/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: BOOKS_SERVICE_TOKEN,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: '127.0.0.1',
            port: parseInt(config.get<string>('BOOKS_SERVICE_PORT', '3005'), 10),
          },
        }),
      },
    ]),
  ],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
