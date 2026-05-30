export interface RouteInfo {
  distanceKm: number;
  durationMin: number;
  polyline: string;
}

export interface TrafficConditions {
  trafficMultiplier: number;
  hourMultiplier: number;
  timeMultiplier: number;
}

export interface TripContext {
  distanceKm: number;
  durationMin: number;
  polyline: string;
  fuelPricePerGallon: number;
  trafficMultiplier: number;
  hourMultiplier: number;
  timeMultiplier: number;
  historicAveragePrice: number;
}
