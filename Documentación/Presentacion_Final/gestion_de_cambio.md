# Gestión de Cambio

> Registro **formal** de los cambios gestionados durante el desarrollo del MVP, siguiendo el proceso:
> **Identificación → Análisis de impacto → Evaluación y aprobación → Implementación → Seguimiento y validación.**
>
> Este documento cubre el **proceso de cambio** (cómo se gestionó cada cambio). La lista de funcionalidades futuras (roadmap) está en [Sprint 2 §13](../Scrum/Sprints/sprint_2.md).

---

## Resumen de cambios gestionados

| # | Cambio | De → A | Estado |
| --- | --- | --- | --- |
| 1 | Fuentes externas | APIs en vivo → dato real local + tráfico simulado | Implementado |
| 2 | Bus de eventos | RabbitMQ → Redis Pub/Sub | Implementado |
| 3 | Recálculo post-viaje | GPS real → precio real ingresado | Implementado |
| 4 | Alcance de servicios | ~7 servicios + OpenSearch/MFA → 4 + API Gateway | Implementado |
| 5 | Rango de negociación | Rango de ancho cero → spread mínimo garantizado | Implementado |

---

## Cambio 1 — Fuentes externas: APIs en tiempo real → datos oficiales locales
1. **Identificación:** el diseño inicial (CAR-009) contemplaba consumir APIs externas en tiempo real para combustible y tráfico.
2. **Análisis de impacto:** OSINERGMIN **no expone API pública en tiempo real**; las APIs de tráfico en vivo (TomTom/Waze) son **de pago**. Google Maps sí es viable. Afecta CAR-009 y las variables de combustible/tráfico del motor.
3. **Evaluación y aprobación:** se aprueba usar **dato real desde fuentes oficiales locales** (dataset OSINERGMIN / Datos Abiertos–Facilito) para combustible + **modelo simulado por hora/zona** para tráfico, manteniendo la interfaz preparada para conmutar a una API real.
4. **Implementación:** `FuelService` lee el precio de combustible por tipo desde el dataset local; tráfico simulado; Google Maps en vivo. El contrato de integración no cambió.
5. **Seguimiento y validación:** el motor calcula el rango con datos reales locales. Migración a API real = roadmap.

## Cambio 2 — Bus de eventos: RabbitMQ → Redis Pub/Sub
1. **Identificación:** el ADR-005 definía RabbitMQ como message broker del sistema de eventos.
2. **Análisis de impacto:** RabbitMQ agrega un componente de infraestructura adicional; Redis ya está en el stack (caché/sesiones). Afecta la comunicación asíncrona entre `ms-pricing`, auditoría y `ms-reports`.
3. **Evaluación y aprobación:** se aprueba implementar el bus con **Redis Pub/Sub** en el MVP; RabbitMQ queda como evolución.
4. **Implementación:** `ms-pricing` publica eventos (`pricing.calculated`, `pricing.settled`, `anomaly.detected`); auditoría y `ms-reports` los consumen.
5. **Seguimiento y validación:** flujo de eventos operativo. Documentación actualizada en ADR-005. Migración a RabbitMQ = roadmap.

## Cambio 3 — Recálculo post-viaje: GPS real → precio real ingresado
1. **Identificación:** CAR-004 contemplaba recalcular el `precio_real` con GPS real al finalizar el viaje.
2. **Análisis de impacto:** la captura/recálculo con GPS real requiere infraestructura no disponible en el MVP.
3. **Evaluación y aprobación:** se aprueba que el **conductor ingrese el precio real** al completar; el motor aplica la regla de pago sobre ese valor.
4. **Implementación:** la app captura `realPrice`; `ms-pricing` liquida con `pago = max(mínimo, min(precio_real, máximo))`.
5. **Seguimiento y validación:** liquidación correcta y persistida. Recálculo con GPS real = roadmap.

## Cambio 4 — Alcance de servicios e infraestructura
1. **Identificación:** la arquitectura proyectaba ~7 microservicios + OpenSearch + MFA del administrador.
2. **Análisis de impacto:** dividir todos los servicios y sumar OpenSearch/MFA excede el alcance y el tiempo del MVP.
3. **Evaluación y aprobación:** se aprueba consolidar en **4 microservicios de negocio + API Gateway**: anomalías y logs viven dentro de `ms-pricing` (auditoría) y los reportes en `ms-reports`. OpenSearch, MFA y el split adicional quedan diferidos.
4. **Implementación:** `api-gateway`, `ms-base`, `ms-pricing`, `ms-integration`, `ms-reports` operativos y orquestados con Docker.
5. **Seguimiento y validación:** sistema funcional end-to-end. Servicios e infraestructura restantes = roadmap.

## Cambio 5 — Negociación: rango de ancho cero → spread mínimo garantizado
1. **Identificación:** cuando los multiplicadores dinámicos (tráfico/hora/tiempo) eran 1.0, el motor producía un rango con **máximo igual al mínimo** (ancho cero); la negociación se rompía porque ninguna oferta podía caer dentro de `[X, X]`.
2. **Análisis de impacto:** afecta CAR-003 (negociación acotada). Sin una banda de precio no hay margen de negociación válido entre pasajero y conductor.
3. **Evaluación y aprobación:** se aprueba garantizar un **spread mínimo del rango** mediante un parámetro configurable (`minRangeRatio`, 20 % por defecto), respetando los topes existentes (×2.0, límites S/3–150 y ratio máximo ×3.5).
4. **Implementación:** `ms-pricing` calcula el máximo con un piso `máximo ≥ mínimo × minRangeRatio`; el parámetro vive en la configuración dinámica del motor.
5. **Seguimiento y validación:** las pruebas del motor cubren el caso sin *surge*; el rango siempre conserva una banda de negociación.
