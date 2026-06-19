import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { AnomalyLog } from './schemas/anomaly-log.schema';
import { FindAnomaliesDto } from './dto/find-anomalies.dto';

@Injectable()
export class AnomaliesService {
  constructor(
    @InjectModel(AnomalyLog.name)
    private readonly anomalyLogModel: Model<AnomalyLog>,
  ) {}

  find(query: FindAnomaliesDto): Promise<AnomalyLog[]> {
    return this.anomalyLogModel
      .find(this.buildFilter(query))
      .sort({ detectedAt: -1 })
      .limit(query.limit)
      .lean()
      .exec();
  }

  private buildFilter(query: FindAnomaliesDto): FilterQuery<AnomalyLog> {
    const filter: FilterQuery<AnomalyLog> = {};
    if (query.severity) {
      filter.severity = query.severity;
    }
    if (query.tripId !== undefined) {
      filter.tripId = query.tripId;
    }
    return filter;
  }
}
