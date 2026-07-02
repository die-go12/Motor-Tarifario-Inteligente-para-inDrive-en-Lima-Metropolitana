import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthenticatedUser } from '@app/shared';
import { PricingConfig } from './schemas/pricing-config.schema';
import { UpdatePricingConfigDto } from './dto/update-pricing-config.dto';
import { AuditService } from '../audit/audit.service';

const DEFAULT_CONFIG: PricingConfig = {
  costPerKmBase: 1.5,
  fuelConsumptionPerKm: 0.1,
  fuelFactor: 0.25,
  capacityExtraCost: 0.5,
  historicWeight: 0.15,
  trafficWeight: 0.5,
  hourWeight: 0.3,
  timeWeight: 0.2,
  trafficMultiplierCap: 2.0,
  minAbsoluteFare: 3.0,
  maxAbsoluteFare: 150.0,
  maxRangeRatio: 3.5,
  minRangeRatio: 1.2,
  anomalyMediumDeviation: 0.2,
  anomalyHighDeviation: 0.5,
};

@Injectable()
export class PricingConfigService {
  constructor(
    @InjectModel(PricingConfig.name)
    private readonly configModel: Model<PricingConfig>,
    private readonly auditService: AuditService,
  ) {}

  async getActive(): Promise<PricingConfig> {
    const existing = await this.configModel.findOne().lean();
    if (existing) {
      return this.mergeWithDefaults(existing);
    }
    return this.configModel.create(DEFAULT_CONFIG);
  }

  async update(
    dto: UpdatePricingConfigDto,
    admin?: AuthenticatedUser,
  ): Promise<PricingConfig> {
    const current = await this.getActive();
    const payload = dto as Record<string, unknown>;
    const oldValues: Record<string, unknown> = {};
    const newValues: Record<string, unknown> = {};

    Object.keys(payload).forEach((key) => {
      if (payload[key] !== undefined) {
        oldValues[key] = (current as unknown as Record<string, unknown>)[key];
        newValues[key] = payload[key];
      }
    });

    const effective = { ...current, ...newValues } as PricingConfig;
    this.assertCoherentConfig(effective);

    await this.configModel.findOneAndUpdate({}, { $set: dto }, { new: true });

    if (admin) {
      await this.auditService.logConfigChange(admin, oldValues, newValues);
    }

    return effective;
  }

  private mergeWithDefaults(existing: Partial<PricingConfig>): PricingConfig {
    const merged = { ...DEFAULT_CONFIG };
    (Object.keys(DEFAULT_CONFIG) as (keyof PricingConfig)[]).forEach((key) => {
      const value = existing[key];
      if (typeof value === 'number' && Number.isFinite(value)) {
        merged[key] = value;
      }
    });
    return merged;
  }

  private assertCoherentConfig(config: PricingConfig): void {
    if (config.minAbsoluteFare > config.maxAbsoluteFare) {
      throw new BadRequestException(
        'La tarifa mínima absoluta no puede superar a la máxima',
      );
    }
    if (config.minRangeRatio > config.maxRangeRatio) {
      throw new BadRequestException(
        'El ratio mínimo no puede superar al ratio máximo',
      );
    }
    if (config.anomalyMediumDeviation > config.anomalyHighDeviation) {
      throw new BadRequestException(
        'El umbral de anomalía media no puede superar al umbral alto',
      );
    }
  }
}
