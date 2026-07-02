import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuditService } from '../audit/audit.service';
import { AuditAction, AuditEntityType } from '../audit/entities/audit-log.entity';

const PASSWORD_SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateUserDto, adminId?: number): Promise<User> {
    await this.ensureEmailIsAvailable(dto.email);
    const password = await bcrypt.hash(dto.password, PASSWORD_SALT_ROUNDS);

    const user = this.usersRepository.create({
      ...dto,
      password,
    });
    const saved = await this.usersRepository.save(user);

    // Registrar en auditoría
    if (adminId) {
      await this.auditService.log({
        adminId,
        action: AuditAction.CREATE_USER,
        entityType: AuditEntityType.USER,
        entityId: saved.id,
        entityName: `${saved.name} (${saved.email})`,
        newValues: {
          name: saved.name,
          email: saved.email,
          role: saved.role,
          phone: saved.phone,
        },
        details: `Usuario creado: ${saved.name} con rol ${saved.role}`,
      });
    }

    return saved;
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario ${id} no encontrado`);
    }
    return user;
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async updateProfile(id: number, dto: UpdateUserDto, adminId?: number): Promise<User> {
    const user = await this.findById(id);
    const oldValues = this.toAuditSnapshot(user);
    Object.assign(user, dto);
    const updated = await this.usersRepository.save(user);

    // Registrar en auditoría si adminId es diferente (cambio hecho por admin)
    if (adminId && adminId !== id) {
      const changes = {} as Record<string, unknown>;
      const dtoRecord = dto as Record<string, unknown>;
      Object.keys(dtoRecord).forEach((key) => {
        if (oldValues[key] !== dtoRecord[key]) {
          changes[key] = { old: oldValues[key], new: dtoRecord[key] };
        }
      });

      await this.auditService.log({
        adminId,
        action: AuditAction.UPDATE_USER,
        entityType: AuditEntityType.USER,
        entityId: id,
        entityName: `${updated.name} (${updated.email})`,
        oldValues: oldValues,
        newValues: dto,
        details: `Usuario actualizado: ${JSON.stringify(changes)}`,
      });
    }

    return updated;
  }

  async remove(id: number, adminId?: number): Promise<void> {
    const user = await this.findById(id);

    // Registrar en auditoría
    if (adminId) {
      await this.auditService.log({
        adminId,
        action: AuditAction.DELETE_USER,
        entityType: AuditEntityType.USER,
        entityId: id,
        entityName: `${user.name} (${user.email})`,
        oldValues: {
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
        details: `Usuario eliminado: ${user.name} con rol ${user.role}`,
      });
    }

    await this.usersRepository.remove(user);
  }

  private async ensureEmailIsAvailable(email: string): Promise<void> {
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new ConflictException('El correo ya está registrado');
    }
  }

  private toAuditSnapshot(user: User): Record<string, unknown> {
    return {
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isActive: user.isActive,
    };
  }
}

