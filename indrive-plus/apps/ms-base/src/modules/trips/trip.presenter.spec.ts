import { UserRole } from '@app/shared';
import { presentTrip } from './trip.presenter';
import { Trip } from './entities/trip.entity';

const trip = {
  id: 1,
  passengerId: 1,
  driverId: 2,
  origin: 'Miraflores',
  destination: 'San Isidro',
  distanceKm: 8.5,
  basePrice: 13.7,
  minimumPrice: 11.65,
  maximumPrice: 17.81,
  finalPrice: null,
  status: 'SEARCHING',
} as Trip;

describe('presentTrip', () => {
  it('el pasajero ve solo el techo (máximo)', () => {
    const view = presentTrip(trip, UserRole.PASSENGER) as Record<
      string,
      unknown
    >;
    expect(view.maximumPrice).toBe(17.81);
    expect(view.minimumPrice).toBeUndefined();
    expect(view.basePrice).toBeUndefined();
  });

  it('el conductor ve solo el piso (mínimo)', () => {
    const view = presentTrip(trip, UserRole.DRIVER) as Record<string, unknown>;
    expect(view.minimumPrice).toBe(11.65);
    expect(view.maximumPrice).toBeUndefined();
    expect(view.basePrice).toBeUndefined();
  });

  it('el admin ve el rango completo', () => {
    const view = presentTrip(trip, UserRole.ADMIN) as Record<string, unknown>;
    expect(view.minimumPrice).toBe(11.65);
    expect(view.maximumPrice).toBe(17.81);
    expect(view.basePrice).toBe(13.7);
  });
});
