import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MsIntegrationModule } from './ms-integration.module';

async function bootstrap() {
  const app = await NestFactory.create(MsIntegrationModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('inDrive+ · ms-integration')
    .setDescription(
      'Servicio de integración: Maps, OSINERGMIN y tráfico (stubs)',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const port = configService.get<number>('MS_INTEGRATION_PORT', 3003);
  await app.listen(port);
}
void bootstrap();
