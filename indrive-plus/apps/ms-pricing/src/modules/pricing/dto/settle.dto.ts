import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class SettleDto {
  @ApiProperty({ example: 14.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minimumPrice: number;

  @ApiProperty({ example: 19.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maximumPrice: number;

  @ApiProperty({ example: 16.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  realPrice: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  tripId?: number;

  @ApiPropertyOptional({ example: 'Miraflores - San Isidro' })
  @IsOptional()
  @IsString()
  route?: string;
}
