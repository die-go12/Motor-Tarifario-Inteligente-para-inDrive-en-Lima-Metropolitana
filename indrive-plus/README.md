# inDrive+ — Backend (Motor Tarifario Inteligente)

Monorepo de microservicios en **NestJS (TypeScript)** para el Motor Tarifario Inteligente de inDrive+ en Lima Metropolitana.

El diferencial del sistema es un *pricing engine* que calcula un rango `[mínimo, máximo]` y lo muestra de forma **asimétrica**: el pasajero ve solo el techo, el conductor solo el piso. Al finalizar el viaje el pago se calcula con `pago = max(mínimo, min(precio_real, máximo))`.

## Microservicios

| Servicio | Puerto | Responsabilidad |
|----------|--------|-----------------|
| `api-gateway` | 3000 | Entrada REST del panel web (proxy, CORS, rate-limit) |
| `ms-base` | 3001 | Auth JWT, users, vehicles, trips, negociación, WebSocket |
| `ms-pricing` | 3002 | Motor tarifario (7 variables) + auditoría en Mongo |
| `ms-integration` | 3003 | Stubs de Maps/OSINERGMIN/tráfico + circuit breaker |
| `ms-reports` | 3004 | Read-model de reportes a partir de eventos |

**Persistencia:** PostgreSQL (transaccional, TypeORM) · MongoDB (auditoría del motor) · Redis (cache, estado online y bus de eventos Pub/Sub).

## Requisitos

- Node.js 20+
- PostgreSQL, MongoDB y Redis (o el `docker-compose.yml` de `docker/`)

## Puesta en marcha

```bash
npm install
cp .env.example .env      # ajusta credenciales, secretos y URLs

# arranque por servicio (modo watch)
npm run start:base
npm run start:gateway
npm run start:pricing
npm run start:integration
npm run start:reports
```

## Scripts útiles

```bash
npm run build     # compila los 5 servicios
npm test          # pruebas unitarias (Jest)
npm run lint      # ESLint
```

## Variables de entorno

Ver `.env.example`. Nunca se commitea el `.env` real. Claves relevantes:

- `POSTGRES_*`, `MONGO_URI`, `REDIS_*` — conexiones a las bases.
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — secretos de firma (distintos entre sí).
- `INTERNAL_API_KEY` — clave compartida ms-base ↔ ms-pricing para los endpoints internos `/pricing/quote` y `/pricing/settle`.
- `MS_*_URL` — URLs internas usadas por el gateway y por ms-base.
- `GATEWAY_CORS_ORIGINS` — orígenes permitidos por el gateway (separados por coma).

## Documentación

Arquitectura, requerimientos y Scrum: ver la carpeta [`../Documentación/`](../Documentación/README.md).
