import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from './entities/trip.entity';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { PricingClient } from '../../clients/pricing.client';
import { VehiclesModule } from '../vehicles/vehicles.module';

@Module({
  imports: [TypeOrmModule.forFeature([Trip]), VehiclesModule],
  controllers: [TripsController],
  providers: [TripsService, PricingClient],
})
export class TripsModule {}
