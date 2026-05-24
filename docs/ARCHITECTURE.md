# NestJS Enterprise Monorepo - Architecture Documentation

## 🏗️ System Architecture Overview

This is a production-grade, highly scalable NestJS monorepo using a **scalable monolith + microservices** pattern with event-driven architecture.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Clients (Web/Mobile)                     │
└────────────────────┬────────────────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Gateway (HTTP)                            │
│  • Request validation & transformation                           │
│  • JWT authentication & authorization                           │
│  • Rate limiting & throttling                                   │
│  • Swagger documentation                                        │
│  • CORS & security headers                                      │
└────────┬────────────────────────────────────────────────────────┘
         │ RabbitMQ RPC / Events
         │
    ┌────┴───────────────────────────────────────────────┐
    │                                                     │
    ▼                                                     ▼
┌─────────────┐  ┌──────────────┐  ┌──────────────┐
│ Auth        │  │ User Service │  │ Notification │
│ Service     │  │              │  │ Worker       │
│ (RabbitMQ)  │  │ (RabbitMQ)   │  │ (RabbitMQ)   │
└──────┬──────┘  └──────┬───────┘  └──────┬───────┘
       │                │                 │
       └────────────────┼─────────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │  Email Worker (RabbitMQ)     │
         └──────────────────────────────┘

         Shared Infrastructure Layer:
         ┌──────────────────────────────┐
         │  MongoDB Atlas (Database)    │
         │  Redis (Cache & Session)     │
         │  RabbitMQ (Message Broker)   │
         └──────────────────────────────┘
```

## 📦 Monorepo Structure

```
nestjs-monorepo/
├── apps/
│   ├── api-gateway/             # HTTP API Gateway (port 3000)
│   │   └── src/
│   │       ├── main.ts
│   │       ├── app.module.ts
│   │       ├── health.controller.ts
│   │       └── modules/
│   │           ├── auth/
│   │           └── user/
│   ├── auth-service/            # Auth Microservice (RabbitMQ)
│   │   └── src/
│   │       ├── main.ts
│   │       ├── auth.module.ts
│   │       ├── auth.controller.ts
│   │       ├── auth.service.ts
│   │       └── schemas/
│   ├── user-service/            # User Microservice (RabbitMQ)
│   │   └── src/
│   │       ├── main.ts
│   │       ├── user.module.ts
│   │       ├── user.controller.ts
│   │       ├── user.service.ts
│   │       ├── repositories/
│   │       └── schemas/
│   ├── notification-worker/     # Notification Worker (RabbitMQ Consumer)
│   │   └── src/
│   │       ├── main.ts
│   │       ├── notification.module.ts
│   │       ├── notification.controller.ts
│   │       └── notification.service.ts
│   └── email-worker/            # Email Worker (RabbitMQ Consumer)
│       └── src/
│           ├── main.ts
│           ├── email.module.ts
│           ├── email.controller.ts
│           └── email.service.ts
│
├── libs/                         # Shared Libraries
│   ├── common/                  # Common utilities, interfaces, config
│   │   └── src/
│   │       ├── config/
│   │       ├── exceptions/
│   │       ├── interfaces/
│   │       └── utils/
│   ├── database/                # MongoDB Mongoose setup
│   │   └── src/
│   │       ├── database.module.ts
│   │       └── abstract.repository.ts
│   ├── redis/                   # Redis client & cache manager
│   │   └── src/
│   │       ├── redis.module.ts
│   │       ├── redis.service.ts
│   │       └── redis.constants.ts
│   ├── rabbitmq/               # RabbitMQ patterns & utilities
│   │   └── src/
│   ├── logger/                 # Winston/Pino logging
│   │   └── src/
│   ├── auth/                   # JWT & Auth services
│   │   └── src/
│   │       ├── jwt.module.ts
│   │       ├── token.service.ts
│   │       ├── jwt-access.strategy.ts
│   │       └── jwt-refresh.strategy.ts
│   ├── dto/                    # Global DTOs
│   │   └── src/
│   ├── constants/              # Global constants
│   │   └── src/
│   ├── interceptors/           # Global interceptors
│   │   └── src/
│   ├── filters/                # Global exception filters
│   │   └── src/
│   ├── decorators/             # Custom decorators
│   │   └── src/
│   └── guards/                 # Custom guards (JWT, Roles, etc.)
│       └── src/
│
├── docker-compose.yml          # Local development stack
├── Dockerfile                  # Multi-stage build
├── ecosystem.config.js         # PM2 configuration
├── .env.example               # Environment template
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## 🔧 Key Technologies & Patterns

### Database: MongoDB Atlas
- **ODM**: Mongoose with TypeScript
- **Pattern**: Repository pattern with soft deletes
- **Indexing**: Composite indexes for query optimization
- **Connection**: Pooling with 50 max connections per instance

### Caching: Redis
- **Use Cases**: 
  - Session storage
  - API response caching
  - Rate limit tracking
  - OTP/temporary tokens
- **TTL**: Configurable per key (default: 5 minutes)

### Message Broker: RabbitMQ
- **Patterns**:
  - Request/Reply (RPC) for synchronous calls
  - Event Publishing for async tasks
  - Dead Letter Queue (DLQ) for failed messages
  - Message acknowledgment & retry strategy
- **Queues**:
  - `auth_service_queue`: Auth operations
  - `user_service_queue`: User operations
  - `notification_queue`: Notifications
  - `email_queue`: Email operations
  - `app.dlq`: Dead letter queue for retries

### Authentication & Authorization
- **Strategy**: JWT with separate access & refresh tokens
- **Access Token**: Short-lived (15 minutes)
- **Refresh Token**: Long-lived (7 days), stored securely
- **RBAC**: Role-based access control with @Roles() decorator
- **Password**: Bcrypt with 12 salt rounds

### API Gateway Pattern
- **Request Validation**: class-validator with DTOs
- **Global Exception Filter**: Standardized error responses
- **Logging Interceptor**: Tracks all requests with correlation IDs
- **Response Interceptor**: Wraps responses in standard envelope
- **Rate Limiting**: Throttler (100 req/min by default)
- **Security**: Helmet, CORS, compression

## 🚀 Development Setup

### Prerequisites
- Node.js 20+ 
- npm 10+
- Docker & Docker Compose (for local infra)

### Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start infrastructure (MongoDB, Redis, RabbitMQ)
npm run docker:up

# 3. Create .env file from template
cp .env.example .env

# 4. Start all services (development mode)
npm run start:dev:all

# 5. Access API
# API Gateway: http://localhost:3000
# Swagger Docs: http://localhost:3000/api
# RabbitMQ Admin: http://localhost:15672 (guest:guest)
```

### Individual Service Startup
```bash
npm run start:gateway      # API Gateway
npm run start:auth         # Auth Service
npm run start:user         # User Service
npm run start:notification # Notification Worker
npm run start:email        # Email Worker
```

## 📝 API Endpoints

### Authentication
```
POST   /api/auth/register      Register new user
POST   /api/auth/login         Login & get tokens
POST   /api/auth/refresh       Refresh access token
```

### Users
```
GET    /api/users/me           Get current user profile
GET    /api/users              List users (paginated)
GET    /api/users/:id          Get user by ID
POST   /api/users              Create user
PUT    /api/users/:id          Update user
DELETE /api/users/:id          Soft delete user
```

### Health
```
GET    /health                 Liveness probe
GET    /health/ready           Readiness probe
GET    /health/live            Health check
```

## 🔐 Security Features

- **Helmet**: Security headers
- **CORS**: Configurable origins
- **Rate Limiting**: Request throttling
- **JWT**: Secure token-based auth
- **Password Hashing**: Bcrypt (12 rounds)
- **Input Validation**: class-validator
- **Environment Variables**: Sensitive config separation
- **Non-root Docker**: Container security
- **Health Checks**: Liveness & readiness probes

## 📊 Scalability Strategy

### Horizontal Scaling
```javascript
// PM2 cluster mode with CPU-based scaling
instances: 'max' // or specific number (4, 8, etc.)
exec_mode: 'cluster'
```

### Load Balancing
- API Gateway: HAProxy or Nginx
- RabbitMQ: Built-in clustering
- MongoDB: Atlas replica sets
- Redis: Sentinel or Cluster mode

### Performance Optimization
- Database: Lean queries (.lean()), composite indexes
- Caching: Redis with sensible TTLs
- Queue: Prefetch settings (10 for services, 5 for workers)
- Workers: Vertical scaling for heavy operations

## 🏗️ Deployment Topology

### Local Development
```bash
docker-compose up -d
npm run start:dev:all
```

### Staging (ECS with ALB)
```yaml
Services:
  - API Gateway: 3 tasks (load balanced)
  - Auth Service: 2 tasks
  - User Service: 2 tasks
  - Workers: 1 task each

Shared Infrastructure:
  - MongoDB Atlas M30
  - Redis ElastiCache
  - RabbitMQ MQ cluster
```

### Production (EKS with Istio)
```yaml
Deployments:
  - api-gateway: 5 replicas
  - auth-service: 3 replicas
  - user-service: 3 replicas
  - notification-worker: 2 replicas
  - email-worker: 3 replicas

StatefulSets:
  - MongoDB: Replica set
  - Redis: Cluster mode
  - RabbitMQ: RabbitMQ cluster
```

## 📚 Testing

```bash
npm run test              # Unit tests
npm run test:watch       # Watch mode
npm run test:cov         # Coverage report
npm run test:e2e         # E2E tests
```

## 🔍 Monitoring & Observability

### Health Checks
```bash
curl http://localhost:3000/health
curl http://localhost:3000/health/ready
curl http://localhost:3000/health/live
```

### Logging
- **Level**: info (configurable)
- **Format**: JSON for structured logging
- **Correlation IDs**: Trace requests across services
- **Output**: stdout + daily rotating files

### Metrics (Ready for integration)
- Response times
- Request rates
- Error rates
- Database query times
- Redis hit rates

## 🚦 Graceful Shutdown

All services implement graceful shutdown:
```typescript
// Services wait for in-flight messages before exiting
// Connection pooling properly closed
// Messages requeued if needed
```

Shutdown timeout: 10 seconds (configurable)

## 📋 Best Practices Implemented

✅ Clean Architecture with modular structure
✅ SOLID principles (SRP, OCP, DIP)
✅ Repository pattern for data access
✅ Dependency injection throughout
✅ Centralized configuration
✅ Structured error handling
✅ Request validation at boundaries
✅ Soft deletes for data safety
✅ Event-driven async operations
✅ Health checks & observability
✅ Security headers & CORS
✅ API versioning ready
✅ Comprehensive logging
✅ Production-ready Docker setup
✅ PM2 clustering for reliability

## 🔄 Next Steps

1. **Implement microservice communication** in API Gateway
2. **Add email templates** for email worker
3. **Integrate WebSocket** for real-time notifications
4. **Add authentication** middleware validation
5. **Implement caching** strategy for frequently accessed data
6. **Add API rate limiting** per user/IP
7. **Set up CI/CD pipeline** (GitHub Actions)
8. **Add monitoring** (Prometheus, Grafana)
9. **Configure log aggregation** (ELK Stack)
10. **Set up alerts** for critical failures

## 📖 Related Documentation

- [MongoDB Best Practices](https://docs.mongodb.com/manual/administration/production-checklist/)
- [RabbitMQ Clustering](https://www.rabbitmq.com/clustering.html)
- [Redis Sentinel](https://redis.io/topics/sentinel)
- [NestJS Microservices](https://docs.nestjs.com/microservices/basics)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)
