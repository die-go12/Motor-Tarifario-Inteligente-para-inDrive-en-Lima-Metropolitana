import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OfferSender, OfferStatus } from '@app/shared';
import { DecimalTransformer } from '../../../common/decimal.transformer';

@Entity('offers')
export class Offer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'negotiation_id', type: 'int' })
  negotiationId: number;

  @Column({ name: 'driver_id', type: 'int', nullable: true })
  driverId: number | null;

  @Column({ type: 'varchar', length: 20 })
  sender: OfferSender;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  amount: number;

  @Column({ type: 'varchar', length: 20 })
  status: OfferStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
