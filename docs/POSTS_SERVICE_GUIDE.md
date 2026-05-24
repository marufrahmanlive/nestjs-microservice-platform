# Posts Service - Standalone HTTP API Guide

## Overview

**Posts Service** is a standalone HTTP server (NOT a microservice) specifically designed for mobile applications. It:
- Runs independently on port **3006** (configurable via `POSTS_SERVICE_PORT`)
- Connects directly to MongoDB (does NOT use the API Gateway)
- Has its own JWT authentication
- Provides complete CRUD operations for blog posts/social media posts
- Supports liking, tagging, publishing workflows

## Quick Start

### 1. Start the Posts Service
```bash
npm run start:dev:posts-service
```

The service will start on `http://localhost:3006` with Swagger docs at `http://localhost:3006/docs`

### 2. Get JWT Token
First authenticate via the Auth Service (or API Gateway):

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "author@example.com",
    "password": "Password123",
    "name": "John Doe"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "author@example.com",
    "password": "Password123"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

Save the `accessToken` and use as `{TOKEN}` in the examples below.

---

## API Endpoints

### Create Post
```bash
curl -X POST http://localhost:3006/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{
    "title": "My First Blog Post",
    "content": "This is the content of my post with lots of interesting information.",
    "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
    "tags": ["technology", "coding", "tutorial"],
    "status": "draft"
  }'
```

Response (201 Created):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "userId": "507f1f77bcf86cd799439010",
    "title": "My First Blog Post",
    "content": "This is the content of my post...",
    "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
    "tags": ["technology", "coding", "tutorial"],
    "status": "draft",
    "likesCount": 0,
    "likedBy": [],
    "createdAt": "2026-05-24T10:00:00.000Z",
    "updatedAt": "2026-05-24T10:00:00.000Z"
  },
  "timestamp": "2026-05-24T10:00:00.000Z",
  "path": "/api/posts"
}
```

### List Published Posts (Public)
```bash
# Get all published posts with pagination
curl -X GET "http://localhost:3006/api/posts?page=1&limit=10"

# Get posts by tag
curl -X GET "http://localhost:3006/api/posts?page=1&limit=10&tag=technology"
```

Response:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "507f1f77bcf86cd799439020",
        "userId": "507f1f77bcf86cd799439010",
        "title": "My First Blog Post",
        "content": "This is the content...",
        "images": ["https://example.com/image1.jpg"],
        "tags": ["technology", "coding"],
        "status": "published",
        "likesCount": 5,
        "createdAt": "2026-05-24T10:00:00.000Z",
        ...
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  },
  "timestamp": "2026-05-24T10:00:00.000Z",
  "path": "/api/posts"
}
```

### Get User's Posts (Protected)
```bash
curl -X GET "http://localhost:3006/api/posts/my-posts/{USER_ID}?page=1&limit=10" \
  -H "Authorization: Bearer {TOKEN}"
```

Response includes both draft and published posts for the user.

### Get Single Post (Public)
```bash
curl -X GET "http://localhost:3006/api/posts/507f1f77bcf86cd799439020"
```

### Update Post (Protected)
Only the post author or admin can update:

```bash
curl -X PUT http://localhost:3006/api/posts/507f1f77bcf86cd799439020 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{
    "title": "Updated Title",
    "content": "Updated content here",
    "tags": ["updated", "tags"]
  }'
```

### Publish Post (Protected)
Change post status from draft to published:

```bash
curl -X POST http://localhost:3006/api/posts/507f1f77bcf86cd799439020/publish \
  -H "Authorization: Bearer {TOKEN}"
```

### Like Post (Protected)
```bash
curl -X PATCH http://localhost:3006/api/posts/507f1f77bcf86cd799439020/like \
  -H "Authorization: Bearer {TOKEN}"
```

Response increments `likesCount` and adds userId to `likedBy` array.

### Unlike Post (Protected)
```bash
curl -X PATCH http://localhost:3006/api/posts/507f1f77bcf86cd799439020/unlike \
  -H "Authorization: Bearer {TOKEN}"
```

Response decrements `likesCount` and removes userId from `likedBy` array.

### Delete Post (Protected)
Soft-delete (can be recovered):

```bash
curl -X DELETE http://localhost:3006/api/posts/507f1f77bcf86cd799439020 \
  -H "Authorization: Bearer {TOKEN}"
```

---

## Database Schema

### Post Collection
```javascript
{
  userId: ObjectId (author),
  title: String (required),
  content: String (required),
  images: [String] (URLs to images/media),
  tags: [String] (search tags),
  status: Enum['draft', 'published', 'archived'],
  likesCount: Number (0+),
  likedBy: [ObjectId] (array of user IDs who liked),
  deletedAt: Date (soft-delete timestamp),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes**:
- `{ userId, deletedAt }` - Fast lookup for user's posts
- `{ userId, status }` - Fast filtering by status
- `{ status, createdAt }` - Fast sorting by creation time

---

## Service Architecture

### Independent HTTP Server
```
Mobile App
    ↓ (HTTP)
Posts Service (Port 3006)
    ↓ (Direct)
MongoDB (No Gateway, No TCP Microservice)
```

### Key Features
- **Direct MongoDB**: No intermediate microservices, faster response times
- **JWT Auth**: Uses same JWT secrets as main auth service
- **Standalone**: Does NOT depend on API Gateway
- **Soft Delete**: Posts remain in database, excluded from queries
- **Like System**: Track likes per user with array of IDs
- **Status Workflow**: Draft → Published → Archived
- **Tagging**: Filter posts by multiple tags
- **Pagination**: All list endpoints support page/limit

---

## Access Control

### Public Routes (No Auth Required)
- `GET /api/posts` - List published posts
- `GET /api/posts/:id` - Get single post
- `GET /api/posts?tag=xyz` - Filter by tag

### Protected Routes (JWT Required)
- `POST /api/posts` - Create post
- `GET /api/posts/my-posts/:userId` - User's posts
- `PUT /api/posts/:id` - Update own post
- `DELETE /api/posts/:id` - Delete own post
- `POST /api/posts/:id/publish` - Publish draft
- `PATCH /api/posts/:id/like` - Like post
- `PATCH /api/posts/:id/unlike` - Unlike post

### Authorization Rules
- **Create**: Any authenticated user
- **Update**: Post author or admin
- **Delete**: Post author or admin
- **View drafts**: Only post author or admin
- **View my-posts**: Only the user or admin

---

## Response Format

All responses follow a standardized format:

**Success (200)**
```json
{
  "success": true,
  "data": { /* actual data */ },
  "timestamp": "2026-05-24T10:00:00.000Z",
  "path": "/api/posts"
}
```

**Error (400/401/403/404/500)**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "timestamp": "2026-05-24T10:00:00.000Z",
  "path": "/api/posts"
}
```

---

## Error Handling

Common HTTP status codes:
- `201` - Post created successfully
- `200` - Success (GET, PUT, PATCH)
- `204` - Delete successful (no content)
- `400` - Validation error (missing required fields)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (trying to modify someone else's post)
- `404` - Post not found
- `500` - Server error

---

## Environment Variables

```env
# Server Port
POSTS_SERVICE_PORT=3006
POSTS_API_PREFIX=api

# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
MONGO_DB_NAME=nestjs_db

# JWT (must match auth service)
JWT_ACCESS_SECRET=your-secret-key-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3006
```

---

## Mobile App Integration

### Example: Fetch Published Posts
```typescript
// React Native / Flutter example
async function fetchPosts(page: number = 1) {
  const response = await fetch(
    `http://localhost:3006/api/posts?page=${page}&limit=10`,
    { method: 'GET' }
  );
  const json = await response.json();
  return json.data.items; // Array of posts
}
```

### Example: Create New Post
```typescript
async function createPost(token: string, title: string, content: string) {
  const response = await fetch(
    'http://localhost:3006/api/posts',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title,
        content,
        status: 'draft'
      })
    }
  );
  const json = await response.json();
  return json.data; // Created post
}
```

### Example: Like a Post
```typescript
async function likePost(token: string, postId: string) {
  const response = await fetch(
    `http://localhost:3006/api/posts/${postId}/like`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.json();
}
```

---

## Testing Checklist

- [ ] Create post as authenticated user
- [ ] Verify post starts in draft status
- [ ] Update post content/title
- [ ] Publish draft post (status → published)
- [ ] List published posts (paginated)
- [ ] List posts by tag filter
- [ ] Fetch single post by ID
- [ ] Like a post (likesCount increments, userId added to likedBy)
- [ ] Unlike a post (likesCount decrements, userId removed from likedBy)
- [ ] Delete post (soft-delete, not visible in queries)
- [ ] Try updating someone else's post (should fail with 403)
- [ ] Try accessing my-posts without auth (should fail with 401)
- [ ] Test pagination (page=1&limit=5, page=2&limit=5)
- [ ] Verify response format (success, data, timestamp, path)

---

## Build & Deployment

### Build
```bash
npm run build:posts-service
```

Output: `dist/apps/posts-service/`

### Run in Production
```bash
NODE_ENV=production node dist/apps/posts-service/main
```

### Docker
```bash
docker build -t posts-service .
docker run -p 3006:3006 \
  -e POSTS_SERVICE_PORT=3006 \
  -e MONGO_URI=mongodb://... \
  -e JWT_ACCESS_SECRET=... \
  posts-service
```

---

## Performance Considerations

- **Database indexes** on userId, status, and createdAt for fast queries
- **Pagination required** to prevent large result sets
- **Soft delete** keeps data integrity without losing information
- **Likes array** efficient for small numbers of likes (if >10k, consider denormalization)
- **Direct DB access** faster than going through API Gateway

---

## Notes

- Posts Service is **completely independent** from the API Gateway
- Mobile apps communicate with Posts Service directly on port 3006
- Auth validation still uses the JWT from Auth Service (same JWT_ACCESS_SECRET)
- Database is shared with other services (MongoDB Atlas)
- Response format is identical to other services for consistency
