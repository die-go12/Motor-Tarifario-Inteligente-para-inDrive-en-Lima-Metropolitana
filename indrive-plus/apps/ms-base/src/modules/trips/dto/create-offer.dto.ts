import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class CreateOfferDto {
  @ApiProperty({
    example: 15.5,
    description: 'Monto ofertado (dentro del rango)',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;
}
