import { PaymentCondition } from '@app/shared';
import { derivePaymentCondition } from './payment-condition';

describe('derivePaymentCondition', () => {
  it('marca FLOOR cuando el precio real cae por debajo del piso', () => {
    expect(derivePaymentCondition(10, 11.65, 17.81)).toBe(
      PaymentCondition.FLOOR,
    );
  });

  it('marca CEILING cuando el precio real supera el techo', () => {
    expect(derivePaymentCondition(20, 11.65, 17.81)).toBe(
      PaymentCondition.CEILING,
    );
  });

  it('marca WITHIN_RANGE cuando el precio real está dentro del rango', () => {
    expect(derivePaymentCondition(15, 11.65, 17.81)).toBe(
      PaymentCondition.WITHIN_RANGE,
    );
  });

  it('trata los extremos del rango como WITHIN_RANGE', () => {
    expect(derivePaymentCondition(11.65, 11.65, 17.81)).toBe(
      PaymentCondition.WITHIN_RANGE,
    );
    expect(derivePaymentCondition(17.81, 11.65, 17.81)).toBe(
      PaymentCondition.WITHIN_RANGE,
    );
  });
});
