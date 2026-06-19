import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Redis from 'ioredis';
import {
  AnomalyDetectedEvent,
  PricingCalculatedEvent,
  PricingChannel,
  PricingSettledEvent,
} from '@app/shared';
import { ReportQuote } from './schemas/report-quote.schema';
import { ReportSettlement } from './schemas/report-settlement.schema';
import { ReportAnomaly } from './schemas/report-anomaly.schema';

@Injectable()
export class ReportListener implements OnModuleInit, OnModuleDestroy {
  private readonly subscriber: Redis;

  constructor(
    configService: ConfigService,
    @InjectModel(ReportQuote.name)
    private readonly quoteModel: Model<ReportQuote>,
    @InjectModel(ReportSettlement.name)
    private readonly settlementModel: Model<ReportSettlement>,
    @InjectModel(ReportAnomaly.name)
    private readonly anomalyModel: Model<ReportAnomaly>,
  ) {
    this.subscriber = new Redis({
      host: configService.getOrThrow<string>('REDIS_HOST'),
      port: configService.get<number>('REDIS_PORT', 6379),
    });
  }

  async onModuleInit(): Promise<void> {
    await this.subscriber.subscribe(
      PricingChannel.CALCULATED,
      PricingChannel.SETTLED,
      PricingChannel.ANOMALY,
    );
    this.subscriber.on('message', (channel, message) => {
      void this.persist(channel as PricingChannel, message);
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.subscriber.quit();
  }

  private async persist(
    channel: PricingChannel,
    message: string,
  ): Promise<void> {
    const payload: unknown = JSON.parse(message);
    if (channel === PricingChannel.CALCULATED) {
      await this.persistQuote(payload as PricingCalculatedEvent);
    } else if (channel === PricingChannel.SETTLED) {
      await this.persistSettlement(payload as PricingSettledEvent);
    } else if (channel === PricingChannel.ANOMALY) {
      await this.persistAnomaly(payload as AnomalyDetectedEvent);
    }
  }

  private persistQuote(event: PricingCalculatedEvent): Promise<unknown> {
    return this.quoteModel.create({
      distanceKm: event.distanceKm,
      basePrice: event.basePrice,
      minimumPrice: event.minimumPrice,
      maximumPrice: event.maximumPrice,
      generatedAt: new Date(event.generatedAt),
    });
  }

  private persistSettlement(event: PricingSettledEvent): Promise<unknown> {
    return this.settlementModel.create({
      tripId: event.tripId,
      route: event.route,
      minimumPrice: event.minimumPrice,
      maximumPrice: event.maximumPrice,
      realPrice: event.realPrice,
      finalPrice: event.finalPrice,
      settledAt: new Date(event.settledAt),
    });
  }

  private persistAnomaly(event: AnomalyDetectedEvent): Promise<unknown> {
    return this.anomalyModel.create({
      tripId: event.tripId,
      anomalyType: event.anomalyType,
      severity: event.severity,
      deviation: event.deviation,
      detectedAt: new Date(event.detectedAt),
    });
  }
}
