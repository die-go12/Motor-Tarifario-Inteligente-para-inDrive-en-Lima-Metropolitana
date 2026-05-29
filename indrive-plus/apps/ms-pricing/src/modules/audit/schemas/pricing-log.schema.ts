import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PricingLogDocument = HydratedDocument<PricingLog>;

@Schema({ collection: 'pricing_logs', timestamps: true })
export class PricingLog {
  @Prop({ required: true })
  distanceKm: number;

  @Prop({ required: true })
  basePrice: number;

  @Prop({ required: true })
  minimumPrice: number;

  @Prop({ required: true })
  maximumPrice: number;

  @Prop({ required: true })
  generatedAt: Date;
}

export const PricingLogSchema = SchemaFactory.createForClass(PricingLog);
