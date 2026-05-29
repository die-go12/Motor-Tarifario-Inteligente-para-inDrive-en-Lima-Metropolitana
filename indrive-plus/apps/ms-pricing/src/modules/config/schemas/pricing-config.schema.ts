import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PricingConfigDocument = HydratedDocument<PricingConfig>;

@Schema({ collection: 'pricing_config', timestamps: true })
export class PricingConfig {
  @Prop({ required: true })
  baseFare: number;

  @Prop({ required: true })
  pricePerKm: number;

  @Prop({ required: true })
  minimumMargin: number;

  @Prop({ required: true })
  maximumMargin: number;

  @Prop({ required: true })
  trafficMultiplierCap: number;
}

export const PricingConfigSchema = SchemaFactory.createForClass(PricingConfig);
