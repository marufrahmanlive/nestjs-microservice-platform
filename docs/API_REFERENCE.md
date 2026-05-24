# API Reference - Quick Guide

## Base URL
```
http://localhost:3000/api
```

## Health Check (Public)
```bash
GET /health
# No authentication required
# Response: { "success": true, "data": { "status": "ok", ... } }
```

## Authentication

### Register (Public)
```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}

# Response: { "success": true, "data": { "user": {...}, "accessToken": "...", "refreshToken": "..." } }
```

### Login (Public)
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

# Response: { "success": true, "data": { "user": {...}, "accessToken": "...", "refreshToken": "..." } }
```

### Logout (Protected)
```bash
POST /auth/logout
Authorization: Bearer {accessToken}

# Response: { "success": true, "data": { "success": true } }
```

### Refresh Token (Public)
```bash
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "..."
}

# Response: { "success": true, "data": { "accessToken": "...", "refreshToken": "..." } }
```

## Users

### Get Current User (Protected)
```bash
GET /users/me
Authorization: Bearer {accessToken}

# Response: { "success": true, "data": { "_id": "...", "email": "...", ... } }
```

### Get User by ID (Protected)
```bash
GET /users/{userId}
Authorization: Bearer {accessToken}

# Response: { "success": true, "data": { "_id": "...", ... } }
```

### List Users (Protected)
```bash
GET /users?page=1&limit=10
Authorization: Bearer {accessToken}

# Response: { "success": true, "data": { "items": [...], "total": 42 } }
```

### Update User (Protected)
```bash
PUT /users/{userId}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "newemail@example.com"
}

# Response: { "success": true, "data": { "_id": "...", ... } }
```

### Delete User (Admin Only)
```bash
DELETE /users/{userId}
Authorization: Bearer {accessToken}

# Response: { "success": true, "data": { "_id": "...", ... } }
```

## Authentication Headers

All protected endpoints require:
```bash
Authorization: Bearer {accessToken}
```

Where {accessToken} is obtained from `/auth/register` or `/auth/login`

## Response Format

All successful responses:
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/path"
}
```

All error responses:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/path"
}
```

## HTTP Status Codes

- 200 OK - Successful request
- 201 Created - Resource created
- 400 Bad Request - Invalid input
- 401 Unauthorized - Invalid or missing token
- 403 Forbidden - Insufficient permissions
- 404 Not Found - Resource not found
- 429 Too Many Requests - Rate limit exceeded
- 500 Internal Server Error - Server error

## Rate Limiting

Default: 100 requests per 60 seconds per IP

When exceeded:
```json
{
  "success": false,
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

## Example Flow

1. Register user
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "name": "Test User"
  }' \
  | jq -r '.data.accessToken' > token.txt
```

2. Use token for protected request
```bash
TOKEN=$(cat token.txt)
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```

3. Login again to get new tokens
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }' | jq '.data'
```

## WebSocket (Notification Gateway)

Port: 3003
Endpoint: ws://localhost:3003/notifications

### Connect
```javascript
const socket = io('http://localhost:3003/notifications', {
  auth: {
    userId: 'user_id_here'
  }
});

socket.on('connect', () => {
  console.log('Connected');
});

socket.on('notification', (data) => {
  console.log('Received:', data);
});

socket.on('disconnect', () => {
  console.log('Disconnected');
});
```

### Test Connection
```javascript
socket.emit('ping', {});
```

## Swagger Documentation

Interactive API documentation available at:
```
http://localhost:3000/docs
```

Try requests directly from the Swagger UI

## Error Handling

### Invalid Token
```bash
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer invalid_token"

# Response: 401 Unauthorized
```

### Missing Token
```bash
curl -X GET http://localhost:3000/api/users/me

# Response: 401 Unauthorized
```

### Insufficient Permissions
```bash
# As regular user trying to delete another user
curl -X DELETE http://localhost:3000/api/users/{other_user_id} \
  -H "Authorization: Bearer $TOKEN"

# Response: 403 Forbidden - Insufficient permissions
```

## Token Expiry

- Access Token: 15 minutes (configurable via JWT_ACCESS_EXPIRES_IN)
- Refresh Token: 7 days (configurable via JWT_REFRESH_EXPIRES_IN)

When access token expires, use refresh endpoint with refresh token to get new tokens.

## CORS

Enabled for origins specified in CORS_ORIGINS environment variable
Default: http://localhost:3000, http://localhost:3001
