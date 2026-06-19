import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import {
  AuthenticatedUser,
  PriceQuote,
  QuoteRequest,
  TripContext,
  TripStatus,
  UserRole,
} from '@app/shared';
import { Trip } from './entities/trip.entity';
import { Payment } from './entities/payment.entity';
import { CreateTripDto } from './dto/create-trip.dto';
import { TripEstimate } from './trip.presenter';
import { assertTransition } from './trip-state-machine';
import { derivePaymentCondition } from './payment-condition';
import { PricingClient } from '../../clients/pricing.client';
import { IntegrationClient } from '../../clients/integration.client';
import { VehiclesService } from '../vehicles/vehicles.service';

const DEFAULT_VEHICLE_CAPACITY = 4;
export const TRIP_CREATED_EVENT = 'trip.created';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip)
    private readonly tripsRepository: Repository<Trip>,
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    private readonly pricingClient: PricingClient,
    private readonly integrationClient: IntegrationClient,
    private readonly vehiclesService: VehiclesService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async estimate(origin: string, destination: string): Promise<TripEstimate> {
    const { context, quote } = await this.resolveQuote(origin, destination);
    return {
      distanceKm: context.distanceKm,
      durationMin: context.durationMin,
      polyline: context.polyline,
      basePrice: quote.basePrice,
      minimumPrice: quote.minimumPrice,
      maximumPrice: quote.maximumPrice,
    };
  }

  async request(passengerId: number, dto: CreateTripDto): Promise<Trip> {
    const { context, quote } = await this.resolveQuote(
      dto.origin,
      dto.destination,
    );
    const trip = this.tripsRepository.create({
      passengerId,
      origin: dto.origin,
      destination: dto.destination,
      distanceKm: context.distanceKm,
      basePrice: quote.basePrice,
      minimumPrice: quote.minimumPrice,
      maximumPrice: quote.maximumPrice,
      status: TripStatus.SEARCHING,
    });
    const saved = await this.tripsRepository.save(trip);
    this.eventEmitter.emit(TRIP_CREATED_EVENT, saved);
    return saved;
  }

  private async resolveQuote(
    origin: string,
    destination: string,
  ): Promise<{ context: TripContext; quote: PriceQuote }> {
    const context = await this.integrationClient.getTripContext(
      origin,
      destination,
    );
    const quote = await this.pricingClient.quote(
      this.buildQuoteRequest(context),
    );
    return { context, quote };
  }

  private buildQuoteRequest(context: TripContext): QuoteRequest {
    return {
      distanceKm: context.distanceKm,
      fuelPricePerGallon: context.fuelPricePerGallon,
      vehicleCapacity: DEFAULT_VEHICLE_CAPACITY,
      trafficMultiplier: context.trafficMultiplier,
      hourMultiplier: context.hourMultiplier,
      timeMultiplier: context.timeMultiplier,
      historicAveragePrice: context.historicAveragePrice,
    };
  }

  async assign(tripId: number, driverId: number): Promise<Trip> {
    const hasVehicle = await this.vehiclesService.existsForDriver(driverId);
    if (!hasVehicle) {
      throw new BadRequestException(
        'Debes registrar un vehículo antes de aceptar viajes',
      );
    }
    await this.findById(tripId);
    const result = await this.tripsRepository.update(
      { id: tripId, status: TripStatus.SEARCHING },
      { driverId, status: TripStatus.ASSIGNED },
    );
    if (!result.affected) {
      throw new BadRequestException('El viaje ya no está disponible');
    }
    return this.findById(tripId);
  }

  async start(tripId: number, driverId: number): Promise<Trip> {
    const trip = await this.findAssignedDriverTrip(tripId, driverId);
    assertTransition(trip.status, TripStatus.IN_PROGRESS);
    trip.status = TripStatus.IN_PROGRESS;
    trip.startedAt = new Date();
    return this.tripsRepository.save(trip);
  }

  async complete(
    tripId: number,
    driverId: number,
    realPrice: number,
  ): Promise<Trip> {
    const trip = await this.findAssignedDriverTrip(tripId, driverId);
    assertTransition(trip.status, TripStatus.COMPLETED);
    const settlement = await this.pricingClient.settle({
      minimumPrice: trip.minimumPrice,
      maximumPrice: trip.maximumPrice,
      realPrice,
      tripId: trip.id,
      route: `${trip.origin} - ${trip.destination}`,
    });
    trip.finalPrice = settlement.finalPrice;
    trip.status = TripStatus.COMPLETED;
    trip.completedAt = new Date();
    const completed = await this.tripsRepository.save(trip);
    await this.persistPayment(completed, settlement.finalPrice, realPrice);
    return completed;
  }

  private async persistPayment(
    trip: Trip,
    amount: number,
    realPrice: number,
  ): Promise<void> {
    const payment = this.paymentsRepository.create({
      tripId: trip.id,
      amount,
      realPrice,
      condition: derivePaymentCondition(
        realPrice,
        trip.minimumPrice,
        trip.maximumPrice,
      ),
    });
    await this.paymentsRepository.save(payment);
  }

  async cancel(tripId: number, userId: number): Promise<Trip> {
    const trip = await this.findById(tripId);
    this.assertParticipant(trip, userId);
    assertTransition(trip.status, TripStatus.CANCELLED);
    trip.status = TripStatus.CANCELLED;
    return this.tripsRepository.save(trip);
  }

  async findById(tripId: number): Promise<Trip> {
    const trip = await this.tripsRepository.findOne({ where: { id: tripId } });
    if (!trip) {
      throw new NotFoundException(`Viaje ${tripId} no encontrado`);
    }
    return trip;
  }

  async findByIdForViewer(
    tripId: number,
    viewer: AuthenticatedUser,
  ): Promise<Trip> {
    const trip = await this.findById(tripId);
    if (viewer.role !== UserRole.ADMIN) {
      this.assertParticipant(trip, viewer.id);
    }
    return trip;
  }

  findSearching(): Promise<Trip[]> {
    return this.tripsRepository.find({
      where: { status: TripStatus.SEARCHING },
    });
  }

  findByPassenger(passengerId: number): Promise<Trip[]> {
    return this.tripsRepository.find({ where: { passengerId } });
  }

  findByDriver(driverId: number): Promise<Trip[]> {
    return this.tripsRepository.find({ where: { driverId } });
  }

  private async findAssignedDriverTrip(
    tripId: number,
    driverId: number,
  ): Promise<Trip> {
    const trip = await this.findById(tripId);
    if (trip.driverId !== driverId) {
      throw new ForbiddenException(
        'El viaje no está asignado a este conductor',
      );
    }
    return trip;
  }

  private assertParticipant(trip: Trip, userId: number): void {
    if (trip.passengerId !== userId && trip.driverId !== userId) {
      throw new ForbiddenException('No participas en este viaje');
    }
  }
}
