import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AuthenticatedUser,
  NegotiationStatus,
  OfferSender,
  OfferStatus,
  TripStatus,
  UserRole,
} from '@app/shared';
import { Negotiation } from './entities/negotiation.entity';
import { Offer } from './entities/offer.entity';
import { TripsService } from './trips.service';
import { assertOfferWithinRange } from './offer-rules';

@Injectable()
export class NegotiationService {
  private readonly logger = new Logger(NegotiationService.name);

  constructor(
    @InjectRepository(Negotiation)
    private readonly negotiationsRepository: Repository<Negotiation>,
    @InjectRepository(Offer)
    private readonly offersRepository: Repository<Offer>,
    private readonly tripsService: TripsService,
  ) {}

  async createOffer(
    tripId: number,
    user: AuthenticatedUser,
    amount: number,
  ): Promise<Offer> {
    const trip = await this.tripsService.findById(tripId);
    if (trip.status !== TripStatus.SEARCHING) {
      throw new BadRequestException('El viaje ya no admite ofertas');
    }
    if (user.role === UserRole.PASSENGER && trip.passengerId !== user.id) {
      throw new ForbiddenException('No puedes ofertar en este viaje');
    }
    assertOfferWithinRange(amount, trip.minimumPrice, trip.maximumPrice);

    const negotiation = await this.ensureNegotiation(tripId);
    const isDriver = user.role === UserRole.DRIVER;
    const offer = this.offersRepository.create({
      negotiationId: negotiation.id,
      driverId: isDriver ? user.id : null,
      sender: isDriver ? OfferSender.DRIVER : OfferSender.PASSENGER,
      amount,
      status: OfferStatus.PENDING,
    });
    const saved = await this.offersRepository.save(offer);
    this.logger.log(
      `Oferta registrada: viaje=${tripId} emisor=${saved.sender} monto=${amount}`,
    );
    return saved;
  }

  async listOffers(tripId: number, user: AuthenticatedUser): Promise<Offer[]> {
    const trip = await this.tripsService.findById(tripId);
    if (user.role !== UserRole.ADMIN && trip.passengerId !== user.id) {
      throw new ForbiddenException('No participas en este viaje');
    }
    const negotiation = await this.negotiationsRepository.findOne({
      where: { tripId },
    });
    if (!negotiation) {
      return [];
    }
    return this.offersRepository.find({
      where: { negotiationId: negotiation.id },
      order: { createdAt: 'ASC' },
    });
  }

  private async ensureNegotiation(tripId: number): Promise<Negotiation> {
    const existing = await this.negotiationsRepository.findOne({
      where: { tripId },
    });
    if (existing) {
      return existing;
    }
    const negotiation = this.negotiationsRepository.create({
      tripId,
      status: NegotiationStatus.OPEN,
    });
    return this.negotiationsRepository.save(negotiation);
  }
}
