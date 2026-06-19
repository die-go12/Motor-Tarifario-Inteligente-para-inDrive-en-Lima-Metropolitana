# ms-reports — instrucciones de contenerización

> Para la persona de Docker. El backend **no** edita `docker/docker-compose.yml`.
> Este servicio ya queda registrado en `nest-cli.json` y en el script `build` de
> `package.json`, así que `npm run build` genera `dist/apps/ms-reports/main`.

## Qué es
Microservicio de reportes/analítica. Se suscribe por **Redis Pub/Sub** a los
eventos que publica `ms-pricing` (`pricing.calculated`, `pricing.settled`,
`anomaly.detected`), arma su propio read-model en **MongoDB** y expone:

- `GET /reports/summary` (rol `admin` / `auditor`)

Puerto: **3004**. No usa PostgreSQL.

## 1. Agregar el servicio en `docker/docker-compose.yml`

```yaml
  ms-reports:
    <<: *backend-build
    container_name: indrive_ms_reports
    restart: unless-stopped
    command: node dist/apps/ms-reports/main
    environment:
      MS_REPORTS_PORT: 3004
      MONGO_URI: mongodb://mongo:27017/indrive_reports
      REDIS_HOST: redis
      REDIS_PORT: 6379
      JWT_ACCESS_SECRET: ${JWT_ACCESS_SECRET}
    ports:
      - "3004:3004"
    depends_on:
      mongo:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - indrive_network
```

## 2. Exponerlo por el gateway

En el servicio `api-gateway` del mismo compose, agregar la variable de entorno
y la dependencia:

```yaml
  api-gateway:
    environment:
      # ...las que ya existen...
      MS_REPORTS_URL: http://ms-reports:3004
    depends_on:
      # ...las que ya existen...
      ms-reports:
        condition: service_started
```

> El gateway lee `MS_REPORTS_URL` para proxear `/reports`. Si esa variable falta,
> el gateway **no arranca** (usa `getOrThrow`, igual que con `MS_BASE_URL` y
> `MS_PRICING_URL`).

## 3. Sin cambios en `Dockerfile`
La imagen compartida ya copia todo `dist/`; el `command` por servicio selecciona
el entrypoint. No hay que tocar el `Dockerfile` ni `.dockerignore`.
