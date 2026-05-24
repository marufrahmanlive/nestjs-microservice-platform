import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { AppLoggerService } from './app-logger.service';

/**
 * Structured JSON logs via pino. We keep this Global so any module can
 * @Inject(AppLoggerService) without re-importing.
 *
 * In dev (LOG_PRETTY=true) we pipe to pino-pretty for readable output;
 * in prod we emit raw JSON for shippers (CloudWatch, Loki, Datadog).
 */
@Global()
@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          level: config.get<string>('logging.level', 'info'),
          transport: config.get<boolean>('logging.pretty')
            ? { target: 'pino-pretty', options: { colorize: true, singleLine: true, translateTime: 'SYS:HH:MM:ss.l' } }
            : undefined,
          // Redact obvious secrets that should never hit logs.
          redact: {
            paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.refreshToken', '*.accessToken'],
            censor: '[REDACTED]',
          },
          customProps: (req) => ({ correlationId: (req as { correlationId?: string }).correlationId }),
          serializers: {
            req: (req) => ({ id: req.id, method: req.method, url: req.url, remoteAddress: req.remoteAddress }),
            res: (res) => ({ statusCode: res.statusCode }),
          },
        },
      }),
    }),
  ],
  providers: [AppLoggerService],
  exports: [AppLoggerService, PinoLoggerModule],
})
export class AppLoggerModule {}
