import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { TokenService } from '@app/auth/token.service';
import { HashUtil } from '@app/common/utils/hash.util';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dtos';
import { UserRole } from '@app/constants';

@Injectable()
export class AuthService {
  constructor(private readonly tokenService: TokenService) {}

  async register(dto: RegisterDto) {
    // TODO: Call user-service microservice to create user
    // For now, just return a mock response
    const hashedPassword = await HashUtil.hashPassword(dto.password);

    return {
      id: 'mock-user-id',
      email: dto.email,
      name: dto.name,
      createdAt: new Date(),
    };
  }

  async login(dto: LoginDto) {
    // TODO: Call user-service microservice to validate credentials
    const user = {
      id: 'mock-user-id',
      email: dto.email,
      roles: ['user'],
    };

    const tokens = await this.tokenService.issueTokenPair({
      sub: user.id,
      email: user.email,
      role: UserRole.USER,
    });

    return {
      user,
      ...tokens,
    };
  }

  async refresh(dto: RefreshTokenDto) {
    try {
      const payload = await this.tokenService.verifyRefresh(dto.refreshToken);

      const tokens = await this.tokenService.issueTokenPair({
        sub: payload.sub,
        email: payload.email,
        role: payload.role as UserRole,
      });

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
