import { Module } from '@nestjs/common';
import { AuthLibModule } from '@app/auth';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [AuthLibModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
