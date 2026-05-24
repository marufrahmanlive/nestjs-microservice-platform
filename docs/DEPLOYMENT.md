# Deployment Guide - Production Ready

## 🚀 Quick Start Guide

### Local Development
```bash
# Start all services with Docker Compose
docker-compose up -d

# Build all applications
npm run build:all

# Run in development mode
npm run start:dev:all

# Access points
- API Gateway: http://localhost:3000
- Swagger Docs: http://localhost:3000/api
- RabbitMQ Admin: http://localhost:15672 (guest:guest)
- MongoDB: localhost:27017 (admin:admin123)
- Redis: localhost:6379
```

## 🐳 Docker Deployment

### Build Docker Image
```bash
# Single application build
docker build -t nestjs-app:latest .

# Build with specific version
docker build -t nestjs-app:1.0.0 .

# Push to registry (AWS ECR, Docker Hub, etc.)
docker tag nestjs-app:latest your-registry.com/nestjs-app:latest
docker push your-registry.com/nestjs-app:latest
```

### Using Docker Compose (Production)
```bash
# Set environment variables
export JWT_SECRET=your-production-secret
export MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
export REDIS_PASSWORD=your-redis-password
export RABBITMQ_URI=amqp://user:pass@rabbitmq.example.com:5672

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api-gateway

# Stop all services
docker-compose down
```

## ☸️ Kubernetes Deployment

### Prerequisites
- EKS/AKS/GKE cluster
- kubectl configured
- Helm 3+

### Create Deployment Files

```yaml
# k8s/api-gateway-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: api-gateway
        image: your-registry/nestjs-app:latest
        command: ["node", "dist/apps/api-gateway/main.js"]
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: production
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: mongodb-uri
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: redis-password
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health/live
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
```

### Deploy to Kubernetes
```bash
# Create namespace
kubectl create namespace nestjs-prod

# Create secrets
kubectl create secret generic app-secrets \
  --from-literal=mongodb-uri=mongodb+srv://... \
  --from-literal=redis-password=... \
  -n nestjs-prod

# Apply deployments
kubectl apply -f k8s/ -n nestjs-prod

# Verify deployment
kubectl get pods -n nestjs-prod
kubectl logs -f deployment/api-gateway -n nestjs-prod
```

## 🖥️ EC2 / VM Deployment (PM2)

### Prerequisites
- Node.js 20+ installed
- PM2 globally: `npm install -g pm2`
- MongoDB, Redis, RabbitMQ running

### Setup

```bash
# Clone repository
git clone <your-repo> /home/ubuntu/app
cd /home/ubuntu/app

# Install dependencies
npm install --production

# Build application
npm run build:all

# Start with PM2
pm2 start ecosystem.config.js --env production

# Configure PM2 to start on reboot
pm2 startup
pm2 save

# Monitor
pm2 monit
pm2 logs

# Restart specific service
pm2 restart api-gateway
```

### PM2 Configuration
See `ecosystem.config.js` for:
- Cluster mode with CPU-based scaling
- Memory limits (512MB for gateway, 256MB for services)
- Error & output logging
- Auto-restart on crash
- Graceful shutdown handling

## 🌐 AWS Deployment (ECS)

### Create Task Definition
```json
{
  "family": "nestjs-api-gateway",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "api-gateway",
      "image": "your-ecr-uri.dkr.ecr.us-east-1.amazonaws.com/nestjs-app:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "hostPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "NODE_ENV", "value": "production"},
        {"name": "API_GATEWAY_PORT", "value": "3000"}
      ],
      "secrets": [
        {"name": "MONGODB_URI", "valueFrom": "arn:aws:secretsmanager:..."},
        {"name": "REDIS_PASSWORD", "valueFrom": "arn:aws:secretsmanager:..."}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/nestjs-app",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

### Deploy to ECS
```bash
# Update task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Update service
aws ecs update-service \
  --cluster nestjs-prod \
  --service api-gateway \
  --force-new-deployment
```

## 🛡️ Production Checklist

### Environment Configuration
- [ ] Set strong JWT_SECRET (min 32 chars)
- [ ] Configure CORS_ORIGIN for your domains
- [ ] Set THROTTLE_LIMIT appropriately (100-1000)
- [ ] Configure SMTP for email service
- [ ] Set LOG_LEVEL (info or warn)
- [ ] Enable HTTPS/TLS everywhere

### Database
- [ ] MongoDB Atlas cluster created (M30+)
- [ ] Backups enabled (daily)
- [ ] Connection string with authentication
- [ ] IP whitelist configured
- [ ] Indexes verified

### Redis
- [ ] ElastiCache or self-managed cluster
- [ ] AUTH password set (strong)
- [ ] Eviction policy: allkeys-lru
- [ ] RDB snapshots enabled
- [ ] Memory limits set

### RabbitMQ
- [ ] Cluster setup (3+ nodes recommended)
- [ ] Management plugin secured
- [ ] Queues declared with durability
- [ ] Dead letter queue configured
- [ ] Policy for message TTL

### Networking
- [ ] Firewall rules configured
- [ ] Security groups restrictive
- [ ] Load balancer health checks
- [ ] API Gateway behind CDN
- [ ] DDoS protection enabled

### Monitoring
- [ ] CloudWatch/Datadog/New Relic setup
- [ ] Alerts configured (CPU, Memory, Errors)
- [ ] Log aggregation (CloudWatch/ELK)
- [ ] Metrics collection enabled
- [ ] APM tracing setup

### Security
- [ ] SSL/TLS certificates (ACM)
- [ ] Secrets managed (AWS Secrets Manager)
- [ ] IAM roles configured
- [ ] API rate limiting enabled
- [ ] Input validation enforced
- [ ] CORS properly configured

## 📊 Performance Tuning

### Node.js
```bash
# Increase file descriptors
ulimit -n 65536

# Tune garbage collection
NODE_OPTIONS="--max-old-space-size=2048"
```

### Database Connections
```typescript
// Optimize pool size in DatabaseModule
maxPoolSize: 50,      // Per instance
minPoolSize: 5,
serverSelectionTimeoutMS: 8000,
socketTimeoutMS: 45000,
```

### Redis
```bash
# Memory optimization
maxmemory 256mb
maxmemory-policy allkeys-lru

# Append only for durability
appendonly yes
appendfsync everysec
```

### RabbitMQ
```bash
# Prefetch settings in services
prefetch: 10,  # Services
prefetch: 5,   # Workers

# Disable the cluster partition handler
queue_master_location: "min-masters"
```

## 🔄 CI/CD Pipeline (GitHub Actions)

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t app:${{ github.sha }} .
      
      - name: Push to registry
        run: |
          docker tag app:${{ github.sha }} registry/app:latest
          docker push registry/app:latest
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster prod \
            --service api-gateway \
            --force-new-deployment
```

## 🚨 Troubleshooting

### Service not starting
```bash
# Check logs
docker logs nestjs-api-gateway
kubectl logs pod/api-gateway-xxx -n nestjs-prod
pm2 logs

# Verify environment variables
docker inspect nestjs-api-gateway | grep -A 20 Env
```

### Database connection issues
```bash
# Test MongoDB
mongosh "mongodb+srv://..."

# Check network connectivity
nc -zv mongodb.example.com 27017
```

### RabbitMQ problems
```bash
# Check RabbitMQ status
docker exec nestjs-rabbitmq rabbitmqctl status

# List queues
docker exec nestjs-rabbitmq rabbitmqctl list_queues
```

### High memory usage
```bash
# Monitor memory
pm2 monit

# Check Node.js heap
node --inspect dist/apps/api-gateway/main.js
```

## 📈 Scaling Guide

### Vertical Scaling
```bash
# Increase resources per container
resources:
  limits:
    memory: "1Gi"
    cpu: "1000m"
```

### Horizontal Scaling
```bash
# Kubernetes
kubectl scale deployment api-gateway --replicas=5

# ECS
aws ecs update-service --cluster prod --service api-gateway --desired-count 5

# Auto-scaling
# Configure target tracking based on CPU (70%) or Memory (80%)
```

## 🔐 Security Hardening

### Container Security
```dockerfile
# Run as non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
USER nestjs

# Remove unnecessary packages
RUN apk del apk-tools
```

### Network Security
```yaml
# Network Policy
networkPolicies:
  - name: api-gateway
    ingress:
      - from:
        - podSelector:
            matchLabels:
              role: client
```

### Secret Management
```bash
# Use AWS Secrets Manager
aws secretsmanager create-secret \
  --name nestjs-prod-secrets \
  --secret-string file://secrets.json
```

## 📝 Rollback Strategy

```bash
# Kubernetes - Rollback to previous version
kubectl rollout undo deployment/api-gateway

# Docker - Rollback to previous image
docker pull registry/app:v1.0.0
docker run ... registry/app:v1.0.0

# PM2 - Save/restore configuration
pm2 save
pm2 resurrect
```

## 📞 Support & Monitoring

- **Health Checks**: Liveness & readiness probes every 10s
- **Metrics**: Prometheus-ready endpoints
- **Logging**: Structured JSON logs with correlation IDs
- **Alerts**: Configure based on error rates & latency
- **Status Page**: /health endpoint (public)

---

**Ready to deploy? Start with Docker Compose locally, test thoroughly, then move to your chosen cloud provider!**
