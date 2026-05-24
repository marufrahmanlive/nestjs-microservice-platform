# Create This NestJS Monorepo from Scratch

This guide explains how to build the same NestJS monorepo architecture from scratch, step by step. It includes commands for creating the monorepo, apps, libraries, configuration files, and running the services locally.

> This guide assumes you are using Windows and are new to NestJS. If you are on another OS, the commands are the same except for path separators.

---

## 1. Prerequisites

- Node.js 18 or newer
- npm 10 or newer
- Git
- Docker and Docker Compose (for local MongoDB, Redis, RabbitMQ)

If you do not have Nest CLI installed globally, install it:

```bash
npm install -g @nestjs/cli
```

> You can also use `npx @nestjs/cli` when you do not want a global install.

---

## 2. Create the Monorepo Root

1. Create a new folder for the project:

```bash
mkdir nestjs_monorepo
cd nestjs_monorepo
```

2. Initialize a new npm project:

```bash
npm init -y
```

3. Install the NestJS CLI locally and core dependencies:

```bash
npm install @nestjs/common @nestjs/core @nestjs/platform-express @nestjs/microservices @nestjs/config @nestjs/jwt @nestjs/passport @nestjs/swagger @nestjs/throttler @nestjs/websockets @nestjs/platform-socket.io mongoose @nestjs/mongoose passport passport-jwt reflect-metadata rxjs
```

4. Install development dependencies:

```bash
npm install -D @nestjs/cli @nestjs/schematics @nestjs/testing @types/node typescript ts-node ts-jest jest @types/jest eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin rimraf
```

---

## 3. Configure Nest CLI for a Monorepo

Create `nest-cli.json` in the repository root with the following content:

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "apps/api-gateway/src",
  "monorepo": true,
  "root": "apps/api-gateway",
  "compilerOptions": {
    "deleteOutDir": true,
    "webpack": true,
    "tsConfigPath": "apps/api-gateway/tsconfig.app.json"
  },
  "projects": {
    "api-gateway": {
      "type": "application",
      "root": "apps/api-gateway",
      "entryFile": "main",
      "sourceRoot": "apps/api-gateway/src",
      "compilerOptions": {
        "tsConfigPath": "apps/api-gateway/tsconfig.app.json"
      }
    },
    "auth-service": {
      "type": "application",
      "root": "apps/auth-service",
      "entryFile": "main",
      "sourceRoot": "apps/auth-service/src",
      "compilerOptions": {
        "tsConfigPath": "apps/auth-service/tsconfig.app.json"
      }
    },
    "user-service": {
      "type": "application",
      "root": "apps/user-service",
      "entryFile": "main",
      "sourceRoot": "apps/user-service/src",
      "compilerOptions": {
        "tsConfigPath": "apps/user-service/tsconfig.app.json"
      }
    },
    "notification-worker": {
      "type": "application",
      "root": "apps/notification-worker",
      "entryFile": "main",
      "sourceRoot": "apps/notification-worker/src",
      "compilerOptions": {
        "tsConfigPath": "apps/notification-worker/tsconfig.app.json"
      }
    },
    "todos-service": {
      "type": "application",
      "root": "apps/todos-service",
      "entryFile": "main",
      "sourceRoot": "apps/todos-service/src",
      "compilerOptions": {
        "tsConfigPath": "apps/todos-service/tsconfig.app.json"
      }
    },
    "books-service": {
      "type": "application",
      "root": "apps/books-service",
      "entryFile": "main",
      "sourceRoot": "apps/books-service/src",
      "compilerOptions": {
        "tsConfigPath": "apps/books-service/tsconfig.app.json"
      }
    },
    "email-worker": {
      "type": "application",
      "root": "apps/email-worker",
      "entryFile": "main",
      "sourceRoot": "apps/email-worker/src",
      "compilerOptions": {
        "tsConfigPath": "apps/email-worker/tsconfig.app.json"
      }
    },
    "posts-service": {
      "type": "application",
      "root": "apps/posts-service",
      "entryFile": "main",
      "sourceRoot": "apps/posts-service/src",
      "compilerOptions": {
        "tsConfigPath": "apps/posts-service/tsconfig.app.json"
      }
    },
    "common": {
      "type": "library",
      "root": "libs/common",
      "entryFile": "index",
      "sourceRoot": "libs/common/src",
      "compilerOptions": {
        "tsConfigPath": "libs/common/tsconfig.lib.json"
      }
    },
    "database": {
      "type": "library",
      "root": "libs/database",
      "entryFile": "index",
      "sourceRoot": "libs/database/src",
      "compilerOptions": {
        "tsConfigPath": "libs/database/tsconfig.lib.json"
      }
    }
  }
}
```

This file tells Nest how to handle the monorepo and the applications inside `apps/`.

---

## 4. Create App and Library Directories

Use the Nest CLI to generate each app and library. Run these commands from the project root.

### Create the apps

```bash
nest generate app api-gateway --directory apps --monorepo
nest generate app auth-service --directory apps --monorepo
nest generate app user-service --directory apps --monorepo
nest generate app notification-worker --directory apps --monorepo
nest generate app todos-service --directory apps --monorepo
nest generate app books-service --directory apps --monorepo
nest generate app email-worker --directory apps --monorepo
nest generate app posts-service --directory apps --monorepo
```

### Create the libs

```bash
nest generate library common --directory libs --monorepo
nest generate library database --directory libs --monorepo
nest generate library auth --directory libs --monorepo
nest generate library constants --directory libs --monorepo
nest generate library decorators --directory libs --monorepo
nest generate library dto --directory libs --monorepo
nest generate library filters --directory libs --monorepo
nest generate library guards --directory libs --monorepo
nest generate library interceptors --directory libs --monorepo
nest generate library logger --directory libs --monorepo
nest generate library rabbitmq --directory libs --monorepo
nest generate library redis --directory libs --monorepo
```

> Tip: If the CLI prompts for naming or strict mode, you can accept defaults. The important part is creating the directory structure.

---

## 5. Create `tsconfig` Files

A monorepo usually has a root `tsconfig.json` plus per-app and per-lib `tsconfig` files.

### Root `tsconfig.json`

Create `tsconfig.json` in the root:

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2020",
    "sourceMap": true,
    "outDir": "dist",
    "baseUrl": ".",
    "incremental": true,
    "strict": true,
    "skipLibCheck": true,
    "paths": {
      "@app/*": ["apps/*/src/*"],
      "@libs/*": ["libs/*/src/*"]
    }
  },
  "exclude": ["node_modules", "dist"]
}
```

### App `tsconfig.app.json`

For each app, the CLI usually creates `apps/<app-name>/tsconfig.app.json`. If not, use this template:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "module": "commonjs"
  },
  "exclude": ["node_modules", "test", "**/*spec.ts"]
}
```

### Library `tsconfig.lib.json`

For libraries, use this template:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "module": "commonjs"
  },
  "exclude": ["node_modules", "test", "**/*spec.ts"]
}
```

---

## 6. Update `package.json` Scripts

Replace or extend your `package.json` scripts so you can start each app individually.

Example `package.json` scripts section:

```json
"scripts": {
  "prebuild": "rimraf dist",
  "build": "nest build",
  "build:api-gateway": "nest build api-gateway",
  "build:auth-service": "nest build auth-service",
  "build:user-service": "nest build user-service",
  "build:notification-worker": "nest build notification-worker",
  "build:todos-service": "nest build todos-service",
  "build:books-service": "nest build books-service",
  "build:email-worker": "nest build email-worker",
  "build:posts-service": "nest build posts-service",
  "start": "nest start",
  "start:dev": "nest start --watch",
  "start:dev:api-gateway": "nest start api-gateway --watch",
  "start:dev:auth-service": "nest start auth-service --watch",
  "start:dev:user-service": "nest start user-service --watch",
  "start:dev:notification-worker": "nest start notification-worker --watch",
  "start:dev:todos-service": "nest start todos-service --watch",
  "start:dev:books-service": "nest start books-service --watch",
  "start:dev:email-worker": "nest start email-worker --watch",
  "start:dev:posts-service": "nest start posts-service --watch",
  "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:cov": "jest --coverage"
}
```

---

## 7. Create `apps` Entry Points

Each application needs a `main.ts` file inside `apps/<name>/src/`.

### Example for `api-gateway`

Create `apps/api-gateway/src/main.ts`:

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

### Example for a TCP microservice like `auth-service`

Create `apps/auth-service/src/main.ts`:

```ts
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: { host: '127.0.0.1', port: 3001 },
  });
  await app.listen();
}
bootstrap();
```

### Example for a RabbitMQ worker like `notification-worker`

Create `apps/notification-worker/src/main.ts`:

```ts
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'notification_queue',
      queueOptions: { durable: true },
    },
  });
  await app.listen();
}
bootstrap();
```

---

## 8. Create Basic App Modules

Each app needs an `app.module.ts` in `apps/<name>/src/`.

### Example `apps/api-gateway/src/app.module.ts`

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
})
export class AppModule {}
```

For microservices and workers, add other modules and controllers as needed.

---

## 9. Add Environment Example

Create a `.env.example` file at the root with the common values used by this project:

```env
MONGO_URI=mongodb://localhost:27017/nestjs_monorepo
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
RABBITMQ_URI=amqp://localhost:5672
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
COOKIE_SECRET=your_cookie_secret
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=no-reply@example.com
```

Copy it to `.env` when you are ready to run locally:

```bash
copy .env.example .env
```

---

## 10. Create Docker Compose for Local Infrastructure

Create `docker-compose.yml` with MongoDB, Redis, and RabbitMQ:

```yaml
version: '3.8'
services:
  mongo:
    image: mongo:7.0
    container_name: nestjs_mongo
    ports:
      - '27017:27017'
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: example

  redis:
    image: redis:7.0
    container_name: nestjs_redis
    ports:
      - '6379:6379'

  rabbitmq:
    image: rabbitmq:3-management
    container_name: nestjs_rabbitmq
    ports:
      - '5672:5672'
      - '15672:15672'
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
```

Start it:

```bash
docker compose up -d
```

Verify:

```bash
docker compose ps
```

---

## 11. Run the Apps

Open separate terminals for each app.

- API Gateway:
  ```bash
  npm run start:dev:api-gateway
  ```
- Auth Service:
  ```bash
  npm run start:dev:auth-service
  ```
- User Service:
  ```bash
  npm run start:dev:user-service
  ```
- Notification Worker:
  ```bash
  npm run start:dev:notification-worker
  ```
- Todos Service:
  ```bash
  npm run start:dev:todos-service
  ```
- Books Service:
  ```bash
  npm run start:dev:books-service
  ```
- Email Worker:
  ```bash
  npm run start:dev:email-worker
  ```
- Posts Service:
  ```bash
  npm run start:dev:posts-service
  ```

---

## 12. Useful NestJS Commands

- `npm run build` - build all apps
- `npm run lint` - run ESLint on the monorepo
- `npm run test` - run Jest tests
- `npm run test:watch` - run tests in watch mode

---

## 13. What This Architecture Contains

This repository structure is designed for a production-grade NestJS microservice platform:

- `apps/api-gateway` — HTTP REST gateway
- `apps/auth-service` — TCP authentication microservice
- `apps/user-service` — TCP user management microservice
- `apps/notification-worker` — RabbitMQ consumer and WebSocket notification worker
- `apps/todos-service` — TCP todos service
- `apps/books-service` — TCP books service
- `apps/email-worker` — RabbitMQ email worker
- `apps/posts-service` — HTTP posts service
- `libs/*` — shared libraries for common utilities, database, auth, DTOs, guards, interceptors, and RabbitMQ helpers

---

## 14. Test RabbitMQ with `email-worker` and `notification-worker`

Use this section to verify RabbitMQ is working by sending messages to the workers.

### 14.1 Start RabbitMQ and the workers

Run the local infrastructure and then start the two workers:

```bash
docker compose up -d
npm run start:dev:notification-worker
npm run start:dev:email-worker
```

### 14.2 Confirm RabbitMQ is available

Open RabbitMQ Management UI at:

```text
http://localhost:15672
```

Login with:

- username: `guest`
- password: `guest`

Check that the worker queues exist, for example:

- `notification_queue`
- `email_queue`

### 14.3 Test using a simple RabbitMQ producer

From any service or from a small Node script, publish a message to RabbitMQ so the workers can consume it.

Example test script using `amqplib`:

```ts
import amqp from 'amqplib';

async function sendTestMessages() {
  const connection = await amqp.connect('amqp://localhost:5672');
  const channel = await connection.createChannel();

  await channel.assertQueue('notification_queue', { durable: true });
  await channel.assertQueue('email_queue', { durable: true });

  channel.sendToQueue(
    'notification_queue',
    Buffer.from(
      JSON.stringify({
        event: 'notification.send',
        data: { message: 'Test notification from service' },
      }),
    ),
    { persistent: true },
  );

  channel.sendToQueue(
    'email_queue',
    Buffer.from(
      JSON.stringify({
        event: 'email.send',
        data: { subject: 'Test email', body: 'This is a RabbitMQ test.' },
      }),
    ),
    { persistent: true },
  );

  console.log('Sent test messages to notification_queue and email_queue');
  await channel.close();
  await connection.close();
}

sendTestMessages().catch(console.error);
```

Run this script after starting the workers. If the workers are configured to consume those queues, you should see logs from `notification-worker` and `email-worker`.

### 14.4 Test from any Nest service

If you prefer to publish from a Nest app, add a RabbitMQ client to any service (for example `api-gateway`) and emit events.

Example `apps/api-gateway/src/app.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.register([
      {
        name: 'NOTIFICATION_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'notification_queue',
          queueOptions: { durable: true },
        },
      },
      {
        name: 'EMAIL_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'email_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [AppController],
})
export class AppModule {}
```

Example `apps/api-gateway/src/app.controller.ts`:

```ts
import { Controller, Get } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {
  constructor(
    @Inject('NOTIFICATION_CLIENT') private readonly notificationClient: ClientProxy,
    @Inject('EMAIL_CLIENT') private readonly emailClient: ClientProxy,
  ) {}

  @Get('test-notification')
  async testNotification() {
    await firstValueFrom(
      this.notificationClient.emit('notification.send', {
        message: 'Hello from api-gateway',
      }),
    );
    return { status: 'notification message sent' };
  }

  @Get('test-email')
  async testEmail() {
    await firstValueFrom(
      this.emailClient.emit('email.send', {
        subject: 'Test email',
        body: 'Hello RabbitMQ',
      }),
    );
    return { status: 'email message sent' };
  }
}
```

Then open:

- `http://localhost:3000/test-notification`
- `http://localhost:3000/test-email`

If RabbitMQ is working, the message should be routed to the worker queue and the workers should process it.

> Note: The actual worker code must handle the `notification.send` and `email.send` events by listening on the correct queue and pattern.

---

## 15. Useful NestJS Commands

- `npm run build` - build all apps
- `npm run lint` - run ESLint on the monorepo
- `npm run test` - run Jest tests
- `npm run test:watch` - run tests in watch mode

---

## 16. What This Architecture Contains

This repository structure is designed for a production-grade NestJS microservice platform:

- Modules, controllers, providers, and services
- Dependency injection
- `@nestjs/common` decorators
- `NestFactory.create()` and `NestFactory.createMicroservice()`
- Microservice transports: TCP, RMQ, WebSockets
- Configuration with `@nestjs/config`
- Validation with `class-validator` and `class-transformer`

This guide will help you build the project structure. After that, add controllers and services one app at a time.
