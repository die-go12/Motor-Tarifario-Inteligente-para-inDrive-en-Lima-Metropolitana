import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ReportQuote } from './schemas/report-quote.schema';
import { ReportSettlement } from './schemas/report-settlement.schema';
import { ReportAnomaly } from './schemas/report-anomaly.schema';
import { ReportsSummary, summarizeReports } from './summarize-reports';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(ReportQuote.name)
    private readonly quoteModel: Model<ReportQuote>,
    @InjectModel(ReportSettlement.name)
    private readonly settlementModel: Model<ReportSettlement>,
    @InjectModel(ReportAnomaly.name)
    private readonly anomalyModel: Model<ReportAnomaly>,
  ) {}

  async summarize(): Promise<ReportsSummary> {
    const [quotes, settlements, anomalies] = await Promise.all([
      this.quoteModel.find().select('distanceKm').lean().exec(),
      this.settlementModel.find().select('finalPrice').lean().exec(),
      this.anomalyModel.find().select('severity').lean().exec(),
    ]);
    return summarizeReports(quotes, settlements, anomalies);
  }
}
