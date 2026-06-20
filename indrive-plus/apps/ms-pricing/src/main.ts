import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MsPricingModule } from './ms-pricing.module';

async function bootstrap() {
  const app = await NestFactory.create(MsPricingModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('inDrive+ · ms-pricing')
    .setDescription('Motor tarifario: cotización de rango y regla de pago')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const port = configService.get<number>('MS_PRICING_PORT', 3002);
  await app.listen(port);
}
void bootstrap();
