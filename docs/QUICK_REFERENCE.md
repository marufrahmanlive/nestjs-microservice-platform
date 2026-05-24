# NestJS Monorepo - Quick Reference Guide

## Project Structure
```
nestjs_monorepo/
├── apps/
│   ├── api-gateway/          # HTTP REST API (port 3000)
│   ├── auth-service/         # Auth microservice (port 3001, TCP)
│   ├── user-service/         # User microservice (port 3002, TCP)
│   ├── todos-service/        # Todos microservice (port 3004, TCP) ✨
│   ├── books-service/        # Books microservice (port 3005, TCP) ✨
│   └── notification-worker/  # RabbitMQ consumer
├── libs/
│   ├── common/               # Shared utilities, guards, filters, decorators
│   └── database/             # MongoDB/Mongoose schemas and repositories
├── docker-compose.yml
├── nest-cli.json
├── package.json
├── tsconfig.json
└── .env.example
```

## Quick Start - 3 Steps

### 1. Setup
```bash
npm install
cp .env.example .env
```

### 2. Start Services (in separate terminals)
```bash
npm run start:dev:api-gateway
npm run start:dev:auth-service
npm run start:dev:user-service
npm run start:dev:todos-service
npm run start:dev:books-service
```

### 3. Test
```bash
# Get JWT token
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123","name":"Test"}'

curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'

# Create todo (replace TOKEN with access token)
curl -X POST http://localhost:3000/api/v1/todos \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy milk","priority":1}'

# List todos
curl -X GET http://localhost:3000/api/v1/todos \
  -H "Authorization: Bearer TOKEN"
```

## Key Files

### Services
- **API Gateway**: `apps/api-gateway/src/app.module.ts` - main orchestrator
- **Todos Service**: `apps/todos-service/src/todos.service.ts` - business logic
- **Books Service**: `apps/books-service/src/books.service.ts` - business logic

### Data Access
- **TodosRepository**: `apps/todos-service/src/todos.repository.ts` - MongoDB queries
- **BooksRepository**: `apps/books-service/src/books.repository.ts` - MongoDB queries
- **AbstractRepository**: `libs/database/src/abstract.repository.ts` - base CRUD

### Schemas
- **Todo**: `libs/database/src/schemas/todo.schema.ts`
- **Book**: `libs/database/src/schemas/book.schema.ts`
- **User**: `libs/database/src/schemas/user.schema.ts`

### Shared Code
- **Constants**: `libs/common/src/constants/index.ts` - message patterns, tokens
- **Guards**: `libs/common/src/guards/` - JWT auth, RBAC
- **Decorators**: `libs/common/src/decorators/` - @Public, @Roles, @CurrentUser
- **Filters**: `libs/common/src/filters/` - HTTP and RPC error handling
- **Interceptors**: `libs/common/src/interceptors/` - response formatting

## Message Patterns (TCP)

| Service | Pattern | Payload |
|---------|---------|---------|
| Todos | `todo.create` | `{userId, title, description?, dueDate?, priority?}` |
| Todos | `todo.findByUser` | `{userId, skip?, limit?}` |
| Todos | `todo.update` | `{id, userId, title?, status?, priority?}` |
| Todos | `todo.delete` | `{id}` |
| Books | `book.create` | `{userId, title, author, genres?, rating?, isRead?}` |
| Books | `book.findByUser` | `{userId, skip?, limit?}` |
| Books | `book.update` | `{id, userId, rating?, isRead?, ...}` |
| Books | `book.delete` | `{id}` |

## Add New Endpoint (Example)

### 1. Update Controller
```typescript
// apps/api-gateway/src/todos/todos.controller.ts
@Patch(':id/status')
async updateStatus(@Param('id') id: string, @Body('status') status: string) {
  return this.todosService.updateStatus(id, status);
}
```

### 2. Add Service Method
```typescript
// apps/api-gateway/src/todos/todos.service.ts
async updateStatus(id: string, status: string) {
  return firstValueFrom(
    this.todosClient.send('todo.updateStatus', { id, status }).pipe(...)
  );
}
```

### 3. Add Message Pattern
```typescript
// apps/todos-service/src/todos.controller.ts
@MessagePattern('todo.updateStatus')
async updateStatus(@Payload() dto: {id: string, status: string}) {
  return this.todosService.updateStatus(dto.id, dto.status);
}
```

### 4. Add Service Logic
```typescript
// apps/todos-service/src/todos.service.ts
async updateStatus(id: string, status: string) {
  return this.todosRepository.findOneAndUpdate({_id: id}, {status});
}
```

## Authentication

### Public Routes (no token needed)
```
POST /api/v1/auth/register
POST /api/v1/auth/login
```

Mark routes as public:
```typescript
@Public()
@Post('register')
async register(...) { }
```

### Protected Routes (Bearer token required)
```
GET /api/v1/todos          // ✅ requires valid JWT
PUT /api/v1/todos/:id      // ✅ requires valid JWT
```

Get current user:
```typescript
async list(@CurrentUser() user: JwtPayload) {
  console.log(user.sub); // user ID
  console.log(user.email); // user email
}
```

### Role-Based Access
```typescript
@Roles('admin')
@Delete(':id')
async delete(...) { }
```

## Environment Variables

```env
# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
MONGO_DB_NAME=nestjs_db

# Redis
REDIS_URI=redis://localhost:6379

# RabbitMQ
RABBITMQ_URI=amqp://guest:guest@localhost:5672

# JWT
JWT_ACCESS_SECRET=your-secret-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-secret-min-32-chars
JWT_REFRESH_EXPIRES_IN=7d

# Services Ports
GATEWAY_PORT=3000
AUTH_SERVICE_PORT=3001
USER_SERVICE_PORT=3002
TODOS_SERVICE_PORT=3004
BOOKS_SERVICE_PORT=3005

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

## Common Errors

### Service not connecting
- Check service is running: `npm run start:dev:todos-service`
- Verify port in .env matches (TODOS_SERVICE_PORT=3004)
- Check TCP listening: `netstat -an | grep 3004`

### MongoDB connection failed
- Check MONGO_URI in .env
- Verify MongoDB server is running
- Check network access if using Atlas

### JWT authentication fails
- Token format: `Authorization: Bearer <token>`
- Check token not expired
- Verify JWT_ACCESS_SECRET matches across services

### Validation errors
- Check required fields: title (todos), title+author (books)
- Verify data types: priority is number, dueDate is ISO date

## Testing Tools

### Using Swagger UI
```
http://localhost:3000/docs
```
All endpoints documented with examples.

### Using curl (see TODOS_BOOKS_TEST_GUIDE.md)
Complete examples for all CRUD operations with real data.

### Using Postman
Import collection and test all endpoints with pre-configured auth.

## Debugging

### View Service Logs
```bash
# Each service prints logs with context
npm run start:dev:todos-service
# Output: TodosService - Todo created: 507f1f77bcf86cd799439011
```

### MongoDB Compass
```
mongodb+srv://user:pass@cluster.mongodb.net/db
```
Browse collections: Users, Todos, Books

### Check Microservice Connection
```bash
# From api-gateway directory
curl -X GET http://localhost:3000/api/v1/health
```

## Build & Deploy

### Build All
```bash
npm run build
```

### Build Specific
```bash
npm run build:todos-service
npm run build:books-service
```

### Run Production
```bash
NODE_ENV=production node dist/apps/api-gateway/main
NODE_ENV=production node dist/apps/todos-service/main
NODE_ENV=production node dist/apps/books-service/main
```

### Docker
```bash
docker-compose up -d
npm install
npm run build
npm run start:prod
```

## Performance Tips

- ✅ Use pagination: `?page=1&limit=10`
- ✅ Filter by status/isRead to reduce data
- ✅ Indexes on userId make queries fast
- ✅ Soft-delete keeps data intact
- ✅ TCP transport is faster than RabbitMQ for sync ops
- ✅ Redis for caching (ready but not enabled by default)

## Documentation

- **Full Test Guide**: See `TODOS_BOOKS_TEST_GUIDE.md`
- **Implementation Details**: See `IMPLEMENTATION_STATUS.md`
- **API Docs**: Visit `http://localhost:3000/docs` (Swagger)

---

✨ = Newly implemented (Todos & Books services)
