import { UserRole } from '@app/shared';
import { Trip } from './entities/trip.entity';

export function presentTrip(trip: Trip, viewerRole: UserRole) {
  const base = {
    id: trip.id,
    passengerId: trip.passengerId,
    driverId: trip.driverId,
    origin: trip.origin,
    destination: trip.destination,
    distanceKm: trip.distanceKm,
    status: trip.status,
    finalPrice: trip.finalPrice,
    requestedAt: trip.requestedAt,
    startedAt: trip.startedAt,
    completedAt: trip.completedAt,
  };

  if (viewerRole === UserRole.PASSENGER) {
    return { ...base, maximumPrice: trip.maximumPrice };
  }

  if (viewerRole === UserRole.DRIVER) {
    return { ...base, minimumPrice: trip.minimumPrice };
  }

  return {
    ...base,
    basePrice: trip.basePrice,
    minimumPrice: trip.minimumPrice,
    maximumPrice: trip.maximumPrice,
  };
}
