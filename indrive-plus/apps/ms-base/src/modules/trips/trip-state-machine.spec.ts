import { BadRequestException } from '@nestjs/common';
import { TripStatus } from '@app/shared';
import { assertTransition } from './trip-state-machine';

describe('assertTransition', () => {
  it('permite SEARCHING -> ASSIGNED', () => {
    expect(() =>
      assertTransition(TripStatus.SEARCHING, TripStatus.ASSIGNED),
    ).not.toThrow();
  });

  it('permite ASSIGNED -> IN_PROGRESS', () => {
    expect(() =>
      assertTransition(TripStatus.ASSIGNED, TripStatus.IN_PROGRESS),
    ).not.toThrow();
  });

  it('permite IN_PROGRESS -> COMPLETED', () => {
    expect(() =>
      assertTransition(TripStatus.IN_PROGRESS, TripStatus.COMPLETED),
    ).not.toThrow();
  });

  it('rechaza completar un viaje ya completado', () => {
    expect(() =>
      assertTransition(TripStatus.COMPLETED, TripStatus.CANCELLED),
    ).toThrow(BadRequestException);
  });

  it('rechaza iniciar un viaje que sigue en búsqueda', () => {
    expect(() =>
      assertTransition(TripStatus.SEARCHING, TripStatus.IN_PROGRESS),
    ).toThrow(BadRequestException);
  });
});
