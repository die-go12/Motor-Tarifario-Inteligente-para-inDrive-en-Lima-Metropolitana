import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ReportQuoteDocument = HydratedDocument<ReportQuote>;

@Schema({ collection: 'report_quotes', timestamps: true })
export class ReportQuote {
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

export const ReportQuoteSchema = SchemaFactory.createForClass(ReportQuote);
