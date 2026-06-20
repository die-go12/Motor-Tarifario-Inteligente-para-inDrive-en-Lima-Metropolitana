import { Test } from '@nestjs/testing';
import { PricingService } from './pricing.service';
import { EventsPublisher } from '../audit/events.publisher';
import { PricingConfigService } from '../config/pricing-config.service';

const DEFAULT_CONFIG = {
  costPerKmBase: 1.5,
  fuelConsumptionPerKm: 0.1,
  fuelFactor: 0.25,
  capacityExtraCost: 0.5,
  historicWeight: 0.15,
  trafficWeight: 0.5,
  hourWeight: 0.3,
  timeWeight: 0.2,
  trafficMultiplierCap: 2.0,
  minAbsoluteFare: 3.0,
  maxAbsoluteFare: 150.0,
  maxRangeRatio: 3.5,
  anomalyMediumDeviation: 0.2,
  anomalyHighDeviation: 0.5,
};

const baseRequest = {
  distanceKm: 10,
  fuelPricePerGallon: 16.5,
  vehicleCapacity: 4,
  trafficMultiplier: 1.4,
  hourMultiplier: 1.2,
  timeMultiplier: 1.1,
  historicAveragePrice: 15,
};

describe('PricingService', () => {
  let service: PricingService;
  let publisher: { publish: jest.Mock };

  beforeEach(async () => {
    publisher = { publish: jest.fn().mockResolvedValue(undefined) };
    const moduleRef = await Test.createTestingModule({
      providers: [
        PricingService,
        { provide: EventsPublisher, useValue: publisher },
        {
          provide: PricingConfigService,
          useValue: { getActive: jest.fn().mockResolvedValue(DEFAULT_CONFIG) },
        },
      ],
    }).compile();
    service = moduleRef.get(PricingService);
  });

  describe('quote', () => {
    it('calcula el rango con la fórmula de 7 variables', async () => {
      const quote = await service.quote(baseRequest);
      expect(quote).toEqual({
        basePrice: 22.88,
        minimumPrice: 22.88,
        maximumPrice: 29.28,
      });
    });

    it('aplica el piso absoluto cuando el costo es muy bajo', async () => {
      const quote = await service.quote({
        ...baseRequest,
        distanceKm: 0.5,
        historicAveragePrice: 0,
        vehicleCapacity: 1,
        fuelPricePerGallon: 0,
      });
      expect(quote.minimumPrice).toBe(DEFAULT_CONFIG.minAbsoluteFare);
    });

    it('limita el máximo al tope del multiplicador de tráfico (x2.0)', async () => {
      const quote = await service.quote({
        ...baseRequest,
        trafficMultiplier: 5,
        hourMultiplier: 5,
        timeMultiplier: 5,
      });
      expect(quote.maximumPrice).toBe(45.75);
    });

    it('nunca devuelve un máximo menor que el mínimo en viajes largos', async () => {
      const quote = await service.quote({ ...baseRequest, distanceKm: 120 });
      expect(quote.maximumPrice).toBeGreaterThanOrEqual(quote.minimumPrice);
    });
  });

  describe('settle', () => {
    const range = { minimumPrice: 11.65, maximumPrice: 17.81 };

    it('respeta el precio real cuando está dentro del rango', async () => {
      const settlement = await service.settle({ ...range, realPrice: 16.5 });
      expect(settlement.finalPrice).toBe(16.5);
    });

    it('eleva al piso cuando el precio real está por debajo', async () => {
      const settlement = await service.settle({ ...range, realPrice: 8 });
      expect(settlement.finalPrice).toBe(11.65);
    });

    it('limita al techo cuando el precio real está por encima', async () => {
      const settlement = await service.settle({ ...range, realPrice: 25 });
      expect(settlement.finalPrice).toBe(17.81);
    });

    it('publica una anomalía con el detalle del rango y la desviación', async () => {
      await service.settle({ ...range, realPrice: 40 });
      expect(publisher.publish).toHaveBeenCalledWith(
        'anomaly.detected',
        expect.objectContaining({
          anomalyType: 'PRICE_OUTLIER',
          realPrice: 40,
          minimumPrice: range.minimumPrice,
          maximumPrice: range.maximumPrice,
          deviation: expect.any(Number),
        }),
      );
    });

    it('clasifica la severidad según la desviación fuera del rango', async () => {
      await service.settle({ ...range, realPrice: 19 });
      await service.settle({ ...range, realPrice: 23 });
      await service.settle({ ...range, realPrice: 40 });
      const severities = publisher.publish.mock.calls
        .filter(([channel]) => channel === 'anomaly.detected')
        .map(([, payload]) => (payload as { severity: string }).severity);
      expect(severities).toEqual(['LOW', 'MEDIUM', 'HIGH']);
    });

    it('no publica anomalía cuando el precio real está dentro del rango', async () => {
      await service.settle({ ...range, realPrice: 16.5 });
      expect(publisher.publish).not.toHaveBeenCalledWith(
        'anomaly.detected',
        expect.anything(),
      );
    });
  });
});
