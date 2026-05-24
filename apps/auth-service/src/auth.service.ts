import { Injectable, Logger, HttpStatus, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '@app/database';
import { UserRole } from '@app/common';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: { email: string; password: string; name: string }) {
    const existing = await this.userModel.findOne({ email: dto.email });
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, this.bcryptRounds);
    const user = await this.userModel.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
      roles: [UserRole.USER],
    });

    const tokens = this._generateTokens(user);
    this.logger.log(`User registered: ${user._id}`);
    return { user: this._sanitizeUser(user), ...tokens };
  }

  async login(dto: { email: string; password: string }) {
    const user = await this.userModel.findOne({ email: dto.email }).select('+password');
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.userModel.updateOne({ _id: user._id }, { lastLoginAt: new Date() });
    const tokens = this._generateTokens(user);
    this.logger.log(`User logged in: ${user._id}`);
    return { user: this._sanitizeUser(user), ...tokens };
  }

  async logout(dto: { userId: string }) {
    this.logger.log(`User logged out: ${dto.userId}`);
    return { success: true };
  }

  async refreshToken(dto: { refreshToken: string }) {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      const user = await this.userModel.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      const tokens = this._generateTokens(user);
      return tokens;
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateToken(dto: { token: string }) {
    try {
      const payload = this.jwtService.verify(dto.token);
      return { valid: true, payload };
    } catch {
      return { valid: false, payload: null };
    }
  }

  private _generateTokens(user: UserDocument) {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.roles[0] || UserRole.USER,
    };

    const accessToken = this.jwtService.sign(
      payload as any,
      {
        secret: process.env.JWT_ACCESS_SECRET as any,
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
      } as any,
    );

    const refreshToken = this.jwtService.sign(
      payload as any,
      {
        secret: process.env.JWT_REFRESH_SECRET as any,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      } as any,
    );

    return { accessToken, refreshToken };
  }

  private _sanitizeUser(user: UserDocument) {
    const { password, ...sanitized } = user.toObject();
    return sanitized;
  }
}
