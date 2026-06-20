import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { ApiGatewayModule } from './api-gateway.module';

const BASE_ROUTES = ['/auth', '/users', '/vehicles', '/trips', '/audit'];
const PRICING_ROUTES = ['/pricing/config', '/pricing/anomalies'];
const REPORTS_ROUTES = ['/reports'];

const matches = (prefixes: string[]) => (pathname: string) =>
  prefixes.some((prefix) => pathname.startsWith(prefix));

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule, { bodyParser: false });
  const configService = app.get(ConfigService);

  app.enableCors();

  app.use(
    createProxyMiddleware({
      target: configService.getOrThrow<string>('MS_BASE_URL'),
      changeOrigin: true,
      pathFilter: matches(BASE_ROUTES),
    }),
  );
  app.use(
    createProxyMiddleware({
      target: configService.getOrThrow<string>('MS_PRICING_URL'),
      changeOrigin: true,
      pathFilter: matches(PRICING_ROUTES),
    }),
  );
  app.use(
    createProxyMiddleware({
      target: configService.getOrThrow<string>('MS_REPORTS_URL'),
      changeOrigin: true,
      pathFilter: matches(REPORTS_ROUTES),
    }),
  );

  const port = configService.get<number>('API_GATEWAY_PORT', 3000);
  await app.listen(port);
}
void bootstrap();
