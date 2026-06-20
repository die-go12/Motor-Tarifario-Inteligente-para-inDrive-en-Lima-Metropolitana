import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PricingLog, PricingLogSchema } from './schemas/pricing-log.schema';
import { AnomalyLog, AnomalyLogSchema } from './schemas/anomaly-log.schema';
import {
  PricingHistory,
  PricingHistorySchema,
} from './schemas/pricing-history.schema';
import {
  ConfigChangeLog,
  ConfigChangeLogSchema,
} from './schemas/config-change-log.schema';
import { EventsPublisher } from './events.publisher';
import { AuditListener } from './audit.listener';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PricingLog.name, schema: PricingLogSchema },
      { name: AnomalyLog.name, schema: AnomalyLogSchema },
      { name: PricingHistory.name, schema: PricingHistorySchema },
      { name: ConfigChangeLog.name, schema: ConfigChangeLogSchema },
    ]),
  ],
  providers: [EventsPublisher, AuditListener, AuditService],
  controllers: [AuditController],
  exports: [EventsPublisher, AuditService],
})
export class AuditModule {}
