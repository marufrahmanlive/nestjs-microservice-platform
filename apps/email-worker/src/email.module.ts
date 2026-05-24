import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '@app/common/config/configuration';
import { envValidationSchema } from '@app/common/config/validation.schema';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
      validationOptions: { allowUnknown: true },
    }),
  ],
  controllers: [EmailController],
  providers: [EmailService],
})
export class EmailModule {}
