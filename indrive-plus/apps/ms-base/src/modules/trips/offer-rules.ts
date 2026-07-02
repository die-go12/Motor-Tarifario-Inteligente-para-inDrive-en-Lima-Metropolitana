import { BadRequestException } from '@nestjs/common';

export function assertOfferWithinRange(
  amount: number,
  minimumPrice: number,
  maximumPrice: number,
): void {
  if (amount < minimumPrice || amount > maximumPrice) {
    throw new BadRequestException(
      'La oferta está fuera del rango permitido para este viaje',
    );
  }
}
