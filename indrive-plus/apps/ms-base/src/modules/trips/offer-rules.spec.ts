import { BadRequestException } from '@nestjs/common';
import { assertOfferWithinRange } from './offer-rules';

describe('assertOfferWithinRange', () => {
  it('acepta una oferta dentro del rango', () => {
    expect(() => assertOfferWithinRange(15, 11.65, 17.81)).not.toThrow();
  });

  it('acepta una oferta en los extremos del rango', () => {
    expect(() => assertOfferWithinRange(11.65, 11.65, 17.81)).not.toThrow();
    expect(() => assertOfferWithinRange(17.81, 11.65, 17.81)).not.toThrow();
  });

  it('rechaza una oferta por debajo del piso', () => {
    expect(() => assertOfferWithinRange(10, 11.65, 17.81)).toThrow(
      BadRequestException,
    );
  });

  it('rechaza una oferta por encima del techo', () => {
    expect(() => assertOfferWithinRange(20, 11.65, 17.81)).toThrow(
      BadRequestException,
    );
  });
});
