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

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehiclesRepository: Repository<Vehicle>,
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
