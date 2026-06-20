import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsPositive, Min } from 'class-validator';

export class QuoteDto {
  @ApiProperty({ example: 8.5, description: 'Distancia del trayecto (km)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  distanceKm: number;

  @ApiProperty({
    example: 16.5,
    description: 'Precio del combustible por galón',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  fuelPricePerGallon: number;

  @ApiProperty({
    example: 4,
    description: 'Capacidad de pasajeros del vehículo',
  })
  @IsInt()
  @Min(1)
  vehicleCapacity: number;

  @ApiProperty({ example: 1.4, description: 'Multiplicador de tráfico (>=1)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  trafficMultiplier: number;

  @ApiProperty({
    example: 1.2,
    description: 'Multiplicador de hora/demanda (>=1)',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  hourMultiplier: number;

  @ApiProperty({
    example: 1.1,
    description: 'Multiplicador de tiempo estimado (>=1)',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  timeMultiplier: number;

  @ApiProperty({
    example: 15.0,
    description: 'Precio histórico promedio de la zona',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  historicAveragePrice: number;
}
