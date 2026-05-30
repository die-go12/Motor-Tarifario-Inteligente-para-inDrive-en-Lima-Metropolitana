import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PaymentCondition } from '@app/shared';
import { DecimalTransformer } from '../../../common/decimal.transformer';

const decimal = { type: 'decimal', precision: 10, scale: 2 } as const;
const transformer = new DecimalTransformer();

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'trip_id', type: 'int', unique: true })
  tripId: number;

  @Column({ ...decimal, transformer })
  amount: number;

  @Column({ name: 'real_price', ...decimal, nullable: true, transformer })
  realPrice: number | null;

  @Column({ type: 'varchar', length: 20 })
  condition: PaymentCondition;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
