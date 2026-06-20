import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction, AuditEntityType } from './entities/audit-log.entity';

export interface CreateAuditLogDto {
  adminId?: number | null;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: number | null;
  entityName?: string | null;
  oldValues?: Record<string, any> | null;
  newValues?: Record<string, any> | null;
  details?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(dto: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      adminId: dto.adminId || null,
      action: dto.action,
      entityType: dto.entityType,
      entityId: dto.entityId || null,
      entityName: dto.entityName || null,
      oldValues: dto.oldValues || null,
      newValues: dto.newValues || null,
      details: dto.details || null,
      ipAddress: dto.ipAddress || null,
      userAgent: dto.userAgent || null,
    });

    return this.auditLogRepository.save(auditLog);
  }

  async getLogs(limit = 100, offset = 0): Promise<[AuditLog[], number]> {
    return this.auditLogRepository.findAndCount({
      relations: ['admin'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async getLogsByEntity(
    entityType: AuditEntityType,
    entityId?: number,
    limit = 50,
  ): Promise<AuditLog[]> {
    const query = this.auditLogRepository
      .createQueryBuilder('audit')
      .where('audit.entityType = :entityType', { entityType })
      .orderBy('audit.createdAt', 'DESC')
      .take(limit);

    if (entityId) {
      query.andWhere('audit.entityId = :entityId', { entityId });
    }

    return query.getMany();
  }

  async getLogsByAdmin(adminId: number, limit = 50): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { adminId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
