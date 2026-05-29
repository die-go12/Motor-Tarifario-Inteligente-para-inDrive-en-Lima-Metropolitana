import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PricingLog, PricingLogSchema } from './schemas/pricing-log.schema';
import { AnomalyLog, AnomalyLogSchema } from './schemas/anomaly-log.schema';
import {
  PricingHistory,
  PricingHistorySchema,
} from './schemas/pricing-history.schema';
import { EventsPublisher } from './events.publisher';
import { AuditListener } from './audit.listener';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PricingLog.name, schema: PricingLogSchema },
      { name: AnomalyLog.name, schema: AnomalyLogSchema },
      { name: PricingHistory.name, schema: PricingHistorySchema },
    ]),
  ],
  providers: [EventsPublisher, AuditListener],
  exports: [EventsPublisher],
})
export class AuditModule {}
