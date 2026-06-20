import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AnomalySeverity } from '@app/shared';

export type ReportAnomalyDocument = HydratedDocument<ReportAnomaly>;

@Schema({ collection: 'report_anomalies', timestamps: true })
export class ReportAnomaly {
  @Prop()
  tripId?: number;

  @Prop({ required: true })
  anomalyType: string;

  @Prop({ type: String, required: true, enum: AnomalySeverity })
  severity: AnomalySeverity;

  @Prop()
  deviation?: number;

  @Prop({ required: true })
  detectedAt: Date;
}

export const ReportAnomalySchema = SchemaFactory.createForClass(ReportAnomaly);
