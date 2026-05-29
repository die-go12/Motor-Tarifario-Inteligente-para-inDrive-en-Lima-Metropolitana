import { Injectable, Logger } from '@nestjs/common';
import {
  AnomalySeverity,
  PriceQuote,
  PriceSettlement,
  PricingChannel,
  SettleRequest,
} from '@app/shared';
import { EventsPublisher } from '../audit/events.publisher';
import { PricingConfigService } from '../config/pricing-config.service';

const ANOMALY_HIGH_DEVIATION = 0.5;
const ANOMALY_MEDIUM_DEVIATION = 0.2;

@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name);

  constructor(
    private readonly eventsPublisher: EventsPublisher,
    private readonly pricingConfigService: PricingConfigService,
  ) {}

  async quote(distanceKm: number): Promise<PriceQuote> {
    const config = await this.pricingConfigService.getActive();
    const basePrice = this.round(
      config.baseFare + config.pricePerKm * distanceKm,
    );
    const quote: PriceQuote = {
      basePrice,
      minimumPrice: this.round(basePrice * config.minimumMargin),
      maximumPrice: this.round(basePrice * config.maximumMargin),
    };
    this.emit(PricingChannel.CALCULATED, {
      distanceKm,
      ...quote,
      generatedAt: new Date().toISOString(),
    });
    return quote;
  }

  settle(request: SettleRequest): PriceSettlement {
    const { minimumPrice, maximumPrice, realPrice } = request;
    const finalPrice = this.round(
      Math.max(minimumPrice, Math.min(realPrice, maximumPrice)),
    );
    this.emit(PricingChannel.SETTLED, {
      tripId: request.tripId,
      route: request.route,
      minimumPrice,
      maximumPrice,
      realPrice,
      finalPrice,
      settledAt: new Date().toISOString(),
    });
    this.detectAnomaly(request);
    return { finalPrice };
  }

  private detectAnomaly(request: SettleRequest): void {
    const { minimumPrice, maximumPrice, realPrice, tripId } = request;
    const deviation = this.outOfRangeDeviation(
      minimumPrice,
      maximumPrice,
      realPrice,
    );
    if (deviation === 0) {
      return;
    }
    this.emit(PricingChannel.ANOMALY, {
      tripId,
      anomalyType: 'PRICE_OUTLIER',
      severity: this.severityFor(deviation),
      detectedAt: new Date().toISOString(),
    });
  }

  private outOfRangeDeviation(
    minimumPrice: number,
    maximumPrice: number,
    realPrice: number,
  ): number {
    if (realPrice > maximumPrice) {
      return (realPrice - maximumPrice) / maximumPrice;
    }
    if (realPrice < minimumPrice) {
      return (minimumPrice - realPrice) / minimumPrice;
    }
    return 0;
  }

  private severityFor(deviation: number): AnomalySeverity {
    if (deviation >= ANOMALY_HIGH_DEVIATION) {
      return AnomalySeverity.HIGH;
    }
    if (deviation >= ANOMALY_MEDIUM_DEVIATION) {
      return AnomalySeverity.MEDIUM;
    }
    return AnomalySeverity.LOW;
  }

  private emit(channel: PricingChannel, payload: unknown): void {
    this.eventsPublisher.publish(channel, payload).catch((error) => {
      this.logger.warn(`No se pudo publicar el evento ${channel}: ${error}`);
    });
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
