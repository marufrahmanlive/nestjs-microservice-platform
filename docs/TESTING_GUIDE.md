# Service Verification & Testing Guide

This guide helps you verify all services are working.

## Prerequisites

1. Docker Services (MongoDB, Redis, RabbitMQ)
```bash
docker-compose up -d
docker ps
```

2. Environment Setup
```bash
cp .env.example .env
```

## Start Services in Order

### Terminal 1: Auth Service (Port 3001)
```bash
npm run start:dev:auth-service
```

### Terminal 2: User Service (Port 3002)
```bash
npm run start:dev:user-service
```

### Terminal 3: Notification Worker (Port 3003)
```bash
npm run start:dev:notification-worker
```

### Terminal 4: API Gateway (Port 3000)
```bash
npm run start:dev:api-gateway
```

## Test Health Check
```bash
curl http://localhost:3000/api/health
```

## Test User Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "name": "Test User"
  }'
```

## Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

## Test Protected Route (requires JWT)
```bash
# Use the accessToken from login response
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Verify Services Are Running

### Check MongoDB
```bash
docker ps | grep mongodb
docker logs nestjs_mongodb
```

### Check Redis
```bash
docker ps | grep redis
docker logs nestjs_redis
```

### Check RabbitMQ
```bash
docker ps | grep rabbitmq
# Visit http://localhost:15672 (guest/guest)
docker logs nestjs_rabbitmq
```

## Swagger API Documentation
```
http://localhost:3000/docs
```

## Success Criteria

- ✓ All 4 services start without errors
- ✓ Health check returns 200 OK
- ✓ Can register a new user
- ✓ Can login and receive JWT tokens
- ✓ Can access protected endpoints with JWT
- ✓ User data is saved in MongoDB
- ✓ RabbitMQ queue exists
- ✓ No connection errors in logs

