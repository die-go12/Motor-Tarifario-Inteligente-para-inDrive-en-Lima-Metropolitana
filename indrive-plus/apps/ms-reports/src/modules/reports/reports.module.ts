import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportQuote, ReportQuoteSchema } from './schemas/report-quote.schema';
import {
  ReportSettlement,
  ReportSettlementSchema,
} from './schemas/report-settlement.schema';
import {
  ReportAnomaly,
  ReportAnomalySchema,
} from './schemas/report-anomaly.schema';
import { ReportListener } from './report.listener';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReportQuote.name, schema: ReportQuoteSchema },
      { name: ReportSettlement.name, schema: ReportSettlementSchema },
      { name: ReportAnomaly.name, schema: ReportAnomalySchema },
    ]),
    AuthModule,
  ],
  controllers: [ReportsController],
  providers: [ReportListener, ReportsService],
})
export class ReportsModule {}
