import { Test } from '@nestjs/testing';
import { PricingService } from './pricing.service';
import { EventsPublisher } from '../audit/events.publisher';
import { PricingConfigService } from '../config/pricing-config.service';

const DEFAULT_CONFIG = {
  baseFare: 3.5,
  pricePerKm: 1.2,
  minimumMargin: 0.85,
  maximumMargin: 1.3,
  trafficMultiplierCap: 2.0,
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
    it('calcula el rango a partir de la configuración', async () => {
      const quote = await service.quote(10);
      expect(quote).toEqual({
        basePrice: 15.5,
        minimumPrice: 13.18,
        maximumPrice: 20.15,
      });
    });
  });

  describe('settle', () => {
    const range = { minimumPrice: 11.65, maximumPrice: 17.81 };

    it('respeta el precio real cuando está dentro del rango', () => {
      expect(service.settle({ ...range, realPrice: 16.5 }).finalPrice).toBe(
        16.5,
      );
    });

    it('eleva al piso cuando el precio real está por debajo', () => {
      expect(service.settle({ ...range, realPrice: 8 }).finalPrice).toBe(11.65);
    });

    it('limita al techo cuando el precio real está por encima', () => {
      expect(service.settle({ ...range, realPrice: 25 }).finalPrice).toBe(
        17.81,
      );
    });

    it('publica una anomalía cuando el precio real se dispara', () => {
      service.settle({ ...range, realPrice: 40 });
      expect(publisher.publish).toHaveBeenCalledWith(
        'anomaly.detected',
        expect.objectContaining({ anomalyType: 'PRICE_OUTLIER' }),
      );
    });
  });
});
