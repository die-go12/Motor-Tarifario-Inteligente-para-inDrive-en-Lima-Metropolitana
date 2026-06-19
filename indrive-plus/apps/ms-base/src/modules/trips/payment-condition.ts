import { PaymentCondition } from '@app/shared';

export function derivePaymentCondition(
  realPrice: number,
  minimumPrice: number,
  maximumPrice: number,
): PaymentCondition {
  if (realPrice < minimumPrice) {
    return PaymentCondition.FLOOR;
  }
  if (realPrice > maximumPrice) {
    return PaymentCondition.CEILING;
  }
  return PaymentCondition.WITHIN_RANGE;
}
