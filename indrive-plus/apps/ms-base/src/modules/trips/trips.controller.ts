import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser, UserRole } from '@app/shared';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { CompleteTripDto } from './dto/complete-trip.dto';
import { FindTripsDto } from './dto/find-trips.dto';
import { presentQuote, presentTrip } from './trip.presenter';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('trips')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @HttpCode(HttpStatus.OK)
  @Post('quote')
  async quote(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTripDto,
  ) {
    const estimate = await this.tripsService.estimate(
      dto.origin,
      dto.destination,
      dto.capacity,
    );
    return presentQuote(estimate, user.role);
  }

  @Roles(UserRole.PASSENGER)
  @Post()
  async request(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTripDto,
  ) {
    const trip = await this.tripsService.request(user.id, dto);
    return presentTrip(trip, user.role);
  }

  @Roles(UserRole.DRIVER)
  @Get('available')
  async available(@CurrentUser() user: AuthenticatedUser) {
    const trips = await this.tripsService.findSearching();
    return trips.map((trip) => presentTrip(trip, user.role));
  }

  @Get()
  async myTrips(@CurrentUser() user: AuthenticatedUser) {
    const trips =
      user.role === UserRole.ADMIN
        ? await this.tripsService.findAll()
        : user.role === UserRole.DRIVER
          ? await this.tripsService.findByDriver(user.id)
          : await this.tripsService.findByPassenger(user.id);
    return trips.map((trip) => presentTrip(trip, user.role));
  }

  @Roles(UserRole.ADMIN, UserRole.AUDITOR)
  @Get('all')
  async findAll(@Query() query: FindTripsDto) {
    const trips = await this.tripsService.findAll(query.status);
    return trips.map((trip) => presentTrip(trip, UserRole.ADMIN));
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const trip = await this.tripsService.findByIdForViewer(id, user);
    return presentTrip(trip, user.role);
  }

  @Roles(UserRole.DRIVER)
  @Patch(':id/assign')
  async assign(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const trip = await this.tripsService.assign(id, user.id);
    return presentTrip(trip, user.role);
  }

  @Roles(UserRole.DRIVER)
  @Patch(':id/start')
  async start(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const trip = await this.tripsService.start(id, user.id);
    return presentTrip(trip, user.role);
  }

  @Roles(UserRole.DRIVER)
  @Patch(':id/complete')
  async complete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CompleteTripDto,
  ) {
    const trip = await this.tripsService.complete(id, user.id, dto.realPrice);
    return presentTrip(trip, user.role);
  }

  @Patch(':id/cancel')
  async cancel(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const trip = await this.tripsService.cancel(id, user.id);
    return presentTrip(trip, user.role);
  }
}
