export interface QuoteRequest {
  distanceKm: number;
  fuelPricePerGallon: number;
  vehicleCapacity: number;
  trafficMultiplier: number;
  hourMultiplier: number;
  timeMultiplier: number;
  historicAveragePrice: number;
}

export interface PriceQuote {
  basePrice: number;
  minimumPrice: number;
  maximumPrice: number;
}

export interface SettleRequest {
  minimumPrice: number;
  maximumPrice: number;
  realPrice: number;
  tripId?: number;
  route?: string;
}

export interface PriceSettlement {
  finalPrice: number;
}
