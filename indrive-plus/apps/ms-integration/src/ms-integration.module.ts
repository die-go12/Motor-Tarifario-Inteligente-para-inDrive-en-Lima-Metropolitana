import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IntegrationModule } from './modules/integration/integration.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), IntegrationModule],
})
export class MsIntegrationModule {}
