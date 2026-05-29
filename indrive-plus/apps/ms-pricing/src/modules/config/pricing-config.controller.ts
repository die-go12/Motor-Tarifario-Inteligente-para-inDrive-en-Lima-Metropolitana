import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@app/shared';
import { PricingConfigService } from './pricing-config.service';
import { UpdatePricingConfigDto } from './dto/update-pricing-config.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('pricing-config')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('pricing/config')
export class PricingConfigController {
  constructor(private readonly pricingConfigService: PricingConfigService) {}

  @Get()
  get() {
    return this.pricingConfigService.getActive();
  }

  @Put()
  update(@Body() dto: UpdatePricingConfigDto) {
    return this.pricingConfigService.update(dto);
  }
}
