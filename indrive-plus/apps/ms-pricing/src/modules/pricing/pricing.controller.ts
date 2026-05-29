import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PriceQuote, PriceSettlement } from '@app/shared';
import { PricingService } from './pricing.service';
import { QuoteDto } from './dto/quote.dto';
import { SettleDto } from './dto/settle.dto';

@ApiTags('pricing')
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @HttpCode(HttpStatus.OK)
  @Post('quote')
  quote(@Body() dto: QuoteDto): Promise<PriceQuote> {
    return this.pricingService.quote(dto.distanceKm);
  }

  @HttpCode(HttpStatus.OK)
  @Post('settle')
  settle(@Body() dto: SettleDto): PriceSettlement {
    return this.pricingService.settle(dto);
  }
}
