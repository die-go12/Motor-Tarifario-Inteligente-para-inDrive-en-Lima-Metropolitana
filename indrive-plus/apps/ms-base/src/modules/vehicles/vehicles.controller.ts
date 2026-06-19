import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser, UserRole } from '@app/shared';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('vehicles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DRIVER)
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.vehiclesService.findAll();
  }

  @Get('driver/:driverId')
  @Roles(UserRole.ADMIN)
  findByDriverId(@Param('driverId', ParseIntPipe) driverId: number) {
    return this.vehiclesService.findByDriver(driverId);
  }

  @Put('driver/:driverId')
  @Roles(UserRole.ADMIN)
  upsertByDriver(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('driverId', ParseIntPipe) driverId: number,
    @Body() dto: CreateVehicleDto,
  ) {
    return this.vehiclesService.upsertByDriver(driverId, dto, admin.id);
  }

  @Post()
  register(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateVehicleDto,
  ) {
    return this.vehiclesService.register(user.id, dto);
  }

  @Get('me')
  getMyVehicle(@CurrentUser() user: AuthenticatedUser) {
    return this.vehiclesService.findByDriver(user.id);
  }

  @Patch('me')
  updateMyVehicle(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.update(user.id, dto);
  }
}
