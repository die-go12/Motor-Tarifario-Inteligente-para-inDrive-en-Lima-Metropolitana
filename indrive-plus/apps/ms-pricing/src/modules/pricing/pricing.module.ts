import { Module } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { PricingController } from './pricing.controller';
import { AuditModule } from '../audit/audit.module';
import { PricingConfigModule } from '../config/pricing-config.module';

@Module({
  imports: [AuditModule, PricingConfigModule],
  controllers: [PricingController],
  providers: [PricingService],
})
export class PricingModule {}
