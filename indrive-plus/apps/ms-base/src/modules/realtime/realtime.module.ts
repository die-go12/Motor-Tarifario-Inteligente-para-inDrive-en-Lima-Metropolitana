import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TripsModule } from '../trips/trips.module';
import { RealtimeGateway } from './realtime.gateway';

@Module({
  imports: [JwtModule.register({}), TripsModule],
  providers: [RealtimeGateway],
})
export class RealtimeModule {}
