import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@app/constants';

export class AuthUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: UserRole })
  role!: UserRole;
}

export class AuthTokensDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty()
  accessTokenExpiresIn!: string;

  @ApiProperty()
  refreshTokenExpiresIn!: string;
}

export class AuthResponseDto {
  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;

  @ApiProperty({ type: AuthTokensDto })
  tokens!: AuthTokensDto;
}
