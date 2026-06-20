import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PricingConfigDocument = HydratedDocument<PricingConfig>;

@Schema({ collection: 'pricing_config', timestamps: true })
export class PricingConfig {
  @Prop({ required: true })
  costPerKmBase: number;

  @Prop({ required: true })
  fuelConsumptionPerKm: number;

  @Prop({ required: true })
  fuelFactor: number;

  @Prop({ required: true })
  capacityExtraCost: number;

  @Prop({ required: true })
  historicWeight: number;

  @Prop({ required: true })
  trafficWeight: number;

  @Prop({ required: true })
  hourWeight: number;

  @Prop({ required: true })
  timeWeight: number;

  @Prop({ required: true })
  trafficMultiplierCap: number;

  @Prop({ required: true })
  minAbsoluteFare: number;

  @Prop({ required: true })
  maxAbsoluteFare: number;

  @Prop({ required: true })
  maxRangeRatio: number;

  @Prop({ required: true })
  minRangeRatio: number;

  @Prop({ required: true })
  anomalyMediumDeviation: number;

  @Prop({ required: true })
  anomalyHighDeviation: number;
}

export const PricingConfigSchema = SchemaFactory.createForClass(PricingConfig);
