import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from './entities/trip.entity';
import { Negotiation } from './entities/negotiation.entity';
import { Offer } from './entities/offer.entity';
import { Payment } from './entities/payment.entity';
import { TripsService } from './trips.service';
import { NegotiationService } from './negotiation.service';
import { TripsController } from './trips.controller';
import { OffersController } from './offers.controller';
import { PricingClient } from '../../clients/pricing.client';
import { IntegrationClient } from '../../clients/integration.client';
import { VehiclesModule } from '../vehicles/vehicles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trip, Negotiation, Offer, Payment]),
    VehiclesModule,
  ],
  controllers: [TripsController, OffersController],
  providers: [
    TripsService,
    NegotiationService,
    PricingClient,
    IntegrationClient,
  ],
})
export class TripsModule {}
