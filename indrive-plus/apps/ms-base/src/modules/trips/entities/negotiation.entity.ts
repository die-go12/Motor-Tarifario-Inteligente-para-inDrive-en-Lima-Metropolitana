import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NegotiationStatus } from '@app/shared';

@Entity('negotiations')
export class Negotiation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'trip_id', type: 'int', unique: true })
  tripId: number;

  @Column({ type: 'varchar', length: 20 })
  status: NegotiationStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
