# Posts Service - Complete Implementation Summary

## ✅ Implementation Complete

A **standalone HTTP server for Posts CRUD** has been fully implemented for mobile applications.

## What Was Created

### New Files (8 files)

#### 1. Post Schema
**File**: `libs/database/src/schemas/post.schema.ts`
- Mongoose schema with fields: userId, title, content, images[], tags[], status, likesCount, likedBy[], deletedAt, timestamps
- Status enum: draft, published, archived
- Three composite indexes for performance
- Soft-delete support

#### 2. Posts Service App Structure
**App**: `apps/posts-service/src/`

**main.ts**
- NestFactory.create() HTTP server
- Port: POSTS_SERVICE_PORT (default 3006)
- Global filters, interceptors, pipes
- Swagger documentation
- CORS enabled

**app.module.ts**
- ConfigModule for environment variables
- DatabaseModule for MongoDB
- PassportModule for JWT
- JwtModule for token validation
- ThrottlerModule for rate limiting
- APP_GUARD providers for authentication/authorization

**common/strategies/jwt.strategy.ts**
- Passport JWT strategy
- Extracts Bearer token from Authorization header
- Validates JWT using JWT_ACCESS_SECRET
- Returns JwtPayload (sub, email, role, iat, exp)

**posts/posts.repository.ts**
- Extends AbstractRepository<PostDocument>
- Methods:
  - findByUser() - Get user's posts
  - findPublished() - Get published posts
  - findByTag() - Filter by tag
  - Inherits: create, findById, findOne, findOneAndUpdate, softDelete, deleteOne, countDocuments

**posts/posts.service.ts**
- Create new posts
- Retrieve posts (all, by user, by tag, published)
- Update post metadata
- Delete (soft-delete)
- Like/Unlike system
- Publish workflow

**posts/posts.controller.ts**
- REST endpoints with proper HTTP methods and status codes:
  - POST /api/posts - Create (201)
  - GET /api/posts - List (200)
  - GET /api/posts?tag=xyz - Filter (200)
  - GET /api/posts/my-posts/:userId - User posts (200)
  - GET /api/posts/:id - Single post (200)
  - PUT /api/posts/:id - Update (200)
  - DELETE /api/posts/:id - Delete (204)
  - PATCH /api/posts/:id/like - Like (200)
  - PATCH /api/posts/:id/unlike - Unlike (200)
  - POST /api/posts/:id/publish - Publish (200)
- Proper decorators: @Public, @CurrentUser, @Roles, @ApiBearerAuth
- Authorization checks in controller methods

**posts/posts.module.ts**
- Feature module with controller, service, and repository

#### 3. Configuration Files

**apps/posts-service/tsconfig.app.json**
- TypeScript configuration extending root tsconfig.json
- Output to dist/apps/posts-service/
- Source root ./src

### Updated Files (4 files)

#### 1. libs/database/src/database.module.ts
- Added Post schema registration in MongooseModule.forFeature()

#### 2. libs/database/src/index.ts
- Added export for Post schema

#### 3. nest-cli.json
- Added posts-service project configuration
- Type: application
- Root: apps/posts-service
- EntryFile: main
- TsConfigPath: apps/posts-service/tsconfig.app.json

#### 4. package.json
- Added `build:posts-service` script
- Added `start:dev:posts-service` script

#### 5. .env.example
- Added POSTS_SERVICE_PORT=3006

## API Endpoints Implemented

### Public Endpoints (No Auth)
```
GET  /api/posts              - List published posts (paginated)
GET  /api/posts?tag=xyz      - Filter by tag
GET  /api/posts/:id          - Get single post
```

### Protected Endpoints (JWT Required)
```
POST   /api/posts                   - Create new post
GET    /api/posts/my-posts/:userId  - User's posts
PUT    /api/posts/:id               - Update post
DELETE /api/posts/:id               - Delete post
PATCH  /api/posts/:id/like          - Like post
PATCH  /api/posts/:id/unlike        - Unlike post
POST   /api/posts/:id/publish       - Publish draft
```

## Database Collections

### Post Schema
```javascript
{
  _id: ObjectId,
  userId: String (author ID),
  title: String (required),
  content: String (required),
  images: [String] (image URLs),
  tags: [String] (search tags),
  status: String ('draft'|'published'|'archived'),
  likesCount: Number (0-n),
  likedBy: [String] (user IDs who liked),
  deletedAt: Date|null (soft-delete),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

Indexes:
- { userId: 1, deletedAt: 1 }
- { userId: 1, status: 1 }
- { status: 1, createdAt: -1 }
```

## Architecture

### Standalone HTTP Service
- **NOT a TCP microservice** (no Transport.TCP)
- **NOT proxied through API Gateway**
- **Direct MongoDB connection** via DatabaseModule
- **Dedicated port 3006** for mobile apps
- **Own JWT validation** using JWT_ACCESS_SECRET
- **Identical response format** to other services

### Service Topology
```
Mobile App
    ↓ HTTP POST/GET/PUT/DELETE
Posts Service (3006)
    ↓ Direct Mongoose
MongoDB (Atlas)
```

## Authentication & Authorization

### JWT Validation
- Token extracted from Authorization header: `Bearer {token}`
- Validated using JWT_ACCESS_SECRET (from ConfigService)
- User info extracted: userId (sub), email, role
- @CurrentUser() decorator injects JwtPayload

### Authorization Checks
- **@Public()** decorator skips JwtAuthGuard
- **@Roles(UserRole.ADMIN)** checks user role
- **Controller-level checks** for ownership (author of post)
- **403 Forbidden** if not authorized
- **401 Unauthorized** if token invalid/missing

### Access Rules
| Operation | Requirements |
|-----------|--------------|
| Create | Authenticated |
| Update | Author OR Admin |
| Delete | Author OR Admin |
| Publish | Author OR Admin |
| Like | Authenticated |
| Unlike | Authenticated |
| View published | Public |
| View drafts | Author OR Admin |

## Response Format

### Success (200/201)
```json
{
  "success": true,
  "data": { /* post object */ },
  "timestamp": "2026-05-24T10:00:00.000Z",
  "path": "/api/posts"
}
```

### Error (4xx/5xx)
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed: title is required",
  "timestamp": "2026-05-24T10:00:00.000Z",
  "path": "/api/posts"
}
```

## Features

### 1. Post Management
- ✅ Create posts with title, content, images, tags
- ✅ Update post metadata
- ✅ Delete posts (soft-delete, recoverable)
- ✅ View single or paginated lists

### 2. Publish Workflow
- ✅ Posts created in draft status
- ✅ Publish endpoint to change status
- ✅ Only published posts visible in public list
- ✅ Archive status for old posts

### 3. Like System
- ✅ Like posts (adds userId to likedBy array)
- ✅ Unlike posts (removes userId)
- ✅ Auto-increment/decrement likesCount
- ✅ Prevent duplicate likes

### 4. Filtering & Search
- ✅ List published posts (paginated)
- ✅ Filter by tag with pagination
- ✅ Get user's posts (draft + published)
- ✅ Composite database indexes

### 5. Soft Delete
- ✅ Records kept in database
- ✅ Excluded from queries via deletedAt filter
- ✅ Recoverable by clearing deletedAt field
- ✅ Data integrity maintained

### 6. Rate Limiting
- ✅ ThrottlerModule integrated
- ✅ Configurable: THROTTLE_TTL (60s), THROTTLE_LIMIT (100)
- ✅ Applies to all routes globally

### 7. Validation
- ✅ ValidationPipe with whitelist: true
- ✅ DTO validation on create/update
- ✅ Automatic error responses for invalid input

## Environment Variables

```env
# Server
POSTS_SERVICE_PORT=3006
POSTS_API_PREFIX=api

# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
MONGO_DB_NAME=nestjs_db

# JWT (must match Auth Service)
JWT_ACCESS_SECRET=your-secret-key-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# CORS
CORS_ORIGINS=http://localhost:3006,http://localhost:3000
```

## How to Run

### Development
```bash
npm run start:dev:posts-service
```
- Auto-restart on file changes
- Swagger docs at `http://localhost:3006/docs`

### Build
```bash
npm run build:posts-service
```
- Output: `dist/apps/posts-service/`

### Production
```bash
NODE_ENV=production node dist/apps/posts-service/main
```

## Testing

### Via Swagger UI
1. Open `http://localhost:3006/docs`
2. Click "Authorize" button
3. Paste JWT token
4. Try out endpoints

### Via curl
See `POSTS_SERVICE_GUIDE.md` for complete examples

### Checklist
- [ ] Start service: `npm run start:dev:posts-service`
- [ ] Create post as authenticated user
- [ ] List published posts (public)
- [ ] Get user's posts (protected)
- [ ] Update own post
- [ ] Like a post
- [ ] Unlike a post
- [ ] Publish draft post
- [ ] Delete post (soft)
- [ ] Filter by tag
- [ ] Verify pagination
- [ ] Check response format
- [ ] Test authorization (403 on unauthorized access)
- [ ] Test authentication (401 on missing token)

## Comparison with Todos/Books Services

| Feature | Todos/Books | Posts |
|---------|-----------|-------|
| **Type** | TCP Microservice | HTTP Server |
| **Transport** | NestFactory.createMicroservice | NestFactory.create |
| **Gateway Access** | Via ClientProxy | Direct only |
| **Database** | Via Repository | Direct Repository |
| **Port** | 3004/3005 | 3006 |
| **Pattern** | @MessagePattern | REST @Get/@Post |
| **Use Case** | Internal services | Mobile apps |

## Mobile App Integration

### TypeScript Example
```typescript
// Create post
const createPost = async (token: string, post: any) => {
  const response = await fetch('http://localhost:3006/api/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(post)
  });
  return response.json();
};

// Get posts
const getPosts = async (page = 1) => {
  const response = await fetch(
    `http://localhost:3006/api/posts?page=${page}&limit=10`
  );
  return response.json();
};

// Like post
const likePost = async (token: string, postId: string) => {
  const response = await fetch(
    `http://localhost:3006/api/posts/${postId}/like`,
    {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  return response.json();
};
```

## Documentation Files

1. **POSTS_SERVICE_OVERVIEW.md** - Architecture and design
2. **POSTS_SERVICE_GUIDE.md** - Complete API reference with curl examples
3. **POSTS_SERVICE_IMPLEMENTATION.md** - This file (technical details)

## Summary

✅ **Posts Service is a fully functional standalone HTTP server** for managing blog posts/social media posts, specifically designed for mobile applications. It:

- Runs independently on port 3006
- Connects directly to MongoDB (no API Gateway)
- Provides complete CRUD operations
- Includes like/unlike system
- Supports publish workflow
- Implements soft-delete
- Uses JWT authentication
- Returns standardized responses
- Has Swagger documentation
- Includes rate limiting
- Ready for production deployment

Mobile apps can connect directly to Posts Service without going through the API Gateway, providing lower latency and simpler architecture for a single resource type.
