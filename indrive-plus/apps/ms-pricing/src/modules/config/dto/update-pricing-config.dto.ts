import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class UpdatePricingConfigDto {
  @ApiPropertyOptional({
    example: 1.5,
    description: 'Costo base por kilómetro',
  })
  @IsOptional()
  @IsPositive()
  costPerKmBase?: number;

  @ApiPropertyOptional({
    example: 0.1,
    description: 'Consumo de combustible por km (galones)',
  })
  @IsOptional()
  @IsPositive()
  fuelConsumptionPerKm?: number;

  @ApiPropertyOptional({
    example: 0.25,
    description: 'Factor de ponderación del combustible',
  })
  @IsOptional()
  @IsPositive()
  fuelFactor?: number;

  @ApiPropertyOptional({
    example: 0.5,
    description: 'Costo adicional por pasajero de capacidad',
  })
  @IsOptional()
  @Min(0)
  capacityExtraCost?: number;

  @ApiPropertyOptional({
    example: 0.15,
    description: 'Peso del histórico de la zona',
  })
  @IsOptional()
  @Min(0)
  historicWeight?: number;

  @ApiPropertyOptional({
    example: 0.5,
    description: 'Peso del factor de tráfico',
  })
  @IsOptional()
  @Min(0)
  trafficWeight?: number;

  @ApiPropertyOptional({
    example: 0.3,
    description: 'Peso del factor hora/demanda',
  })
  @IsOptional()
  @Min(0)
  hourWeight?: number;

  @ApiPropertyOptional({
    example: 0.2,
    description: 'Peso del factor de tiempo estimado',
  })
  @IsOptional()
  @Min(0)
  timeWeight?: number;

  @ApiPropertyOptional({
    example: 2.0,
    description: 'Tope del multiplicador de tráfico',
  })
  @IsOptional()
  @Min(1)
  trafficMultiplierCap?: number;

  @ApiPropertyOptional({
    example: 3.0,
    description: 'Tarifa mínima absoluta (S/)',
  })
  @IsOptional()
  @IsPositive()
  minAbsoluteFare?: number;

  @ApiPropertyOptional({
    example: 150.0,
    description: 'Tarifa máxima absoluta (S/)',
  })
  @IsOptional()
  @IsPositive()
  maxAbsoluteFare?: number;

  @ApiPropertyOptional({
    example: 3.5,
    description: 'Ratio máximo permitido máximo/mínimo',
  })
  @IsOptional()
  @Min(1)
  maxRangeRatio?: number;
}
