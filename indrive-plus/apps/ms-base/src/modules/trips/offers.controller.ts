import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser, UserRole } from '@app/shared';
import { NegotiationService } from './negotiation.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('offers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('trips/:tripId/offers')
export class OffersController {
  constructor(private readonly negotiationService: NegotiationService) {}

  @Roles(UserRole.PASSENGER, UserRole.DRIVER)
  @Post()
  createOffer(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tripId', ParseIntPipe) tripId: number,
    @Body() dto: CreateOfferDto,
  ) {
    return this.negotiationService.createOffer(tripId, user, dto.amount);
  }

  @Roles(UserRole.PASSENGER)
  @HttpCode(HttpStatus.OK)
  @Post(':offerId/accept')
  accept(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tripId', ParseIntPipe) tripId: number,
    @Param('offerId', ParseIntPipe) offerId: number,
  ) {
    return this.negotiationService.acceptOffer(tripId, offerId, user);
  }

  @Get()
  listOffers(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tripId', ParseIntPipe) tripId: number,
  ) {
    return this.negotiationService.listOffers(tripId, user);
  }
}
