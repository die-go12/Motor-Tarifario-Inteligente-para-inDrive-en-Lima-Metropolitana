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
import { AnomaliesService } from './anomalies.service';
import { AnomaliesController } from './anomalies.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PricingLog.name, schema: PricingLogSchema },
      { name: AnomalyLog.name, schema: AnomalyLogSchema },
      { name: PricingHistory.name, schema: PricingHistorySchema },
    ]),
    AuthModule,
  ],
  controllers: [AnomaliesController],
  providers: [EventsPublisher, AuditListener, AnomaliesService],
  exports: [EventsPublisher],
})
export class AuditModule {}
