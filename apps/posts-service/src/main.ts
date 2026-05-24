import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TransformInterceptor, HttpExceptionFilter } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.POSTS_SERVICE_PORT || 3006;

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const config = new DocumentBuilder()
    .setTitle('Posts API')
    .setDescription('Standalone Posts CRUD service for mobile applications')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.setGlobalPrefix(process.env.POSTS_API_PREFIX || 'api');
  app.enableCors({ origin: process.env.CORS_ORIGINS?.split(',') || '*' });

  await app.listen(port);
  console.log(`Posts Service (HTTP) listening on http://localhost:${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/docs`);
}

bootstrap().catch(console.error);
