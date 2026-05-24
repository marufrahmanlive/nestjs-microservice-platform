# NestJS Production-Grade Monorepo

A minimal yet production-ready NestJS monorepo with mixed transports: HTTP Gateway, TCP Microservices, and RabbitMQ Workers.

## Architecture Overview

```
Client → API Gateway (HTTP:3000)
         ├─→ Auth Service (TCP:3001)
         ├─→ User Service (TCP:3002)
         └─→ Notification Worker (RabbitMQ + WebSocket:3003)

Database: MongoDB Atlas
Cache: Redis
Message Broker: RabbitMQ
```

## Services

### API Gateway (HTTP)

- **Port**: 3000
- **Transport**: HTTP/REST
- **Purpose**: Single entry point for all clients
- **Features**:
  - JWT authentication guard
  - Role-based access control
  - Rate limiting (Throttler)
  - Swagger/OpenAPI documentation at `/docs`
  - TCP ClientProxy for calling microservices

### Auth Service (TCP Microservice)

- **Port**: 3001
- **Transport**: TCP (NestJS Microservices)
- **Purpose**: User authentication and JWT token management
- **Patterns**:
  - `auth.user.register` - Register new user
  - `auth.user.login` - User login
  - `auth.user.logout` - User logout
  - `auth.token.refresh` - Refresh access token
  - `auth.token.validate` - Validate token

### User Service (TCP Microservice)

- **Port**: 3002
- **Transport**: TCP (NestJS Microservices)
- **Purpose**: User CRUD operations
- **Patterns**:
  - `user.findById` - Get user by ID
  - `user.findByEmail` - Find user by email
  - `user.list` - List users with pagination
  - `user.update` - Update user
  - `user.delete` - Soft delete user

### Notification Worker (RabbitMQ Consumer + WebSocket)

- **Port**: 3003 (WebSocket)
- **Transport**: RabbitMQ (Consumer) + HTTP (WebSocket Gateway)
- **Purpose**: Asynchronous notifications via multiple channels
- **Channels** (Strategy Pattern):
  - Email (Nodemailer/SMTP)
  - Push (Firebase Cloud Messaging)
  - SMS (Twilio)
  - In-App (WebSocket)
- **Events**:
  - `notification.send` - Send notification
  - `user.created` - Welcome email on user registration

## Project Structure

```
nestjs_monorepo/
├── apps/
│   ├── api-gateway/           # HTTP REST API
│   │   └── src/
│   ├── auth-service/          # TCP Microservice
│   │   └── src/
│   ├── books-service/         # TCP Microservice
│   │   └── src/
│   ├── email-worker/          # RabbitMQ Worker
│   │   └── src/
│   ├── notification-worker/   # RabbitMQ Consumer + WebSocket
│   │   └── src/
│   ├── posts-service/         # HTTP/REST Service
│   │   └── src/
│   ├── todos-service/         # TCP Microservice
│   │   └── src/
│   └── user-service/          # TCP Microservice
│       └── src/
├── libs/
│   ├── auth/
│   ├── common/
│   ├── constants/
│   ├── database/
│   ├── decorators/
│   ├── dto/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── logger/
│   ├── rabbitmq/
│   └── redis/
├── docs/                      # Project documentation files
│   ├── ARCHITECTURE.md
│   ├── API_REFERENCE.md
│   ├── DEPLOYMENT.md
│   ├── IMPLEMENTATION_STATUS.md
│   ├── POSTS_SERVICE_GUIDE.md
│   ├── POSTS_SERVICE_IMPLEMENTATION.md
│   ├── POSTS_SERVICE_OVERVIEW.md
│   ├── QUICK_REFERENCE.md
│   ├── SERVICES_COMPARISON.md
│   ├── SYSTEM_READY.md
│   ├── TESTING_GUIDE.md
│   ├── TODOS_BOOKS_COMPLETED.md
│   ├── TODOS_BOOKS_TEST_GUIDE.md
│   ├── VERIFICATION_CHECKLIST.md
│   └── COMPLETION_SUMMARY.md
├── docker-compose.yml         # Local dev: MongoDB, Redis, RabbitMQ
├── Dockerfile
├── ecosystem.config.js
├── nest-cli.json
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── .env.example
└── README.md
```

> Notes:
>
> - `docs/` contains the current markdown documentation files.
> - The tree shows the source structure; generated output like `dist/` and `node_modules/` is not shown.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Update `.env` values for:

- `MONGO_URI`
- `REDIS_HOST`, `REDIS_PORT`
- `RABBITMQ_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `COOKIE_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`
- `TWILIO_*` / `FIREBASE_*` if using SMS or push notifications

### 3. Start Local Infrastructure with Docker

```bash
docker-compose up -d
```

This starts:

- MongoDB
- Redis
- RabbitMQ

Verify the services:

```bash
docker compose ps
```

### 4. Run All Services in Development

Open separate terminals.

#### API Gateway

```bash
npm run start:dev:api-gateway
```

#### Auth Service

```bash
npm run start:dev:auth-service
```

#### User Service

```bash
npm run start:dev:user-service
```

#### Notification Worker

```bash
npm run start:dev:notification-worker
```

#### Email Worker

```bash
npm run start:dev:email-worker
```

#### Posts Service

```bash
npm run start:dev:posts-service
```

## Local Endpoints

### API Gateway

- Health: `http://localhost:3000/api/health`
- Swagger: `http://localhost:3000/docs`
- Auth: `http://localhost:3000/api/auth`
- Users: `http://localhost:3000/api/users`

### Posts Service

- Health: `http://localhost:3006/api/health`
- Swagger: `http://localhost:3006/docs`

### Notification WebSocket

- `ws://localhost:3003`

## API Examples

### Register User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123",
    "name": "John Doe"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123"
  }'
```

### Get Current User

```bash
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Build Commands

Build the full project:

```bash
npm run build
```

Build individual apps:

```bash
npm run build:api-gateway
npm run build:auth-service
npm run build:user-service
npm run build:notification-worker
npm run build:email-worker
npm run build:posts-service
```

## Generate New Apps, Services, and Libraries

The Nest CLI can scaffold future microservices, libraries, controllers, and providers.

### Create a new app under `apps/`

```bash
npx nest generate app my-new-service
```

This creates:

- `apps/my-new-service/src`
- `apps/my-new-service/tsconfig.app.json`
- `apps/my-new-service/src/main.ts`

### Add a new library under `libs/`

```bash
npx nest generate library my-shared-lib
```

This creates:

- `libs/my-shared-lib/src`
- `libs/my-shared-lib/tsconfig.lib.json`
- `libs/my-shared-lib/index.ts`

### Generate a module inside an app

```bash
npx nest generate module feature --project my-new-service
```

### Generate a controller inside an app

```bash
npx nest generate controller feature --project my-new-service
```

### Generate a service/provider inside an app

```bash
npx nest generate service feature --project my-new-service
```

### Generate a class or provider in a library

```bash
npx nest generate class my-helper --project my-shared-lib
npx nest generate provider my-helper --project my-shared-lib
```

### Generate a gateway or gateway module

```bash
npx nest generate gateway realtime --project my-new-service
```

### Register a new app in `nest-cli.json`

After generating a new app, add it to `nest-cli.json` under `projects`:

```json
"my-new-service": {
  "type": "application",
  "root": "apps/my-new-service",
  "entryFile": "main",
  "sourceRoot": "apps/my-new-service/src"
}
```

## Deployment Guide

### AWS

#### EC2 + Docker Compose

1. Provision an EC2 instance.
2. Install Docker and Docker Compose.
3. Clone this repository.
4. Copy `.env.example` to `.env` and update values.
5. Run:
   ```bash
   docker-compose up -d
   ```
6. Use NGINX or a reverse proxy for traffic routing.
7. Add Route 53 DNS records:
   - `api.example.com` → API Gateway
   - `posts.example.com` → Posts Service
   - `ws.example.com` → Notification Worker (if exposed)
8. Secure with Let’s Encrypt.

#### ECS / Fargate

1. Build Docker images and push to ECR.
2. Create ECS task definitions for each service.
3. Use Fargate services for API Gateway, Auth, User, Notification, Email, and Posts.
4. Use private networking for internal TCP and RabbitMQ.
5. Store secrets in Secrets Manager or Parameter Store.
6. Use an Application Load Balancer for public HTTP traffic.

### DigitalOcean

#### App Platform

1. Create services for API Gateway and Posts Service.
2. Create background workers for Notification Worker and Email Worker.
3. Use managed MongoDB and Redis.
4. Use an external RabbitMQ provider or a dedicated Droplet.
5. Configure custom domains:
   - `api.example.com`
   - `posts.example.com`

#### Droplet + Docker

1. Provision a Droplet.
2. Install Docker and Docker Compose.
3. Clone the repository and copy `.env`.
4. Run:
   ```bash
   docker-compose up -d
   ```
5. Use NGINX as a reverse proxy.
6. Add SSL with Certbot.

### Render

1. Create Render services for:
   - API Gateway
   - Posts Service
2. Create Render background workers for:
   - Notification Worker
   - Email Worker
3. Use external MongoDB, Redis, and RabbitMQ.
4. Configure environment variables in Render.
5. Add custom domains.

> Note: Render does not provide RabbitMQ natively, so use an external broker.

### Railway

1. Create a Railway project.
2. Add MongoDB and Redis plugins.
3. Add services for:
   - API Gateway
   - Auth Service
   - User Service
   - Notification Worker
   - Email Worker
   - Posts Service
4. Set environment variables in Railway.
5. Use Railway-provided or custom domains.

### Generic VPS / Other Hosting

1. Install Docker and Docker Compose.
2. Clone the repository.
3. Create `.env` from `.env.example`.
4. Run:
   ```bash
   docker-compose up -d
   ```
5. Use NGINX as a reverse proxy.
6. Secure with Let’s Encrypt.

## Recommended Domain Names

Public-facing domains:

- `api.example.com` → API Gateway
- `posts.example.com` → Posts Service
- `ws.example.com` → Notification / WebSocket

Keep internal microservices private:

- `auth-service.internal`
- `user-service.internal`

## Environment Variables

Copy these values into `.env` or your host provider's secret configuration:

```bash
NODE_ENV=production

GATEWAY_PORT=3000
AUTH_SERVICE_PORT=3001
USER_SERVICE_PORT=3002
WS_PORT=3003
TODOS_SERVICE_PORT=3004
BOOKS_SERVICE_PORT=3005
POSTS_SERVICE_PORT=3006

MONGO_URI=mongodb://...
REDIS_HOST=localhost
REDIS_PORT=6379
RABBITMQ_URI=amqp://guest:guest@localhost:5672

JWT_ACCESS_SECRET=your-strong-access-secret
JWT_REFRESH_SECRET=your-strong-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
COOKIE_SECRET=your-strong-cookie-secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
SMTP_FROM_EMAIL=noreply@example.com

TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...

FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

## Testing

Run unit tests:

```bash
npm run test
```

Watch tests:

```bash
npm run test:watch
```

Run coverage:

```bash
npm run test:cov
```

## Linting

```bash
npm run lint
```

## Notes

- Keep internal TCP services private and expose only the API Gateway and public endpoints.
- Use managed MongoDB and Redis in production.
- Store secrets securely in your cloud provider.
- Use separate domains or subdomains for API gateway and public services.

## License

MIT

node dist/apps/auth-service/main
node dist/apps/user-service/main
node dist/apps/notification-worker/main

````

### Docker Build
```bash
docker build -f apps/api-gateway/Dockerfile -t api-gateway:latest .
docker build -f apps/auth-service/Dockerfile -t auth-service:latest .
docker build -f apps/user-service/Dockerfile -t user-service:latest .
docker build -f apps/notification-worker/Dockerfile -t notification-worker:latest .
````

## Tech Stack

- **Framework**: NestJS 10
- **Language**: TypeScript 5
- **Database**: MongoDB (Mongoose)
- **Cache**: Redis (ioredis)
- **Message Broker**: RabbitMQ (amqplib)
- **Auth**: JWT + Passport.js
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Notifications**: Nodemailer, Firebase Admin, Twilio
- **WebSocket**: Socket.io
- **Logging**: Winston

## Testing

```bash
npm run test              # Run unit tests
npm run test:watch       # Watch mode
npm run test:cov         # Coverage report
```

## Linting

```bash
npm run lint             # Lint and fix all files
```

## Next Steps

1. **Add DTOs**: Create request/response validation DTOs in each module
2. **Add Tests**: Write unit and integration tests
3. **Add Logging**: Implement structured logging with Winston
4. **Add Docs**: Expand Swagger documentation with examples
5. **Add CI/CD**: Set up GitHub Actions or similar
6. **Add Monitoring**: Integrate Prometheus/Grafana
7. **Add Tracing**: Add distributed tracing (Jaeger/Zipkin)

## License

MIT
