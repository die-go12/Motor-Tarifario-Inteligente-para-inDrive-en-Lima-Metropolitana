import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';
import { UserRole } from '@app/shared';

export class RegisterDto {
  @ApiProperty({ example: 'Juan Diego Lopez' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ example: 'juan@indrive.pe' })
  @IsEmail()
  @Length(1, 100)
  email: string;

  @ApiProperty({ example: 'Secret123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.PASSENGER })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ example: '+51987654321' })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  phone?: string;
}
