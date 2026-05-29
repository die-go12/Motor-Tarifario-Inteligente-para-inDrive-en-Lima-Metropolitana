import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { PricingChannel } from '@app/shared';

@Injectable()
export class EventsPublisher implements OnModuleDestroy {
  private readonly client: Redis;

  constructor(configService: ConfigService) {
    this.client = new Redis({
      host: configService.getOrThrow<string>('REDIS_HOST'),
      port: configService.get<number>('REDIS_PORT', 6379),
    });
  }

  async publish(channel: PricingChannel, payload: unknown): Promise<void> {
    await this.client.publish(channel, JSON.stringify(payload));
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }
}
