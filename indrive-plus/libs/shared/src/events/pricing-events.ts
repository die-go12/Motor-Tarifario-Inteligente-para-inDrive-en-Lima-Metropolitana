export enum PricingChannel {
  CALCULATED = 'pricing.calculated',
  SETTLED = 'pricing.settled',
  ANOMALY = 'anomaly.detected',
}

export enum AnomalySeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface PricingCalculatedEvent {
  distanceKm: number;
  basePrice: number;
  minimumPrice: number;
  maximumPrice: number;
  generatedAt: string;
}

export interface PricingSettledEvent {
  tripId?: number;
  route?: string;
  minimumPrice: number;
  maximumPrice: number;
  realPrice: number;
  finalPrice: number;
  settledAt: string;
}

export interface AnomalyDetectedEvent {
  tripId?: number;
  anomalyType: string;
  severity: AnomalySeverity;
  realPrice: number;
  minimumPrice: number;
  maximumPrice: number;
  deviation: number;
  detectedAt: string;
}
