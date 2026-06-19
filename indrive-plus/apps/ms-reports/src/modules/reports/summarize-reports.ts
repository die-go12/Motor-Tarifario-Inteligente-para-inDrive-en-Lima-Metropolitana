import { AnomalySeverity } from '@app/shared';

export interface ReportQuoteSample {
  distanceKm: number;
}

export interface ReportSettlementSample {
  finalPrice: number;
}

export interface ReportAnomalySample {
  severity: AnomalySeverity;
}

export interface ReportsSummary {
  totalQuotes: number;
  completedTrips: number;
  totalRevenue: number;
  averageRevenue: number;
  averageDistanceKm: number;
  anomaliesBySeverity: Record<AnomalySeverity, number>;
}

export function summarizeReports(
  quotes: ReportQuoteSample[],
  settlements: ReportSettlementSample[],
  anomalies: ReportAnomalySample[],
): ReportsSummary {
  const totalRevenue = settlements.reduce((sum, s) => sum + s.finalPrice, 0);
  const totalDistance = quotes.reduce((sum, q) => sum + q.distanceKm, 0);
  return {
    totalQuotes: quotes.length,
    completedTrips: settlements.length,
    totalRevenue: round(totalRevenue),
    averageRevenue: round(average(totalRevenue, settlements.length)),
    averageDistanceKm: round(average(totalDistance, quotes.length)),
    anomaliesBySeverity: countBySeverity(anomalies),
  };
}

function countBySeverity(
  anomalies: ReportAnomalySample[],
): Record<AnomalySeverity, number> {
  const counts: Record<AnomalySeverity, number> = {
    [AnomalySeverity.LOW]: 0,
    [AnomalySeverity.MEDIUM]: 0,
    [AnomalySeverity.HIGH]: 0,
  };
  for (const anomaly of anomalies) {
    counts[anomaly.severity] += 1;
  }
  return counts;
}

function average(total: number, count: number): number {
  return count === 0 ? 0 : total / count;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
