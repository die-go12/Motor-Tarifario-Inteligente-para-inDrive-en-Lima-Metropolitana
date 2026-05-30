import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

const CACHE_KEY = 'integration:fuel:price';
const CACHE_TTL_SECONDS = 24 * 60 * 60;
const DEFAULT_FUEL_PRICE = 16.5;

@Injectable()
export class FuelService implements OnModuleDestroy {
  private readonly client: Redis;
  private readonly defaultPrice: number;

  constructor(configService: ConfigService) {
    this.client = new Redis({
      host: configService.getOrThrow<string>('REDIS_HOST'),
      port: configService.get<number>('REDIS_PORT', 6379),
    });
    this.defaultPrice = Number(
      configService.get('FUEL_PRICE_PER_GALLON', DEFAULT_FUEL_PRICE),
    );
  }

  async currentPrice(): Promise<number> {
    const cached = await this.client.get(CACHE_KEY);
    if (cached !== null) {
      return Number(cached);
    }
    await this.client.set(
      CACHE_KEY,
      this.defaultPrice,
      'EX',
      CACHE_TTL_SECONDS,
    );
    return this.defaultPrice;
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }
}
