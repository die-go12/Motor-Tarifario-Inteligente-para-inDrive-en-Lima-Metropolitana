import { BadRequestException } from '@nestjs/common';

export function assertOfferWithinRange(
  amount: number,
  minimumPrice: number,
  maximumPrice: number,
): void {
  if (amount < minimumPrice || amount > maximumPrice) {
    throw new BadRequestException(
      `La oferta debe estar dentro del rango [${minimumPrice}, ${maximumPrice}]`,
    );
  }
}
