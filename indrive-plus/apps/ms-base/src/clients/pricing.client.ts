import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PriceQuote,
  PriceSettlement,
  QuoteRequest,
  SettleRequest,
} from '@app/shared';

@Injectable()
export class PricingClient {
  private readonly logger = new Logger(PricingClient.name);

  constructor(private readonly configService: ConfigService) {}

  quote(payload: QuoteRequest): Promise<PriceQuote> {
    return this.post<PriceQuote>('pricing/quote', payload);
  }

  settle(payload: SettleRequest): Promise<PriceSettlement> {
    return this.post<PriceSettlement>('pricing/settle', payload);
  }

  private async post<T>(path: string, payload: unknown): Promise<T> {
    const baseUrl = this.configService.getOrThrow<string>('MS_PRICING_URL');
    const internalApiKey =
      this.configService.getOrThrow<string>('INTERNAL_API_KEY');
    try {
      const response = await fetch(`${baseUrl}/${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-api-key': internalApiKey,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Motor tarifario respondió ${response.status}`);
      }
      return (await response.json()) as T;
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Fallo al llamar al motor tarifario (${path}): ${reason}`,
      );
      throw new ServiceUnavailableException(
        'El motor tarifario no está disponible',
      );
    }
  }
}
