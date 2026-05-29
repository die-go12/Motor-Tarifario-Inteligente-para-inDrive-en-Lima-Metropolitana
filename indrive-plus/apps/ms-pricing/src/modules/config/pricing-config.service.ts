import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PricingConfig } from './schemas/pricing-config.schema';
import { UpdatePricingConfigDto } from './dto/update-pricing-config.dto';

const DEFAULT_CONFIG: PricingConfig = {
  baseFare: 3.5,
  pricePerKm: 1.2,
  minimumMargin: 0.85,
  maximumMargin: 1.3,
  trafficMultiplierCap: 2.0,
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
