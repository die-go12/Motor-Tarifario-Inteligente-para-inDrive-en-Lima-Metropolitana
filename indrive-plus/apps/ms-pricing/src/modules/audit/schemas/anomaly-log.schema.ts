import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AnomalySeverity } from '@app/shared';

export type AnomalyLogDocument = HydratedDocument<AnomalyLog>;

@Schema({ collection: 'anomaly_logs', timestamps: true })
export class AnomalyLog {
  @Prop()
  tripId?: number;

  @Prop({ required: true })
  anomalyType: string;

  @Prop({ type: String, required: true, enum: AnomalySeverity })
  severity: AnomalySeverity;

  @Prop()
  realPrice?: number;

  @Prop()
  minimumPrice?: number;

  @Prop()
  maximumPrice?: number;

  @Prop()
  deviation?: number;

  @Prop({ required: true })
  detectedAt: Date;
}

export const AnomalyLogSchema = SchemaFactory.createForClass(AnomalyLog);
