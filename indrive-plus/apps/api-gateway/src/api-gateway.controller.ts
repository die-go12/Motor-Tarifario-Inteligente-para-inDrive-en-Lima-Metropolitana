import { Controller, Get } from '@nestjs/common';

@Controller()
export class ApiGatewayController {
  @Get()
  info() {
    return {
      service: 'inDrive+ API Gateway',
      status: 'ok',
      routes: {
        auth: '/auth',
        users: '/users',
        vehicles: '/vehicles',
        trips: '/trips',
        pricing: '/pricing',
      },
    };
  }
}
