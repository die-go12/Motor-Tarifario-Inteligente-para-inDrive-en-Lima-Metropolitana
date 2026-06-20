import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TripContext } from '@app/shared';
import { CircuitBreaker } from '../common/circuit-breaker';

const REQUEST_TIMEOUT_MS = 3000;
const FAILURE_THRESHOLD = 3;
const COOLDOWN_MS = 15000;

const FALLBACK_DISTANCE_KM = 5;
const FALLBACK_DURATION_MIN = 15;
const FALLBACK_FUEL_PRICE = 16.5;
const NEUTRAL_MULTIPLIER = 1;

@Injectable()
export class IntegrationClient {
  private readonly logger = new Logger(IntegrationClient.name);
  private readonly breaker = new CircuitBreaker(FAILURE_THRESHOLD, COOLDOWN_MS);

  constructor(private readonly configService: ConfigService) {}

  getTripContext(origin: string, destination: string): Promise<TripContext> {
    return this.breaker.execute(
      () => this.fetchTripContext(origin, destination),
      () => this.degradedTripContext(),
    );
  }

  private async fetchTripContext(
    origin: string,
    destination: string,
  ): Promise<TripContext> {
    const baseUrl = this.configService.getOrThrow<string>('MS_INTEGRATION_URL');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(`${baseUrl}/integration/trip-context`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination }),
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(`Integración respondió ${response.status}`);
      }
      return (await response.json()) as TripContext;
    } finally {
      clearTimeout(timeout);
    }
  }

  private degradedTripContext(): TripContext {
    this.logger.warn(
      'Servicio de integración no disponible; usando contexto degradado',
    );
    return {
      distanceKm: FALLBACK_DISTANCE_KM,
      durationMin: FALLBACK_DURATION_MIN,
      polyline: '',
      fuelPricePerGallon: FALLBACK_FUEL_PRICE,
      trafficMultiplier: NEUTRAL_MULTIPLIER,
      hourMultiplier: NEUTRAL_MULTIPLIER,
      timeMultiplier: NEUTRAL_MULTIPLIER,
      historicAveragePrice: 0,
    };
  }
}
