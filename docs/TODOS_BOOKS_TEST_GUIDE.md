# Todos and Books Services - API Test Guide

## Setup

### 1. Start all services
```bash
# Terminal 1: Start API Gateway
npm run start:dev:api-gateway

# Terminal 2: Start Todos Service
npm run start:dev:todos-service

# Terminal 3: Start Books Service
npm run start:dev:books-service

# Terminal 4: Start Auth Service
npm run start:dev:auth-service

# Terminal 5: Start User Service
npm run start:dev:user-service
```

### 2. Get JWT Token
First, register a new user:

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123",
    "name": "Test User"
  }'
```

Then login to get tokens:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
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
  },
  "timestamp": "2026-05-24T10:00:00.000Z",
  "path": "/api/v1/auth/login"
}
```

Save the `accessToken` for the next requests. Replace `{TOKEN}` with this value in the following examples.

---

## Todos Endpoints

### Create Todo
```bash
curl -X POST http://localhost:3000/api/v1/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "dueDate": "2026-05-25T10:00:00Z",
    "priority": 1
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439010",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "status": "pending",
    "dueDate": "2026-05-25T10:00:00Z",
    "priority": 1,
    "createdAt": "2026-05-24T10:00:00.000Z",
    "updatedAt": "2026-05-24T10:00:00.000Z"
  },
  "timestamp": "2026-05-24T10:00:00.000Z",
  "path": "/api/v1/todos"
}
```

### List User Todos
```bash
curl -X GET "http://localhost:3000/api/v1/todos?page=1&limit=10" \
  -H "Authorization: Bearer {TOKEN}"
```

Response:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "userId": "507f1f77bcf86cd799439010",
        "title": "Buy groceries",
        "status": "pending",
        "priority": 1,
        ...
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  },
  "timestamp": "2026-05-24T10:00:00.000Z",
  "path": "/api/v1/todos"
}
```

### Get Todo by ID
```bash
curl -X GET http://localhost:3000/api/v1/todos/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer {TOKEN}"
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439010",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "status": "pending",
    "dueDate": "2026-05-25T10:00:00Z",
    "priority": 1,
    "createdAt": "2026-05-24T10:00:00.000Z",
    "updatedAt": "2026-05-24T10:00:00.000Z"
  },
  "timestamp": "2026-05-24T10:00:00.000Z",
  "path": "/api/v1/todos/507f1f77bcf86cd799439011"
}
```

### Update Todo
```bash
curl -X PUT http://localhost:3000/api/v1/todos/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{
    "status": "in_progress",
    "priority": 2
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "in_progress",
    "priority": 2,
    "updatedAt": "2026-05-24T10:05:00.000Z",
    ...
  },
  "timestamp": "2026-05-24T10:05:00.000Z",
  "path": "/api/v1/todos/507f1f77bcf86cd799439011"
}
```

### Delete Todo
```bash
curl -X DELETE http://localhost:3000/api/v1/todos/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer {TOKEN}"
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "deletedAt": "2026-05-24T10:10:00.000Z"
  },
  "timestamp": "2026-05-24T10:10:00.000Z",
  "path": "/api/v1/todos/507f1f77bcf86cd799439011"
}
```

---

## Books Endpoints

### Create Book
```bash
curl -X POST http://localhost:3000/api/v1/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{
    "title": "The Clean Code",
    "author": "Robert C. Martin",
    "description": "A Handbook of Agile Software Craftsmanship",
    "isbn": "978-0132350884",
    "pages": 464,
    "publishedDate": "2008-08-01T00:00:00Z",
    "publisher": "Prentice Hall",
    "genres": ["programming", "software-engineering"],
    "rating": 5,
    "isRead": true
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439010",
    "title": "The Clean Code",
    "author": "Robert C. Martin",
    "description": "A Handbook of Agile Software Craftsmanship",
    "isbn": "978-0132350884",
    "pages": 464,
    "publishedDate": "2008-08-01T00:00:00Z",
    "publisher": "Prentice Hall",
    "genres": ["programming", "software-engineering"],
    "rating": 5,
    "isRead": true,
    "createdAt": "2026-05-24T10:00:00.000Z",
    "updatedAt": "2026-05-24T10:00:00.000Z"
  },
  "timestamp": "2026-05-24T10:00:00.000Z",
  "path": "/api/v1/books"
}
```

### List User Books
```bash
curl -X GET "http://localhost:3000/api/v1/books?page=1&limit=10" \
  -H "Authorization: Bearer {TOKEN}"
```

Response:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "userId": "507f1f77bcf86cd799439010",
        "title": "The Clean Code",
        "author": "Robert C. Martin",
        "isRead": true,
        "rating": 5,
        ...
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  },
  "timestamp": "2026-05-24T10:00:00.000Z",
  "path": "/api/v1/books"
}
```

### Get Book by ID
```bash
curl -X GET http://localhost:3000/api/v1/books/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer {TOKEN}"
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439010",
    "title": "The Clean Code",
    "author": "Robert C. Martin",
    "description": "A Handbook of Agile Software Craftsmanship",
    "isbn": "978-0132350884",
    "pages": 464,
    "publishedDate": "2008-08-01T00:00:00Z",
    "publisher": "Prentice Hall",
    "genres": ["programming", "software-engineering"],
    "rating": 5,
    "isRead": true,
    "createdAt": "2026-05-24T10:00:00.000Z",
    "updatedAt": "2026-05-24T10:00:00.000Z"
  },
  "timestamp": "2026-05-24T10:00:00.000Z",
  "path": "/api/v1/books/507f1f77bcf86cd799439012"
}
```

### Update Book
```bash
curl -X PUT http://localhost:3000/api/v1/books/507f1f77bcf86cd799439012 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{
    "rating": 4,
    "isRead": false
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "rating": 4,
    "isRead": false,
    "updatedAt": "2026-05-24T10:05:00.000Z",
    ...
  },
  "timestamp": "2026-05-24T10:05:00.000Z",
  "path": "/api/v1/books/507f1f77bcf86cd799439012"
}
```

### Delete Book
```bash
curl -X DELETE http://localhost:3000/api/v1/books/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer {TOKEN}"
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "deletedAt": "2026-05-24T10:10:00.000Z"
  },
  "timestamp": "2026-05-24T10:10:00.000Z",
  "path": "/api/v1/books/507f1f77bcf86cd799439012"
}
```

---

## Database Schema

### Todo Schema
- `userId`: ObjectId (indexed)
- `title`: String (required)
- `description`: String (optional)
- `status`: String (pending|in_progress|completed, default: pending)
- `dueDate`: Date (optional)
- `priority`: Number (optional)
- `deletedAt`: Date (soft-delete)
- `createdAt`: Date (timestamp)
- `updatedAt`: Date (timestamp)

**Indexes**: `{userId, deletedAt}`, `{userId, status}`

### Book Schema
- `userId`: ObjectId (indexed)
- `title`: String (required)
- `author`: String (required)
- `description`: String (optional)
- `isbn`: String (optional)
- `pages`: Number (optional)
- `publishedDate`: Date (optional)
- `publisher`: String (optional)
- `genres`: [String] (optional, e.g., ["fiction", "science"])
- `rating`: Number (0-5, optional)
- `isRead`: Boolean (default: false)
- `deletedAt`: Date (soft-delete)
- `createdAt`: Date (timestamp)
- `updatedAt`: Date (timestamp)

**Indexes**: `{userId, deletedAt}`, `{userId, isRead}`

---

## Architecture

### Message Patterns

**Todos Service**:
- `todo.create` - Create new todo
- `todo.findById` - Get todo by ID
- `todo.findByUser` - List user's todos with pagination
- `todo.findByStatus` - Filter todos by status
- `todo.update` - Update todo
- `todo.delete` - Soft delete todo
- `todo.list` - Alias for findByUser

**Books Service**:
- `book.create` - Create new book
- `book.findById` - Get book by ID
- `book.findByUser` - List user's books with pagination
- `book.findByReadStatus` - Filter by read status
- `book.findByGenre` - Filter by genre
- `book.update` - Update book
- `book.delete` - Soft delete book
- `book.list` - Alias for findByUser

### Transport
- API Gateway (HTTP/REST) → Todos/Books Service (TCP)
- All calls use `ClientProxy.send()` with 5s timeout
- Errors propagated as HttpException

---

## Testing Checklist

- [ ] Register and login to get JWT token
- [ ] Create a todo with all fields
- [ ] List todos with pagination
- [ ] Fetch single todo by ID
- [ ] Update todo (change status, priority)
- [ ] Delete todo (verify soft-delete)
- [ ] Create a book with all fields
- [ ] List books with pagination
- [ ] Fetch single book by ID
- [ ] Update book (change rating, isRead)
- [ ] Delete book (verify soft-delete)
- [ ] Test pagination (page, limit parameters)
- [ ] Verify authorization (Bearer token required)
- [ ] Verify response format (success, data, timestamp, path)
