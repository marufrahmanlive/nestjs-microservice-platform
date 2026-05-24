import * as Joi from 'joi';

/**
 * Fail-fast env validation. Process won't start if a required var is missing —
 * better to crash at boot than 500 in prod when a downstream client is created.
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'staging', 'production', 'test').default('development'),

  GATEWAY_HTTP_PORT: Joi.number().default(3000),
  GATEWAY_GLOBAL_PREFIX: Joi.string().default('api'),
  GATEWAY_API_VERSION: Joi.string().default('1'),
  CORS_ORIGINS: Joi.string().allow('').default(''),

  THROTTLE_TTL: Joi.number().default(60),
  THROTTLE_LIMIT: Joi.number().default(120),

  AUTH_SERVICE_HOST: Joi.string().default('localhost'),
  AUTH_SERVICE_PORT: Joi.number().default(4001),
  USER_SERVICE_HOST: Joi.string().default('localhost'),
  USER_SERVICE_PORT: Joi.number().default(4002),

  JWT_ACCESS_SECRET: Joi.string().min(16).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  MONGO_URI: Joi.string().required(),
  MONGO_DB_NAME: Joi.string().default('enterprise_app'),

  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  REDIS_DB: Joi.number().default(0),
  REDIS_KEY_PREFIX: Joi.string().default('app:'),
  REDIS_DEFAULT_TTL: Joi.number().default(300),

  RABBITMQ_URI: Joi.string().required(),
  RABBITMQ_EXCHANGE: Joi.string().default('app.events'),
  RABBITMQ_NOTIFICATION_QUEUE: Joi.string().default('notification.queue'),
  RABBITMQ_EMAIL_QUEUE: Joi.string().default('email.queue'),
  RABBITMQ_DLX: Joi.string().default('app.dlx'),
  RABBITMQ_DLQ: Joi.string().default('app.dlq'),
  RABBITMQ_RETRY_DELAY_MS: Joi.number().default(10000),
  RABBITMQ_MAX_RETRIES: Joi.number().default(5),
  RABBITMQ_PREFETCH: Joi.number().default(20),

  LOG_LEVEL: Joi.string().valid('fatal', 'error', 'warn', 'info', 'debug', 'trace').default('info'),
  LOG_PRETTY: Joi.boolean().default(false),

  BCRYPT_SALT_ROUNDS: Joi.number().min(10).max(15).default(12),
  COOKIE_SECRET: Joi.string().min(16).required(),

  SMTP_HOST: Joi.string().optional(),
  SMTP_PORT: Joi.number().optional(),
  SMTP_USER: Joi.string().allow('').optional(),
  SMTP_PASS: Joi.string().allow('').optional(),
  SMTP_FROM: Joi.string().optional(),
});
