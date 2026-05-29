import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class UpdatePricingConfigDto {
  @ApiPropertyOptional({ example: 3.5, description: 'Banderazo / tarifa base' })
  @IsOptional()
  @IsPositive()
  baseFare?: number;

  @ApiPropertyOptional({ example: 1.2, description: 'Precio por kilómetro' })
  @IsOptional()
  @IsPositive()
  pricePerKm?: number;

  @ApiPropertyOptional({ example: 0.85, description: 'Factor del piso (0-1)' })
  @IsOptional()
  @IsPositive()
  minimumMargin?: number;

  @ApiPropertyOptional({ example: 1.3, description: 'Factor del techo (>=1)' })
  @IsOptional()
  @Min(1)
  maximumMargin?: number;

  @ApiPropertyOptional({
    example: 2.0,
    description: 'Tope del multiplicador de tráfico',
  })
  @IsOptional()
  @Min(1)
  trafficMultiplierCap?: number;
}
