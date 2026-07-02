import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@app/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuditService } from './audit.service';

@ApiTags('audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.AUDITOR)
@Controller('pricing/audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  getLogs(@Query('limit') limit = '100') {
    const parsed = Number(limit);
    return this.auditService.getLogs(Number.isNaN(parsed) ? 100 : parsed);
  }
}
