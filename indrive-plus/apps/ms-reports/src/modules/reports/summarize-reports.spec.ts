import { AnomalySeverity } from '@app/shared';
import { summarizeReports } from './summarize-reports';

describe('summarizeReports', () => {
  it('agrega demanda, ingresos, distancia y anomalías por severidad', () => {
    const summary = summarizeReports(
      [{ distanceKm: 10 }, { distanceKm: 20 }],
      [{ finalPrice: 15 }, { finalPrice: 25 }, { finalPrice: 20 }],
      [
        { severity: AnomalySeverity.LOW },
        { severity: AnomalySeverity.HIGH },
        { severity: AnomalySeverity.HIGH },
      ],
    );
    expect(summary).toEqual({
      totalQuotes: 2,
      completedTrips: 3,
      totalRevenue: 60,
      averageRevenue: 20,
      averageDistanceKm: 15,
      anomaliesBySeverity: { LOW: 1, MEDIUM: 0, HIGH: 2 },
    });
  });

  it('no divide por cero cuando no hay datos', () => {
    const summary = summarizeReports([], [], []);
    expect(summary).toEqual({
      totalQuotes: 0,
      completedTrips: 0,
      totalRevenue: 0,
      averageRevenue: 0,
      averageDistanceKm: 0,
      anomaliesBySeverity: { LOW: 0, MEDIUM: 0, HIGH: 0 },
    });
  });
});
