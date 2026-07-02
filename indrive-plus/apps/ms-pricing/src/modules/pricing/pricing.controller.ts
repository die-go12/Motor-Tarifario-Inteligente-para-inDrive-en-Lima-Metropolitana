import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { PriceQuote, PriceSettlement } from '@app/shared';
import { PricingService } from './pricing.service';
import { QuoteDto } from './dto/quote.dto';
import { SettleDto } from './dto/settle.dto';
import {
  INTERNAL_API_KEY_HEADER,
  InternalAuthGuard,
} from '../auth/internal-auth.guard';

@ApiTags('pricing')
@ApiSecurity(INTERNAL_API_KEY_HEADER)
@UseGuards(InternalAuthGuard)
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @HttpCode(HttpStatus.OK)
  @Post('quote')
  quote(@Body() dto: QuoteDto): Promise<PriceQuote> {
    return this.pricingService.quote(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('settle')
  settle(@Body() dto: SettleDto): Promise<PriceSettlement> {
    return this.pricingService.settle(dto);
  }
}
