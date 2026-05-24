# Posts Service - Standalone HTTP Implementation

## What is Posts Service?

A **standalone HTTP server** (not a TCP microservice) designed specifically for mobile applications to manage blog posts/social media posts. It runs independently on port **3006** and does NOT use the API Gateway.

## Architecture

```
┌─────────────────────────────────────────┐
│      Mobile Application                 │
│  (iOS, Android, Web)                    │
└─────────────────┬───────────────────────┘
                  │ HTTP Requests
                  ↓
┌─────────────────────────────────────────┐
│    Posts Service (Port 3006)            │
│  Standalone HTTP Server                 │
│  - JWT Auth Validation                  │
│  - Post CRUD Operations                 │
│  - Like/Unlike System                   │
│  - Publish Workflow                     │
│  - Tag-based Filtering                  │
└─────────────────┬───────────────────────┘
                  │ Direct Connection
                  ↓
┌─────────────────────────────────────────┐
│    MongoDB Atlas                        │
│  (Shared database with other services)  │
└─────────────────────────────────────────┘
```

## Key Differences from API Gateway

| Feature | API Gateway | Posts Service |
|---------|-------------|---------------|
| **Type** | HTTP Server | HTTP Server |
| **Purpose** | Route to microservices | Direct data access |
| **Port** | 3000 | 3006 |
| **Database** | Via TCP ClientProxy | Direct MongoDB |
| **For** | All endpoints | Posts only |
| **Clients** | Web, API, Admin | Mobile apps |
| **Load Balancing** | Microservices | Database |

## File Structure

```
apps/posts-service/
├── src/
│   ├── main.ts                          # HTTP Bootstrap
│   ├── app.module.ts                    # Root module
│   ├── common/
│   │   └── strategies/
│   │       └── jwt.strategy.ts          # JWT validation
│   └── posts/
│       ├── posts.module.ts              # Feature module
│       ├── posts.controller.ts          # REST endpoints
│       ├── posts.service.ts             # Business logic
│       └── posts.repository.ts          # DB queries
├── tsconfig.app.json                    # TypeScript config
└── index.ts                             # Barrel export

libs/
├── database/
│   └── schemas/
│       └── post.schema.ts               # Mongoose schema
└── common/
    └── (decorators, guards, filters, etc)
```

## Endpoints Summary

### Public Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | List published posts (paginated) |
| GET | `/api/posts/:id` | Get single post |

### Protected Routes (JWT Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/posts` | Create new post |
| PUT | `/api/posts/:id` | Update post |
| DELETE | `/api/posts/:id` | Delete post (soft) |
| PATCH | `/api/posts/:id/like` | Like a post |
| PATCH | `/api/posts/:id/unlike` | Unlike a post |
| POST | `/api/posts/:id/publish` | Publish draft post |
| GET | `/api/posts/my-posts/:userId` | Get user's posts |

## Post Object Structure

```typescript
{
  _id: ObjectId,
  userId: ObjectId,          // Author
  title: string,             // Required
  content: string,           // Required
  images: string[],          // URLs array
  tags: string[],            // Search tags
  status: 'draft' | 'published' | 'archived',
  likesCount: number,        // Counter
  likedBy: ObjectId[],       // Array of user IDs
  deletedAt: Date | null,    // Soft delete
  createdAt: Date,           // Auto timestamp
  updatedAt: Date            // Auto timestamp
}
```

## Features Implemented

### 1. Complete CRUD
- **Create**: New posts with title, content, images, tags
- **Read**: Single post, list all published, filter by tag
- **Update**: Edit title, content, tags (author/admin only)
- **Delete**: Soft-delete (records kept, excluded from queries)

### 2. Publish Workflow
- Posts created in **draft** status
- Only drafts can be **published** (status → published)
- Only published posts visible in public list
- Can be **archived** to hide from lists

### 3. Like System
- Users can **like** posts (adds userId to likedBy array)
- **Unlike** removes userId from array
- Automatic likesCount increment/decrement
- Prevents duplicate likes

### 4. Tag Filtering
- Posts can have multiple tags
- Filter published posts by tag: `?tag=technology`
- Composite index on `(tags, status, createdAt)`

### 5. Pagination
- All list endpoints support `?page=1&limit=10`
- Auto-calculated skip offset: `(page - 1) * limit`
- Returns: `{ items: [], total: number }`

### 6. Access Control
- **Create**: Any authenticated user
- **Update/Delete**: Author or admin only
- **View drafts**: Author or admin only
- **Publish**: Author or admin only
- **Like**: Any authenticated user

### 7. Soft Delete
- Deleted records remain in database
- Excluded from all queries via `{ deletedAt: null }`
- Can be recovered by clearing `deletedAt`
- Data integrity preserved

## Database Indexes

Optimized for common queries:

```javascript
// Fast lookup for user's posts
db.posts.createIndex({ userId: 1, deletedAt: 1 })

// Fast filtering by status
db.posts.createIndex({ userId: 1, status: 1 })

// Fast sorting by creation date
db.posts.createIndex({ status: 1, createdAt: -1 })
```

## Port and Configuration

**Default Port**: 3006 (configurable via `POSTS_SERVICE_PORT`)

**Environment Variables**:
```env
POSTS_SERVICE_PORT=3006
POSTS_API_PREFIX=api
MONGO_URI=mongodb+srv://...
MONGO_DB_NAME=nestjs_db
JWT_ACCESS_SECRET=your-secret-key
JWT_ACCESS_EXPIRES_IN=15m
THROTTLE_TTL=60
THROTTLE_LIMIT=100
CORS_ORIGINS=http://localhost:3006,...
```

## Authentication Flow

1. User **logs in** via Auth Service (port 3001) or API Gateway (port 3000)
2. Receives **JWT access token** and refresh token
3. Calls Posts Service (port 3006) with: `Authorization: Bearer {token}`
4. Posts Service **validates JWT** using same JWT_ACCESS_SECRET
5. Extracts userId and role from JWT payload
6. Processes request with authorization checks

## Response Format

All endpoints return standardized response:

**Success**:
```json
{
  "success": true,
  "data": { /* endpoint data */ },
  "timestamp": "2026-05-24T10:00:00.000Z",
  "path": "/api/posts"
}
```

**Error**:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "timestamp": "2026-05-24T10:00:00.000Z",
  "path": "/api/posts"
}
```

## Connection Model

### Direct MongoDB Connection
```typescript
// No TCP microservice overhead
// Direct to MongoDB via Mongoose
@InjectModel(Post.name) postModel: Model<PostDocument>
```

### Benefits vs API Gateway Model
- ✅ Lower latency (no TCP overhead)
- ✅ Simpler architecture for single resource
- ✅ Better for mobile (fewer hops)
- ✅ Independent scaling
- ✅ Dedicated to one feature

## Quick Start Commands

```bash
# Start
npm run start:dev:posts-service

# Build
npm run build:posts-service

# Production
NODE_ENV=production node dist/apps/posts-service/main
```

## Testing

See `POSTS_SERVICE_GUIDE.md` for:
- Complete curl examples
- Mobile app integration code
- Testing checklist
- Error handling scenarios

## Monitoring

Service logs with context:
```
[Posts Service] listening on http://localhost:3006
[Posts Service] Swagger docs at http://localhost:3006/docs
[PostsService] Post created: 507f1f77bcf86cd799439020
[PostsService] Post updated: 507f1f77bcf86cd799439020
```

## Deployment Options

### Docker
```bash
docker run -p 3006:3006 \
  -e MONGO_URI=mongodb://... \
  -e JWT_ACCESS_SECRET=... \
  posts-service:latest
```

### AWS Lambda
- Compile to `dist/apps/posts-service/`
- Package with node_modules
- Set handler to main.ts

### Docker Compose
- Already in root docker-compose.yml
- MongoDB, Redis, RabbitMQ included
- Orchestrate all services together

### Kubernetes
- Create Deployment for posts-service
- Service with NodePort 3006
- ConfigMap for environment variables
- StatefulSet for MongoDB (optional)

## Security

- ✅ JWT validation on protected routes
- ✅ Role-based access control (admin, user)
- ✅ XSS protection via whitelist validation
- ✅ Rate limiting (100 requests per 60s)
- ✅ CORS configured for mobile origins
- ✅ No SQL injection (Mongoose/schema validation)
- ✅ Bcrypt hashing (via Auth Service)

## Next Steps

1. **Start service**: `npm run start:dev:posts-service`
2. **View docs**: `http://localhost:3006/docs`
3. **Test endpoints**: See POSTS_SERVICE_GUIDE.md
4. **Integrate mobile app**: Use curl examples as reference

---

## Summary

Posts Service provides a **fast, independent HTTP API** for mobile applications to manage posts directly from MongoDB, without routing through the API Gateway. It includes authentication via JWT, CRUD operations, like system, tag filtering, and soft-delete support.

**Perfect for**: Mobile apps, social media features, blog platforms, content management systems that need low-latency access to posts.
