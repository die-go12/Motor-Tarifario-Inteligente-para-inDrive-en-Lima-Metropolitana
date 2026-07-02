import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  Max,
  Min,
} from 'class-validator';
import { AnomalySeverity } from '@app/shared';

export const DEFAULT_ANOMALY_LIMIT = 50;
export const MAX_ANOMALY_LIMIT = 200;

export class FindAnomaliesDto {
  @ApiPropertyOptional({ enum: AnomalySeverity })
  @IsOptional()
  @IsEnum(AnomalySeverity)
  severity?: AnomalySeverity;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  tripId?: number;

  @ApiPropertyOptional({
    default: DEFAULT_ANOMALY_LIMIT,
    maximum: MAX_ANOMALY_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_ANOMALY_LIMIT)
  limit: number = DEFAULT_ANOMALY_LIMIT;
}
