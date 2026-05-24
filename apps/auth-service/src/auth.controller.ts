import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { AUTH_PATTERNS } from '@app/common';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(AUTH_PATTERNS.REGISTER)
  async register(@Payload() dto: { email: string; password: string; name: string }) {
    return this.authService.register(dto);
  }

  @MessagePattern(AUTH_PATTERNS.LOGIN)
  async login(@Payload() dto: { email: string; password: string }) {
    return this.authService.login(dto);
  }

  @MessagePattern(AUTH_PATTERNS.LOGOUT)
  async logout(@Payload() dto: { userId: string }) {
    return this.authService.logout(dto);
  }

  @MessagePattern(AUTH_PATTERNS.REFRESH_TOKEN)
  async refreshToken(@Payload() dto: { refreshToken: string }) {
    return this.authService.refreshToken(dto);
  }

  @MessagePattern(AUTH_PATTERNS.VALIDATE_TOKEN)
  async validateToken(@Payload() dto: { token: string }) {
    return this.authService.validateToken(dto);
  }
}
