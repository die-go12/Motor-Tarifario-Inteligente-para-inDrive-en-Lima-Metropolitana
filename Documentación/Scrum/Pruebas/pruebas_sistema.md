# Pruebas del sistema

> Responde a la pregunta **"¿cómo testearon su sistema?"**. Describe la **estrategia de pruebas por capas** (pirámide de pruebas) que aplicamos sobre el backend del MVP, qué cubre cada capa y cómo reproducirla.

---

## 1. Estrategia por capas (pirámide de pruebas)

De más cantidad/rápidas (base) a menos cantidad/lentas (cima):

| Capa | Qué valida | Estado |
| --- | --- | --- |
| **Unitarias (Jest)** | Lógica de negocio aislada, sin BD | ✅ Automatizadas |
| **Build / tipado estricto** | Compilación y contratos de tipos | ✅ Automatizado |
| **API (Postman / REST)** | Endpoints uno a uno | ✅ Manual |
| **Por rol (asimetría)** | Techo/piso según rol del JWT | ✅ Manual + unit |
| **Sistema end-to-end (smoke test)** | Flujo completo en vivo sobre Docker | ✅ Manual (guion §5) |

Principio: **muchas unitarias, pocas E2E**; el smoke test es el chequeo de confianza de release.

---

## 2. Pruebas unitarias (Jest)

Cubren la lógica de negocio crítica de forma aislada y determinista (sin BD ni red).

| Suite | Servicio | Qué prueba |
| --- | --- | --- |
| `payment-condition.spec.ts` | ms-base | Derivación de la condición de pago (FLOOR / WITHIN_RANGE / CEILING) |
| `offer-rules.spec.ts` | ms-base | Oferta válida solo dentro de `[mínimo, máximo]` |
| `trip-state-machine.spec.ts` | ms-base | Transiciones de estado válidas e inválidas |
| `trip.presenter.spec.ts` | ms-base | Visualización asimétrica por rol (techo/piso/admin) |
| `circuit-breaker.spec.ts` | ms-base | Tolerancia a fallos de servicios externos (CAR-010) |
| `pricing.service.spec.ts` | ms-pricing | Fórmula de 7 variables, topes/límites, regla de pago y detección de anomalías + severidad |
| `summarize-reports.spec.ts` | ms-reports | Agregación de reportes (demanda, ingresos, anomalías por severidad) |

**Cómo correrlas:**

```bash
cd indrive-plus
npx jest            # 31 pruebas / 7 suites
```

---

## 3. Verificación de build / tipado estricto

Con `strict: true` en TypeScript, la compilación es en sí una prueba de contratos:

```bash
cd indrive-plus
npm run build       # nest build de los 5 microservicios
```

Un cambio que rompa un contrato (DTO, entidad, evento) **no compila**.

---

## 4. Pruebas de API (Postman / REST)

Cada endpoint se prueba con una colección Postman: códigos de estado, validación de DTOs (`class-validator`), y guards de rol (403 cuando no corresponde). También permite simular datos de APIs externas (OSINERGMIN/tráfico) hacia los microservicios.

---

## 5. Prueba de sistema end-to-end (smoke test)

Verificación del **flujo completo en vivo** contra la infraestructura real (PostgreSQL + MongoDB + Redis) levantada con Docker. Es la evidencia de que las piezas funcionan integradas.

### Prerrequisitos
```bash
cd indrive-plus/docker
docker compose up -d      # postgres, mongo, redis, ms-base, ms-pricing, ms-integration, ms-reports, gateway
```
Rutas: la app móvil habla directo a **ms-base :3001**; el panel pasa por el **gateway :3000**. `ms-pricing :3002`, `ms-reports :3004`.

### Guion (orden)

1. **Registro / login** (pasajero, conductor, admin/auditor):
   ```bash
   curl -X POST :3001/auth/register -H "Content-Type: application/json" \
     -d '{"email":"pasajero@test.com","password":"Test1234","role":"passenger"}'
   curl -X POST :3001/auth/login    -H "Content-Type: application/json" \
     -d '{"email":"pasajero@test.com","password":"Test1234"}'   # -> accessToken
   ```

2. **Cotización asimétrica** (mismo viaje, distinto rol):
   ```bash
   curl -X POST :3001/trips/quote -H "Authorization: Bearer $PASAJERO" \
     -H "Content-Type: application/json" -d '{"origin":"Miraflores","destination":"San Isidro"}'
   #  passenger -> solo maximumPrice (techo)
   curl -X POST :3001/trips/quote -H "Authorization: Bearer $CONDUCTOR" ...
   #  driver    -> solo minimumPrice (piso)
   ```

3. **Solicitar viaje** (passenger) → emite `trip_created` (WebSocket):
   ```bash
   curl -X POST :3001/trips -H "Authorization: Bearer $PASAJERO" \
     -H "Content-Type: application/json" -d '{"origin":"Miraflores","destination":"San Isidro"}'
   ```

4. **Negociación acotada + aceptación bilateral** → estado `ASSIGNED`:
   ```bash
   curl -X POST :3001/trips/$TRIP/offers -H "Authorization: Bearer $CONDUCTOR" \
     -H "Content-Type: application/json" -d '{"amount":15.0}'              # rechaza fuera de rango
   curl -X POST :3001/trips/$TRIP/offers/$OFFER/accept -H "Authorization: Bearer $PASAJERO"
   ```

5. **Inicio** → `IN_PROGRESS`:
   ```bash
   curl -X PATCH :3001/trips/$TRIP/start -H "Authorization: Bearer $CONDUCTOR"
   ```

6. **Cierre + regla de pago** → `finalPrice`, `Payment` con condición, evento `pricing.settled` (+ `anomaly.detected` si aplica):
   ```bash
   curl -X PATCH :3001/trips/$TRIP/complete -H "Authorization: Bearer $CONDUCTOR" \
     -H "Content-Type: application/json" -d '{"realPrice":16.5}'
   ```

7. **Vistas de admin / auditor**:
   ```bash
   curl :3002/pricing/anomalies   -H "Authorization: Bearer $ADMIN"   # anomalías + severidad
   curl :3001/trips/all           -H "Authorization: Bearer $ADMIN"   # todos los viajes
   curl :3004/reports/summary     -H "Authorization: Bearer $ADMIN"   # demanda, ingresos, anomalías
   ```

8. **Parametrización (admin)** → la siguiente cotización/cierre lo refleja:
   ```bash
   curl -X PUT :3002/pricing/config -H "Authorization: Bearer $ADMIN" \
     -H "Content-Type: application/json" -d '{"trafficWeight":0.7,"anomalyHighDeviation":0.4}'
   ```

### Casos clave a evidenciar (regla de pago + anomalía)
| `realPrice` vs rango | Pago | Condición | Anomalía |
| --- | --- | --- | --- |
| dentro de `[mín, máx]` | `realPrice` | `WITHIN_RANGE` | no |
| `< mínimo` | `mínimo` | `FLOOR` | sí |
| `> máximo` | `máximo` | `CEILING` | sí |

---

## 6. Trazabilidad: prueba → CAR / HU

| Prueba | Evidencia |
| --- | --- |
| `pricing.service.spec` + smoke §2/§8 | CAR-001 / HU-07 (rango 7 variables) |
| `trip.presenter.spec` + smoke §2 | CAR-002 / HU-05, HU-06 (asimetría) |
| `offer-rules.spec` + smoke §4 | CAR-003 (negociación acotada) |
| `trip-state-machine.spec` + smoke §4–6 | máquina de estados del viaje |
| `payment-condition.spec` + smoke §6 | CAR-004 / HU-06 (regla de pago + condición) |
| `pricing.service.spec` (anomalías) + smoke §7 | CAR-005 (filtro de anomalías) |
| smoke §8 | CAR-006 / HU-07, US-007 (parametrización, umbrales) |
| `summarize-reports.spec` + smoke §7 | CAR-008 / US-008 (reportes) |
| `circuit-breaker.spec` | CAR-010 (tolerancia a fallos) |

---

## 7. Roadmap de pruebas (trabajo futuro)

Priorizado de mayor a menor retorno:

1. **E2E automatizado con Supertest** (ya está como dependencia): automatizar el guion §5, empezando por el flujo de asimetría.
2. **Integración con Testcontainers**: PostgreSQL/Mongo/Redis reales y efímeros dentro de la suite.
3. **CI gating** (GitHub Actions): correr unitarias + E2E en cada PR antes de mergear.
4. **Pruebas de carga** (k6 / Artillery): validar el SLO de cotización < 5 s (CAR-001).
5. **Pruebas de seguridad**: roles/JWT, rate-limit y validación de entrada.
