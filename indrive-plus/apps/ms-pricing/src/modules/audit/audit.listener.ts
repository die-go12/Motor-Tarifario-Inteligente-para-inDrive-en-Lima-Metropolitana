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
import { PricingLog } from './schemas/pricing-log.schema';
import { AnomalyLog } from './schemas/anomaly-log.schema';
import { PricingHistory } from './schemas/pricing-history.schema';

@Injectable()
export class AuditListener implements OnModuleInit, OnModuleDestroy {
  private readonly subscriber: Redis;

  constructor(
    configService: ConfigService,
    @InjectModel(PricingLog.name)
    private readonly pricingLogModel: Model<PricingLog>,
    @InjectModel(AnomalyLog.name)
    private readonly anomalyLogModel: Model<AnomalyLog>,
    @InjectModel(PricingHistory.name)
    private readonly pricingHistoryModel: Model<PricingHistory>,
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
      await this.persistCalculated(payload as PricingCalculatedEvent);
    } else if (channel === PricingChannel.SETTLED) {
      await this.persistSettled(payload as PricingSettledEvent);
    } else if (channel === PricingChannel.ANOMALY) {
      await this.persistAnomaly(payload as AnomalyDetectedEvent);
    }
  }

  private persistCalculated(event: PricingCalculatedEvent): Promise<unknown> {
    return this.pricingLogModel.create({
      distanceKm: event.distanceKm,
      basePrice: event.basePrice,
      minimumPrice: event.minimumPrice,
      maximumPrice: event.maximumPrice,
      generatedAt: new Date(event.generatedAt),
    });
  }

  private persistSettled(event: PricingSettledEvent): Promise<unknown> {
    return this.pricingHistoryModel.create({
      tripId: event.tripId,
      route: event.route,
      minimumPrice: event.minimumPrice,
      maximumPrice: event.maximumPrice,
      realPrice: event.realPrice,
      finalPrice: event.finalPrice,
      timestamp: new Date(event.settledAt),
    });
  }

  private persistAnomaly(event: AnomalyDetectedEvent): Promise<unknown> {
    return this.anomalyLogModel.create({
      tripId: event.tripId,
      anomalyType: event.anomalyType,
      severity: event.severity,
      detectedAt: new Date(event.detectedAt),
    });
  }
}
