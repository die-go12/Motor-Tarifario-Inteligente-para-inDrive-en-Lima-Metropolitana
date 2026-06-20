import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum AuditAction {
  CREATE_USER = 'CREATE_USER',
  UPDATE_USER = 'UPDATE_USER',
  DELETE_USER = 'DELETE_USER',
  UPDATE_CONFIG = 'UPDATE_CONFIG',
  UPDATE_WEIGHTS = 'UPDATE_WEIGHTS',
}

export enum AuditEntityType {
  USER = 'USER',
  CONFIGURATION = 'CONFIGURATION',
  WEIGHTS = 'WEIGHTS',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'admin_id', type: 'integer', nullable: true })
  adminId: number | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'admin_id' })
  admin: User | null;

  @Column({ type: 'varchar', length: 50 })
  action: AuditAction;

  @Column({ name: 'entity_type', type: 'varchar', length: 50 })
  entityType: AuditEntityType;

  @Column({ name: 'entity_id', type: 'integer', nullable: true })
  entityId: number | null;

  @Column({ name: 'entity_name', type: 'varchar', length: 255, nullable: true })
  entityName: string | null;

  @Column({ name: 'old_values', type: 'jsonb', nullable: true })
  oldValues: Record<string, any> | null;

  @Column({ name: 'new_values', type: 'jsonb', nullable: true })
  newValues: Record<string, any> | null;

  @Column({ type: 'text', nullable: true })
  details: string | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
