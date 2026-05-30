import { Injectable } from '@nestjs/common';
import { TripContext } from '@app/shared';
import { MapsService } from '../maps/maps.service';
import { FuelService } from '../fuel/fuel.service';
import { TrafficService } from '../traffic/traffic.service';

const HISTORIC_RATE_PER_KM = 1.8;

@Injectable()
export class IntegrationService {
  constructor(
    private readonly mapsService: MapsService,
    private readonly fuelService: FuelService,
    private readonly trafficService: TrafficService,
  ) {}

  async buildTripContext(
    origin: string,
    destination: string,
  ): Promise<TripContext> {
    const route = this.mapsService.route(origin, destination);
    const traffic = this.trafficService.conditions();
    const fuelPricePerGallon = await this.fuelService.currentPrice();
    return {
      ...route,
      ...traffic,
      fuelPricePerGallon,
      historicAveragePrice: this.estimateHistoric(route.distanceKm),
    };
  }

  private estimateHistoric(distanceKm: number): number {
    return Math.round(distanceKm * HISTORIC_RATE_PER_KM * 100) / 100;
  }
}
