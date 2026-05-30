import { Module } from '@nestjs/common';
import { MapsService } from '../maps/maps.service';
import { FuelService } from '../fuel/fuel.service';
import { TrafficService } from '../traffic/traffic.service';
import { IntegrationService } from './integration.service';
import { IntegrationController } from './integration.controller';

@Module({
  controllers: [IntegrationController],
  providers: [MapsService, FuelService, TrafficService, IntegrationService],
})
export class IntegrationModule {}
