/**
 * Centralized typed configuration factory. Every service imports this through
 * ConfigModule.forRoot({ load: [configuration] }) so we have one source of truth
 * for env-driven values.
 */
const configurationFactory = () => ({
  env: process.env.NODE_ENV || 'development',

  gateway: {
    port: parseInt(process.env.GATEWAY_HTTP_PORT || '3000', 10),
    globalPrefix: process.env.GATEWAY_GLOBAL_PREFIX || 'api',
    apiVersion: process.env.GATEWAY_API_VERSION || '1',
    corsOrigins: (process.env.CORS_ORIGINS || '').split(',').filter(Boolean),
  },

  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '120', 10),
  },

  services: {
    auth: {
      host: process.env.AUTH_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.AUTH_SERVICE_PORT || '4001', 10),
    },
    user: {
      host: process.env.USER_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.USER_SERVICE_PORT || '4002', 10),
    },
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'change-me',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-me-too',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/enterprise_app',
    dbName: process.env.MONGO_DB_NAME || 'enterprise_app',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'app:',
    defaultTtl: parseInt(process.env.REDIS_DEFAULT_TTL || '300', 10),
  },

  rabbitmq: {
    uri: process.env.RABBITMQ_URI || 'amqp://guest:guest@localhost:5672',
    exchange: process.env.RABBITMQ_EXCHANGE || 'app.events',
    notificationQueue: process.env.RABBITMQ_NOTIFICATION_QUEUE || 'notification.queue',
    emailQueue: process.env.RABBITMQ_EMAIL_QUEUE || 'email.queue',
    dlx: process.env.RABBITMQ_DLX || 'app.dlx',
    dlq: process.env.RABBITMQ_DLQ || 'app.dlq',
    retryDelayMs: parseInt(process.env.RABBITMQ_RETRY_DELAY_MS || '10000', 10),
    maxRetries: parseInt(process.env.RABBITMQ_MAX_RETRIES || '5', 10),
    prefetch: parseInt(process.env.RABBITMQ_PREFETCH || '20', 10),
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    pretty: process.env.LOG_PRETTY === 'true',
  },

  security: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
    cookieSecret: process.env.COOKIE_SECRET || 'change-me',
  },

  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM,
  },
});

export default configurationFactory;
export type AppConfig = ReturnType<typeof configurationFactory>;
