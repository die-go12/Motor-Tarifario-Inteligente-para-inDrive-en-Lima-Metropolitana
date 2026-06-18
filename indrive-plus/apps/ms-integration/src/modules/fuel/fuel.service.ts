import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { DEFAULT_FUEL_TYPE, FUEL_PRICES_PER_GALLON } from './fuel-prices';

const CACHE_KEY_PREFIX = 'integration:fuel:price';
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

  async currentPrice(fuelType?: string): Promise<number> {
    const type = this.resolveFuelType(fuelType);
    const fallbackPrice = FUEL_PRICES_PER_GALLON[type] ?? this.defaultPrice;
    const cacheKey = `${CACHE_KEY_PREFIX}:${type}`;

    try {
      const cached = await this.client.get(cacheKey);
      if (cached !== null) {
        return Number(cached);
      }
      await this.client.set(cacheKey, fallbackPrice, 'EX', CACHE_TTL_SECONDS);
      return fallbackPrice;
    } catch {
      return fallbackPrice;
    }
  }

  private resolveFuelType(fuelType?: string): string {
    if (fuelType && fuelType in FUEL_PRICES_PER_GALLON) {
      return fuelType;
    }
    return DEFAULT_FUEL_TYPE;
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }
}
