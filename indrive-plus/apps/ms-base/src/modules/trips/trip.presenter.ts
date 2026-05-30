import { UserRole } from '@app/shared';
import { Trip } from './entities/trip.entity';

export interface TripEstimate {
  distanceKm: number;
  durationMin: number;
  polyline: string;
  basePrice: number;
  minimumPrice: number;
  maximumPrice: number;
}

export function presentQuote(estimate: TripEstimate, viewerRole: UserRole) {
  const base = {
    distanceKm: estimate.distanceKm,
    durationMin: estimate.durationMin,
    polyline: estimate.polyline,
  };

  if (viewerRole === UserRole.PASSENGER) {
    return { ...base, maximumPrice: estimate.maximumPrice };
  }

  if (viewerRole === UserRole.DRIVER) {
    return { ...base, minimumPrice: estimate.minimumPrice };
  }

  return {
    ...base,
    basePrice: estimate.basePrice,
    minimumPrice: estimate.minimumPrice,
    maximumPrice: estimate.maximumPrice,
  };
}

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
