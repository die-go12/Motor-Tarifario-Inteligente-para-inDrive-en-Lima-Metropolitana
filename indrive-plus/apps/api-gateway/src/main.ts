import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { ServerResponse } from 'http';
import { ApiGatewayModule } from './api-gateway.module';

const BASE_ROUTES = ['/auth', '/users', '/vehicles', '/trips', '/audit'];
const PRICING_ROUTES = ['/pricing/config', '/pricing/anomalies'];
const REPORTS_ROUTES = ['/reports'];
const PROXY_TIMEOUT_MS = 30000;
const DEFAULT_CORS_ORIGINS = ['http://localhost:8080', 'http://localhost:5173'];

const logger = new Logger('ApiGateway');

const matches = (prefixes: string[]) => (pathname: string) =>
  prefixes.some((prefix) => pathname.startsWith(prefix));

const parseCorsOrigins = (raw?: string): string[] => {
  const origins = (raw ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  return origins.length > 0 ? origins : DEFAULT_CORS_ORIGINS;
};

const proxyTo = (target: string, prefixes: string[]): Options =>
  ({
    target,
    changeOrigin: true,
    pathFilter: matches(prefixes),
    proxyTimeout: PROXY_TIMEOUT_MS,
    timeout: PROXY_TIMEOUT_MS,
    on: {
      error: (error: Error, _req: unknown, res: unknown) => {
        logger.error(`Proxy error hacia ${target}: ${error.message}`);
        const response = res as ServerResponse;
        if (typeof response.writeHead === 'function' && !response.headersSent) {
          response.writeHead(502, { 'Content-Type': 'application/json' });
          response.end(
            JSON.stringify({
              statusCode: 502,
              message: 'Servicio no disponible',
            }),
          );
        }
      },
    },
  }) as Options;

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule, { bodyParser: false });
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: parseCorsOrigins(configService.get<string>('GATEWAY_CORS_ORIGINS')),
    credentials: true,
  });

  app.use(
    createProxyMiddleware(
      proxyTo(configService.getOrThrow<string>('MS_BASE_URL'), BASE_ROUTES),
    ),
  );
  app.use(
    createProxyMiddleware(
      proxyTo(
        configService.getOrThrow<string>('MS_PRICING_URL'),
        PRICING_ROUTES,
      ),
    ),
  );
  app.use(
    createProxyMiddleware(
      proxyTo(
        configService.getOrThrow<string>('MS_REPORTS_URL'),
        REPORTS_ROUTES,
      ),
    ),
  );

  const port = configService.get<number>('API_GATEWAY_PORT', 3000);
  await app.listen(port);
}
void bootstrap();
