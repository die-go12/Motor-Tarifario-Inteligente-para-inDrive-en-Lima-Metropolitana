import { UserRole } from '@app/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Admin Demo' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ example: 'admin.demo@indrive.pe' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Secret123' })
  @IsString()
  @Length(6, 255)
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
