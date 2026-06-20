import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuditService } from './audit.service';
import { UserRole } from '@app/shared';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.AUDITOR)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  async getLogs(@Query('limit') limit = 100, @Query('offset') offset = 0) {
    const [logs, total] = await this.auditService.getLogs(
      Math.min(Number(limit), 500),
      Number(offset),
    );

    return {
      logs,
      total,
      limit: Math.min(Number(limit), 500),
      offset: Number(offset),
    };
  }

  @Get('logs/entity')
  async getLogsByEntity(
    @Query('entityType') entityType: string,
    @Query('entityId') entityId?: number,
    @Query('limit') limit = 50,
  ) {
    return this.auditService.getLogsByEntity(
      entityType as any,
      entityId ? Number(entityId) : undefined,
      Math.min(Number(limit), 200),
    );
  }

  @Get('logs/admin')
  async getLogsByAdmin(
    @Query('adminId') adminId: number,
    @Query('limit') limit = 50,
  ) {
    return this.auditService.getLogsByAdmin(
      Number(adminId),
      Math.min(Number(limit), 200),
    );
  }
}
