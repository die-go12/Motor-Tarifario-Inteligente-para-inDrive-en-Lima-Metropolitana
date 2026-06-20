import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ReportSettlementDocument = HydratedDocument<ReportSettlement>;

@Schema({ collection: 'report_settlements', timestamps: true })
export class ReportSettlement {
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
  settledAt: Date;
}

export const ReportSettlementSchema =
  SchemaFactory.createForClass(ReportSettlement);
