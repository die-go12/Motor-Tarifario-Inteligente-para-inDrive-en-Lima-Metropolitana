import { ValueTransformer } from 'typeorm';

export class DecimalTransformer implements ValueTransformer {
  to(value: number | null): number | null {
    return value;
  }

  from(value: string | null): number | null {
    return value === null ? null : Number(value);
  }
}
