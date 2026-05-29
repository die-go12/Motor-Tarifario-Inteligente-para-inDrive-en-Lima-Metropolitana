import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PricingHistoryDocument = HydratedDocument<PricingHistory>;

@Schema({ collection: 'pricing_history', timestamps: true })
export class PricingHistory {
  @Prop()
  tripId?: number;

  @Prop()
  route?: string;

  @Prop({ required: true })
  minimumPrice: number;

  @Prop({ required: true })
  maximumPrice: number;

  @Prop({ required: true })
  realPrice: number;

  @Prop({ required: true })
  finalPrice: number;

  @Prop({ required: true })
  timestamp: Date;
}

export const PricingHistorySchema =
  SchemaFactory.createForClass(PricingHistory);
