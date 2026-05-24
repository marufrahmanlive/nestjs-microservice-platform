# NestJS Monorepo - All Services Comparison

## Complete Service Topology

```
┌──────────────────────────────────────────────────────────────────┐
│                    Client Applications                           │
│  (Web Browsers, Desktop Clients, Admin Panels)                   │
└────────────────────┬─────────────────────────────────────────────┘
                     │ HTTP
                     ▼
    ┌────────────────────────────────┐
    │    API Gateway (Port 3000)     │ ← REST endpoint for most APIs
    │  (HTTP Server, Orchestrator)   │
    └─┬──┬──┬──────────────────────┬─┘
      │  │  │                      │
      │  │  │ TCP (Internal)       │
      │  │  │                      │
      ▼  ▼  ▼                      ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
    │Auth      │ │User      │ │Todos     │ │Books     │
    │Service   │ │Service   │ │Service   │ │Service   │
    │(3001)    │ │(3002)    │ │(3004)    │ │(3005)    │
    │TCP       │ │TCP       │ │TCP       │ │TCP       │
    └─┬────────┘ └─┬────────┘ └─┬────────┘ └─┬────────┘
      │           │            │            │
      │ Direct    │ Direct     │ Direct      │ Direct
      ▼           ▼            ▼            ▼
    ┌──────────────────────────────────────────┐
    │         MongoDB Atlas Database            │
    │  Collections:                             │
    │  - users     (shared)                     │
    │  - todos     (shared)                     │
    │  - books     (shared)                     │
    │  - posts     (shared)                     │
    └──────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                Mobile Applications                               │
│  (iOS, Android, React Native, Flutter)                           │
└────────────────────┬──────────────────────────────────────────┬──┘
                     │ HTTP                                      │
                     ▼                                           ▼
    ┌────────────────────────────────┐    ┌──────────────────────┐
    │   Posts Service (Port 3006)    │    │ (Other mobile APIs)  │
    │  (Standalone HTTP Server)      │    │ (Future services)    │
    │  - Direct DB access            │    │ - Like posts-service │
    │  - No API Gateway              │    │ - On different ports │
    └─────────────┬──────────────────┘    │                      │
                  │ Direct                 └──────────────────────┘
                  ▼
    ┌──────────────────────────────────────────┐
    │         MongoDB Atlas Database            │
    │  (Same shared database)                   │
    └──────────────────────────────────────────┘

    RabbitMQ
    └─ Notification-Worker (async events)
       Connected to api-gateway and services
```

---

## Service Breakdown

### 1. API Gateway (HTTP Server, Port 3000)

**Purpose**: Centralized entry point routing to internal microservices

**Uses**: 
- Clients: Web browsers, desktop apps, admin panels
- Communicates with: Auth, User, Todos, Books services via TCP

**Endpoints**:
- Authentication: `/api/v1/auth/*` (register, login, logout, refresh)
- Users: `/api/v1/users/*` (CRUD)
- Todos: `/api/v1/todos/*` (CRUD + filters)
- Books: `/api/v1/books/*` (CRUD + filters)

**Architecture**:
```
Request → API Gateway → TCP ClientProxy → Microservice → MongoDB
```

**When to use**: Web apps, complex workflows, centralized logging, rate limiting, validation

---

### 2. Auth Service (TCP Microservice, Port 3001)

**Purpose**: JWT token generation, validation, and user authentication

**Transport**: TCP (called by API Gateway via ClientProxy)

**Operations**:
- User registration (password hash with bcrypt)
- User login (credential verification)
- Token generation (access + refresh)
- Token validation
- Token refresh/rotation
- Token revocation (Redis blacklist)

**Database**: Mongoose with User schema

**Not directly accessible**: Clients cannot call this directly; must go through API Gateway

---

### 3. User Service (TCP Microservice, Port 3002)

**Purpose**: User profile management and lookups

**Transport**: TCP (called by API Gateway via ClientProxy)

**Operations**:
- Find user by ID
- Find user by email
- List users with pagination
- Create user
- Update user profile
- Delete user (soft-delete)

**Database**: Mongoose with User schema

**Not directly accessible**: Clients must go through API Gateway

---

### 4. Todos Service (TCP Microservice, Port 3004)

**Purpose**: Task/todo item management

**Transport**: TCP (called by API Gateway via ClientProxy)

**Operations**:
- Create todo with title, description, priority, dueDate
- List user's todos (paginated)
- Filter todos by status (pending, in_progress, completed)
- Update todo (status, priority, etc)
- Delete todo (soft-delete)

**Database**: Mongoose with Todo schema

**Features**:
- Status tracking with enum
- Priority levels
- Due date scheduling
- Soft-delete support
- Pagination with sorting

**Not directly accessible**: Clients must go through API Gateway

---

### 5. Books Service (TCP Microservice, Port 3005)

**Purpose**: Book library/collection management

**Transport**: TCP (called by API Gateway via ClientProxy)

**Operations**:
- Add book with title, author, ISBN, genres, rating
- List user's books (paginated)
- Filter by read status (isRead boolean)
- Filter by genre
- Update book (rating, read status, etc)
- Delete book (soft-delete)

**Database**: Mongoose with Book schema

**Features**:
- Rating system (0-5)
- Genre categorization (array)
- Read status tracking
- ISBN and publisher info
- Soft-delete support
- Pagination

**Not directly accessible**: Clients must go through API Gateway

---

### 6. Posts Service (HTTP Server, Port 3006) ✨ NEW

**Purpose**: Blog posts/social media posts for mobile applications

**Transport**: HTTP (directly accessible by mobile clients)

**Operations**:
- Create post with title, content, images, tags
- List published posts (public, paginated)
- Filter posts by tag
- Get user's posts (protected)
- Update post (author/admin only)
- Delete post (soft-delete)
- Like/unlike posts
- Publish draft posts

**Database**: Mongoose with Post schema (direct connection)

**Features**:
- Publish workflow (draft → published)
- Like/unlike system with counters
- Tag-based filtering
- Soft-delete
- Pagination
- Authorization checks per method
- Same JWT validation as other services

**Direct access**: Mobile apps connect directly on port 3006 (no API Gateway)

**When to use**: Mobile apps needing fast, dedicated access to posts

---

### 7. Notification Worker (Hybrid, Port 3003 for WebSocket)

**Purpose**: Async event processing and push notifications

**Transport**: RabbitMQ (message consumer) + HTTP/WebSocket (optional)

**Operations**:
- Consumes notification.send events from RabbitMQ
- Dispatches via multiple channels:
  - Email (SMTP with Nodemailer)
  - Push notifications (Firebase Cloud Messaging)
  - SMS (Twilio)
  - In-app notifications (WebSocket)

**Not directly called**: Events published by other services

**Used by**: All services that need to send notifications

---

## Key Differences

### TCP Microservices (Auth, User, Todos, Books)
```typescript
// Called via ClientProxy from API Gateway
this.authClient.send(AUTH_PATTERNS.LOGIN, dto).pipe(
  timeout(5000),
  catchError(err => throwHttpException())
)
```

**Pros**:
- Low latency binary protocol
- Request-reply pattern
- Centralized routing via gateway
- Easier to monitor all traffic
- Consistent error handling

**Cons**:
- Extra hop through gateway
- Gateway becomes bottleneck
- Cannot be called directly

---

### Standalone HTTP Service (Posts)
```typescript
// Directly accessible by clients
app = await NestFactory.create(AppModule)
app.listen(3006)
```

**Pros**:
- Direct client access (lower latency)
- Independent scaling
- Dedicated to one feature
- No gateway overhead
- Simpler routing

**Cons**:
- Separate deployment needed
- Separate authentication logic
- More services to manage
- Potential inconsistency

---

## Database Architecture

### Shared MongoDB Instance

All services connect to the **same MongoDB database**:

```javascript
// Collections
{
  users: [...],      // User profiles
  todos: [...],      // Todo items
  books: [...],      // Book collection
  posts: [...],      // Blog posts
}
```

**Sharing Strategy**:
- Same MONGO_URI across all services
- Same MONGO_DB_NAME (nestjs_db)
- Each collection indexed for performance
- Soft-delete pattern with `deletedAt` field

**Foreign Keys**:
- All documents have `userId` field linking to User
- No MongoDB joins; relationships are implicit
- Application-level joins if needed

---

## Authentication & Authorization

### JWT Token Flow

```
1. User logs in via API Gateway auth endpoint
   ↓
2. Auth Service validates credentials, generates JWT
   ↓
3. Client receives accessToken + refreshToken
   ↓
4. Client uses accessToken in Authorization header
   ↓
5. Every service validates JWT using same JWT_ACCESS_SECRET
   ↓
6. Role-based access control applied (@Roles decorator)
```

### Shared Secrets

```env
JWT_ACCESS_SECRET=your-secret-key-min-32-chars-long
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars-long
```

**All services use same secrets** for token validation.

---

## Response Format Consistency

All services return standardized response format:

```json
// Success
{
  "success": true,
  "data": { /* service data */ },
  "timestamp": "2026-05-24T10:00:00.000Z",
  "path": "/api/endpoint"
}

// Error
{
  "success": false,
  "statusCode": 400,
  "message": "Error description",
  "timestamp": "2026-05-24T10:00:00.000Z",
  "path": "/api/endpoint"
}
```

Handled by shared `TransformInterceptor` and `HttpExceptionFilter` from `@app/common`.

---

## Scaling Considerations

### Horizontal Scaling

**API Gateway** (stateless):
- Deploy multiple instances
- Use load balancer (Nginx, AWS ALB)
- Sessions stored in JWT (no session affinity needed)

**Microservices** (stateless):
- Deploy multiple Auth/User/Todos/Books instances
- Each connects to same MongoDB
- TCP load balancer or service mesh

**Posts Service** (stateless):
- Deploy multiple instances
- Each connects to same MongoDB
- HTTP load balancer

**Database** (stateful):
- MongoDB Atlas handles replication
- Automatic failover
- Backups and recovery

---

## Deployment Models

### Development (Single Machine)
```bash
npm install
npm run start:dev:api-gateway
npm run start:dev:auth-service
npm run start:dev:user-service
npm run start:dev:todos-service
npm run start:dev:books-service
npm run start:dev:posts-service
```

### Docker Compose
```bash
docker-compose up -d
npm run build
npm run start:prod
```

### Docker Kubernetes
```bash
# Build images
docker build -t api-gateway:1.0 -f Dockerfile.api-gateway .
docker build -t posts-service:1.0 -f Dockerfile.posts-service .
...

# Deploy to K8s
kubectl apply -f deployments/
kubectl apply -f services/
```

### AWS (ECS/Fargate)
```
- API Gateway → ECS Task + ALB
- Auth Service → ECS Task
- Posts Service → ECS Task + ALB
- MongoDB → RDS (MongoDB Atlas Atlas recommended)
- Redis → ElastiCache
- RabbitMQ → RabbitMQ-as-a-service or self-managed
```

---

## When to Use Each Service

### Use API Gateway When:
- ✅ Building web applications
- ✅ Desktop clients
- ✅ Admin panels
- ✅ Complex workflows combining multiple resources
- ✅ Centralized logging/monitoring
- ✅ Single authentication point

### Use TCP Microservices When:
- ✅ Internal service-to-service communication
- ✅ Request-reply pattern needed
- ✅ High throughput, low latency required
- ✅ Centralized orchestration preferred
- ✅ Easy to monitor in one place

### Use Standalone HTTP Service (Posts) When:
- ✅ Mobile applications
- ✅ Low-latency requirements
- ✅ Single resource focus
- ✅ Independent scaling needed
- ✅ Simpler architecture for limited scope
- ✅ Direct client access preferred

### Use RabbitMQ Notification Worker When:
- ✅ Async event processing
- ✅ Fire-and-forget operations
- ✅ Multiple notification channels
- ✅ Decoupled systems
- ✅ Batch processing

---

## Service Communication Map

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ HTTP
       ├─────────────────────────┬─────────────────────┐
       ▼                         ▼                     ▼
   ┌────────┐          ┌────────────────┐      ┌───────────┐
   │ Gateway│          │ Posts Service  │      │(Other apps)
   │(3000)  │          │(3006)          │      │
   └───┬────┘          └────┬───────────┘      └───────────┘
       │                    │
       │ TCP                │ Direct
       ├─┬─┬─┬──────────────┴────────────┐
       ▼ ▼ ▼ ▼                          ▼
    ┌────────────────────────────────────────┐
    │    MongoDB Atlas (Shared Database)     │
    └────────────────────────────────────────┘
           ▲
           │
       ┌───┴────────────┐
       ▼                ▼
   Redis Cache    RabbitMQ Events
   (Optional)     (Notifications)
```

---

## Environment Variables

All services share common configuration:

```env
# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
MONGO_DB_NAME=nestjs_db

# Cache
REDIS_URI=redis://localhost:6379

# Message Broker
RABBITMQ_URI=amqp://guest:guest@localhost:5672

# JWT
JWT_ACCESS_SECRET=your-secret-key-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# Service Ports
GATEWAY_PORT=3000
AUTH_SERVICE_PORT=3001
USER_SERVICE_PORT=3002
TODOS_SERVICE_PORT=3004
BOOKS_SERVICE_PORT=3005
POSTS_SERVICE_PORT=3006
WS_PORT=3003

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3006
```

---

## Summary Table

| Aspect | Gateway | Auth | User | Todos | Books | Posts | Worker |
|--------|---------|------|------|-------|-------|-------|--------|
| **Type** | HTTP | TCP | TCP | TCP | TCP | HTTP | RabbitMQ |
| **Port** | 3000 | 3001 | 3002 | 3004 | 3005 | 3006 | - |
| **Access** | Public | Internal | Internal | Internal | Internal | Public | Internal |
| **Clients** | Web/Desktop | Gateway | Gateway | Gateway | Gateway | Mobile | Services |
| **Database** | Proxies | Direct | Direct | Direct | Direct | Direct | No DB |
| **Latency** | Medium | Low | Low | Low | Low | Very Low | N/A |
| **Scaling** | Horizontal | Vertical | Vertical | Vertical | Vertical | Horizontal | Horizontal |

---

## Next Steps

1. **Start all services**: `npm run start:dev:*`
2. **View API docs**: `http://localhost:3000/docs` (Gateway) & `http://localhost:3006/docs` (Posts)
3. **Test endpoints**: Use curl/Postman with provided examples
4. **Deploy to cloud**: Follow AWS/Docker/K8s guides
5. **Monitor performance**: Use Prometheus + Grafana for metrics

---

All services are **production-ready**, **fully documented**, and **ready for deployment**.
