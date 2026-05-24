import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshDto {
  @ApiProperty({ description: 'Refresh token (when not sent via httpOnly cookie)' })
  @IsString()
  refreshToken!: string;
}
