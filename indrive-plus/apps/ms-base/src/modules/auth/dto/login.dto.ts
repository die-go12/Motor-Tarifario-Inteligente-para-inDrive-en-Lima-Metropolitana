import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'juan@indrive.pe' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Secret123' })
  @IsString()
  password: string;
}
