import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class CompleteTripDto {
  @ApiProperty({ example: 16.5, description: 'Precio real calculado por GPS' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  realPrice: number;
}
