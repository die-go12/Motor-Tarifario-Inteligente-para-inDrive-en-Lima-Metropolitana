import { Injectable } from '@nestjs/common';
import { RouteInfo } from '@app/shared';

const MIN_STUB_DISTANCE_KM = 2;
const STUB_DISTANCE_RANGE_KM = 23;
const AVERAGE_CITY_SPEED_KMH = 20;
const STUB_POLYLINE = 'kzlcA~bvfNstub_polyline_lima';

@Injectable()
export class MapsService {
  route(origin: string, destination: string): RouteInfo {
    const distanceKm = this.deterministicDistance(origin, destination);
    const durationMin = this.round((distanceKm / AVERAGE_CITY_SPEED_KMH) * 60);
    return { distanceKm, durationMin, polyline: STUB_POLYLINE };
  }

  private deterministicDistance(origin: string, destination: string): number {
    const seed = this.hash(`${origin}->${destination}`);
    const fraction = (seed % (STUB_DISTANCE_RANGE_KM * 100)) / 100;
    return this.round(MIN_STUB_DISTANCE_KM + fraction);
  }

  private hash(value: string): number {
    let result = 0;
    for (let index = 0; index < value.length; index += 1) {
      result = (result * 31 + value.charCodeAt(index)) % 1000000007;
    }
    return result;
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
