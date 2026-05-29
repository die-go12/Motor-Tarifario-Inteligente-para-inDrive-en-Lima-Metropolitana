import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class QuoteDto {
  @ApiProperty({ example: 8.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  distanceKm: number;
}
