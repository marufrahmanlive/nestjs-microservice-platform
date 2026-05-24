import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError } from 'rxjs';
import { AUTH_SERVICE_TOKEN, AUTH_PATTERNS } from '@app/common';

@Injectable()
export class AuthService {
  constructor(@Inject(AUTH_SERVICE_TOKEN) private authClient: ClientProxy) {}

  async register(dto: { email: string; password: string; name: string }) {
    try {
      const result = await firstValueFrom(
        this.authClient.send(AUTH_PATTERNS.REGISTER, dto).pipe(
          timeout(5000),
          catchError((err) => {
            throw new HttpException(
              err.message || 'Auth service error',
              err.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );
      return result;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException('Registration failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async login(dto: { email: string; password: string }) {
    try {
      const result = await firstValueFrom(
        this.authClient.send(AUTH_PATTERNS.LOGIN, dto).pipe(
          timeout(5000),
          catchError((err) => {
            throw new HttpException(
              err.message || 'Auth service error',
              err.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );
      return result;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException('Login failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async logout(userId: string) {
    try {
      const result = await firstValueFrom(
        this.authClient.send(AUTH_PATTERNS.LOGOUT, { userId }).pipe(
          timeout(5000),
          catchError((err) => {
            throw new HttpException(
              err.message || 'Auth service error',
              err.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );
      return result;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException('Logout failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async refresh(dto: { refreshToken: string }) {
    try {
      const result = await firstValueFrom(
        this.authClient.send(AUTH_PATTERNS.REFRESH_TOKEN, dto).pipe(
          timeout(5000),
          catchError((err) => {
            throw new HttpException(
              err.message || 'Auth service error',
              err.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
      );
      return result;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException('Token refresh failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
