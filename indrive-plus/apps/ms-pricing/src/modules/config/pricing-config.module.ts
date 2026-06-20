import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PricingConfig,
  PricingConfigSchema,
} from './schemas/pricing-config.schema';
import { PricingConfigService } from './pricing-config.service';
import { PricingConfigController } from './pricing-config.controller';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PricingConfig.name, schema: PricingConfigSchema },
    ]),
    AuthModule,
    AuditModule,
  ],
  controllers: [PricingConfigController],
  providers: [PricingConfigService],
  exports: [PricingConfigService],
})
export class PricingConfigModule {}
