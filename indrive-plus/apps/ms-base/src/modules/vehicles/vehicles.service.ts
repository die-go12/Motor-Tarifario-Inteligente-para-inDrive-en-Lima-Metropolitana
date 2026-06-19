import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { User } from '../users/entities/user.entity';
import { AuditService } from '../audit/audit.service';
import { AuditAction, AuditEntityType } from '../audit/entities/audit-log.entity';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehiclesRepository: Repository<Vehicle>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly auditService: AuditService,
  ) {}

  async register(driverId: number, dto: CreateVehicleDto): Promise<Vehicle> {
    await this.ensureDriverHasNoVehicle(driverId);
    await this.ensurePlateIsAvailable(dto.plate);
    const vehicle = this.vehiclesRepository.create({ ...dto, driverId });
    return this.vehiclesRepository.save(vehicle);
  }

  async findByDriver(driverId: number): Promise<Vehicle> {
    const vehicle = await this.vehiclesRepository.findOne({
      where: { driverId },
    });
    if (!vehicle) {
      throw new NotFoundException(
        'El conductor no tiene un vehículo registrado',
      );
    }
    return vehicle;
  }

  findAll(): Promise<Vehicle[]> {
    return this.vehiclesRepository.find();
  }

  async existsForDriver(driverId: number): Promise<boolean> {
    const count = await this.vehiclesRepository.countBy({ driverId });
    return count > 0;
  }

  async update(driverId: number, dto: UpdateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.findByDriver(driverId);
    if (dto.plate && dto.plate !== vehicle.plate) {
      await this.ensurePlateIsAvailable(dto.plate);
    }
    Object.assign(vehicle, dto);
    return this.vehiclesRepository.save(vehicle);
  }

  async upsertByDriver(
    driverId: number,
    dto: CreateVehicleDto,
    adminId?: number,
  ): Promise<Vehicle> {
    const existing = await this.vehiclesRepository.findOne({
      where: { driverId },
    });

    const driver = await this.usersRepository.findOne({ where: { id: driverId } });
    const entityName = driver
      ? `${driver.name} (${driver.email})`
      : `Conductor #${driverId}`;

    if (!existing) {
      await this.ensurePlateIsAvailable(dto.plate);
      const vehicle = this.vehiclesRepository.create({ ...dto, driverId });
      const created = await this.vehiclesRepository.save(vehicle);

      if (adminId) {
        await this.auditService.log({
          adminId,
          action: AuditAction.UPDATE_USER,
          entityType: AuditEntityType.USER,
          entityId: driverId,
          entityName,
          newValues: {
            vehicle: {
              brand: created.brand,
              model: created.model,
              plate: created.plate,
              color: created.color,
              year: created.year,
              capacity: created.capacity,
              fuelType: created.fuelType,
            },
          },
          details: 'Vehiculo del conductor creado por admin',
        });
      }

      return created;
    }

    if (dto.plate !== existing.plate) {
      await this.ensurePlateIsAvailable(dto.plate);
    }

    const oldValues = {
      vehicle: {
        brand: existing.brand,
        model: existing.model,
        plate: existing.plate,
        color: existing.color,
        year: existing.year,
        capacity: existing.capacity,
        fuelType: existing.fuelType,
      },
    };

    Object.assign(existing, dto);
    const updated = await this.vehiclesRepository.save(existing);

    if (adminId) {
      await this.auditService.log({
        adminId,
        action: AuditAction.UPDATE_USER,
        entityType: AuditEntityType.USER,
        entityId: driverId,
        entityName,
        oldValues,
        newValues: {
          vehicle: {
            brand: updated.brand,
            model: updated.model,
            plate: updated.plate,
            color: updated.color,
            year: updated.year,
            capacity: updated.capacity,
            fuelType: updated.fuelType,
          },
        },
        details: 'Vehiculo del conductor actualizado por admin',
      });
    }

    return updated;
  }

  private async ensureDriverHasNoVehicle(driverId: number): Promise<void> {
    const existing = await this.vehiclesRepository.findOne({
      where: { driverId },
    });
    if (existing) {
      throw new ConflictException(
        'El conductor ya tiene un vehículo registrado',
      );
    }
  }

  private async ensurePlateIsAvailable(plate: string): Promise<void> {
    const existing = await this.vehiclesRepository.findOne({
      where: { plate },
    });
    if (existing) {
      throw new ConflictException('La placa ya está registrada');
    }
  }
}
