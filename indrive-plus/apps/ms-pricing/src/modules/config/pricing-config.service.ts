import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PricingConfig } from './schemas/pricing-config.schema';
import { UpdatePricingConfigDto } from './dto/update-pricing-config.dto';

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
};

@Injectable()
export class PricingConfigService {
  constructor(
    @InjectModel(PricingConfig.name)
    private readonly configModel: Model<PricingConfig>,
  ) {}

  async getActive(): Promise<PricingConfig> {
    const existing = await this.configModel.findOne().lean();
    if (existing) {
      return existing;
    }
    return this.configModel.create(DEFAULT_CONFIG);
  }

  async update(dto: UpdatePricingConfigDto): Promise<PricingConfig> {
    await this.getActive();
    return this.configModel
      .findOneAndUpdate({}, { $set: dto }, { new: true })
      .lean() as Promise<PricingConfig>;
  }
}
