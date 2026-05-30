import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TripContext } from '@app/shared';
import { IntegrationService } from './integration.service';
import { TripContextDto } from './dto/trip-context.dto';

@ApiTags('integration')
@Controller('integration')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @HttpCode(HttpStatus.OK)
  @Post('trip-context')
  tripContext(@Body() dto: TripContextDto): Promise<TripContext> {
    return this.integrationService.buildTripContext(
      dto.origin,
      dto.destination,
    );
  }
}
