import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString, Length } from 'class-validator';

export class CreateTripDto {
  @ApiProperty({ example: 'Miraflores' })
  @IsString()
  @Length(1, 255)
  origin: string;

  @ApiProperty({ example: 'San Isidro' })
  @IsString()
  @Length(1, 255)
  destination: string;

  @ApiProperty({ example: 8.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  distanceKm: number;
}
