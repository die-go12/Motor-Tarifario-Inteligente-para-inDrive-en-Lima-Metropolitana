import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

const FIRST_VALID_YEAR = 2000;
const NEXT_YEAR = new Date().getFullYear() + 1;

export class CreateVehicleDto {
  @ApiProperty({ example: 'Toyota' })
  @IsString()
  @Length(1, 50)
  brand: string;

  @ApiProperty({ example: 'Yaris' })
  @IsString()
  @Length(1, 50)
  model: string;

  @ApiProperty({ example: 'ABC-123' })
  @IsString()
  @Length(1, 20)
  plate: string;

  @ApiPropertyOptional({ example: 'Plateado' })
  @IsOptional()
  @IsString()
  @Length(1, 30)
  color?: string;

  @ApiPropertyOptional({ example: 2020, minimum: FIRST_VALID_YEAR })
  @IsOptional()
  @IsInt()
  @Min(FIRST_VALID_YEAR)
  @Max(NEXT_YEAR)
  year?: number;
}
