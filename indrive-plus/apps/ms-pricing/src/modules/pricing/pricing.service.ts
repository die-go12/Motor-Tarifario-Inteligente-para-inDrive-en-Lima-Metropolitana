import { Injectable, Logger } from '@nestjs/common';
import {
  AnomalySeverity,
  PriceQuote,
  PriceSettlement,
  PricingChannel,
  QuoteRequest,
  SettleRequest,
} from '@app/shared';
import { EventsPublisher } from '../audit/events.publisher';
import { PricingConfig } from '../config/schemas/pricing-config.schema';
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

  async quote(request: QuoteRequest): Promise<PriceQuote> {
    const config = await this.pricingConfigService.getActive();
    const basePrice = this.calculateBasePrice(request, config);
    const minimumPrice = Math.max(basePrice, config.minAbsoluteFare);
    const maximumPrice = this.calculateMaximumPrice(
      minimumPrice,
      request,
      config,
    );
    const quote: PriceQuote = {
      basePrice: this.round(basePrice),
      minimumPrice: this.round(minimumPrice),
      maximumPrice: this.round(maximumPrice),
    };
    this.emit(PricingChannel.CALCULATED, {
      distanceKm: request.distanceKm,
      ...quote,
      generatedAt: new Date().toISOString(),
    });
    return quote;
  }

  private calculateBasePrice(
    request: QuoteRequest,
    config: PricingConfig,
  ): number {
    const distanceCost = request.distanceKm * config.costPerKmBase;
    const fuelCost =
      request.fuelPricePerGallon *
      config.fuelConsumptionPerKm *
      request.distanceKm *
      config.fuelFactor;
    const capacityCost =
      Math.max(0, request.vehicleCapacity - 1) * config.capacityExtraCost;
    const historicCost = request.historicAveragePrice * config.historicWeight;
    return distanceCost + fuelCost + capacityCost + historicCost;
  }

  private calculateMaximumPrice(
    minimumPrice: number,
    request: QuoteRequest,
    config: PricingConfig,
  ): number {
    const dynamicFactor =
      1 +
      (request.trafficMultiplier - 1) * config.trafficWeight +
      (request.hourMultiplier - 1) * config.hourWeight +
      (request.timeMultiplier - 1) * config.timeWeight;
    const cappedFactor = Math.min(dynamicFactor, config.trafficMultiplierCap);
    const dynamicMaximum = minimumPrice * cappedFactor;
    return Math.min(
      dynamicMaximum,
      config.maxAbsoluteFare,
      minimumPrice * config.maxRangeRatio,
    );
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
