import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TripStatus } from '@app/shared';
import { DecimalTransformer } from '../../../common/decimal.transformer';

const decimal = { type: 'decimal', precision: 10, scale: 2 } as const;
const transformer = new DecimalTransformer();

@Entity('trips')
export class Trip {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'passenger_id', type: 'int' })
  passengerId: number;

  @Column({ name: 'driver_id', type: 'int', nullable: true })
  driverId: number | null;

  @Column({ type: 'varchar', length: 255 })
  origin: string;

  @Column({ type: 'varchar', length: 255 })
  destination: string;

  @Column({ name: 'distance_km', ...decimal, transformer })
  distanceKm: number;

  @Column({ name: 'base_price', ...decimal, transformer })
  basePrice: number;

  @Column({ name: 'minimum_price', ...decimal, transformer })
  minimumPrice: number;

  @Column({ name: 'maximum_price', ...decimal, transformer })
  maximumPrice: number;

  @Column({ name: 'accepted_price', ...decimal, nullable: true, transformer })
  acceptedPrice: number | null;

  @Column({ name: 'final_price', ...decimal, nullable: true, transformer })
  finalPrice: number | null;

  @Column({ type: 'varchar', length: 30 })
  status: TripStatus;

  @CreateDateColumn({ name: 'requested_at' })
  requestedAt: Date;

  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  startedAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
