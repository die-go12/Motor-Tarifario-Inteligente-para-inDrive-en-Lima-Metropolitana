# Sprint Planning – Sprint 2: Post-viaje + Administración

## Información General

| Elemento | Descripción |
|----------|-------------|
| Proyecto | Motor Tarifario Inteligente para inDrive en Lima Metropolitana |
| Sprint | Sprint 2 |
| Duración | 3 semanas |
| Metodología | Scrum |

---

## Sprint Goal

Consolidar el MVP integrado: liquidación post-viaje con la regla de pago invariante, parametrización y simulación del motor desde el panel administrativo, y registro/reportes para auditoría.

---

## Historias de Usuario del Sprint

| ID | Historia | Prioridad | Story Points |
|----|----------|-----------|--------------|
| US-005 | Recálculo post-viaje | Alta | 5 SP |
| US-006 | Regla de pago invariante | Alta | 5 SP |
| US-007 | Configuración y simulación desde el panel | Alta | 3 SP |
| US-008 | Reportes y auditoría | Media | 5 SP |

**Total comprometido: 18 SP**

---

## Sprint Backlog (Resumen Planificado)

### US-005 – Recálculo post-viaje

**Objetivo:** Obtener el precio real del servicio al finalizar el viaje para alimentar la regla de pago.

**Tareas:**
- Captura del precio real al completar el viaje (app móvil)
- Endpoint de liquidación (`/settle`)
- Persistencia del registro post-viaje
- Recálculo con GPS real (evaluado; diferido por infraestructura no disponible en el MVP)

---

### US-006 – Regla de pago invariante

**Objetivo:** Aplicar automáticamente `pago = max(mínimo, min(precio_real, máximo))` para proteger a ambas partes sin reclamos manuales.

**Tareas:**
- Implementación de la fórmula de pago invariante
- Persistencia del pago al completar el viaje
- Liquidación asimétrica por rol (cada uno ve solo su límite garantizado)
- Captura del precio real desde la app
- Pruebas de la regla de pago en los tres escenarios (por debajo del mínimo, dentro del rango, por encima del máximo)

---

### US-007 – Configuración y simulación desde el panel

**Objetivo:** Permitir al administrador parametrizar el motor tarifario (pesos, umbrales, multiplicadores) y simular escenarios de oferta/demanda sin necesidad de despliegue.

**Tareas:**
- Editor de configuración (`/pricing/config`) con valores reales del motor (costo por km, consumo de combustible, costo por capacidad, peso histórico)
- Umbrales de anomalías configurables (severidad media/alta)
- Simulador con controles de oferta/demanda que ajustan el factor hora/demanda en vivo
- Validación y persistencia de la configuración en backend
- Pruebas de persistencia tras guardado y recarga

---

### US-008 – Reportes y auditoría

**Objetivo:** Registrar todas las fases del sistema para trazabilidad y exponer métricas agregadas para administración y auditoría.

**Tareas:**
- Microservicio `ms-reports` (read-model por eventos vía Redis Pub/Sub)
- Endpoint `GET /reports/summary` (admin/auditor) y `GET /trips/all` (admin)
- Persistencia de cálculos y anomalías en MongoDB por eventos
- Acceso de solo lectura para el rol auditor (frontend y backend)
- Reportes avanzados por zona/franja horaria (evaluados; diferidos a roadmap por alcance y tiempo del MVP)

---

## Decisiones técnicas relevantes para el sprint

| Decisión | Resumen | Referencia |
|---|---|---|
| Consolidación de microservicios | Anomalías y Logs se integran dentro de `ms-pricing` en lugar de servicios independientes, para reducir complejidad operativa del MVP local | ADR-001 / Gestión de Cambio 4 |
| Bus de eventos | Redis Pub/Sub en lugar de RabbitMQ (ya disponible en el stack, menor latencia, sin infraestructura nueva) | ADR-005 / Gestión de Cambio 2 |
| Base de datos para auditoría | MongoDB cubre `pricing_logs`, `anomaly_logs` y `pricing_history`; OpenSearch queda en roadmap | ADR-004 |
| Autenticación y roles | JWT (access token *stateless* + refresh con rotación `jti`) y RBAC con 4 roles (passenger, driver, admin, auditor); MFA y Keycloak quedan en roadmap | ADR-008 / Gestión de Cambio |

---

## Definition of Done (DoD)

Una historia se considera terminada cuando:
- Código implementado y funcional
- Pull Request aprobado y mergeado a `main`
- Pruebas manuales (QA) ejecutadas y documentadas con evidencia
- Criterios de aceptación cumplidos
- Documentación técnica actualizada
- Desplegado y verificado en entorno Docker

---

## Resultado Esperado

Al finalizar el Sprint 2 el sistema permitirá:
- Recalcular y liquidar el pago real de un viaje aplicando la regla de pago invariante
- Configurar desde el panel administrativo los pesos reales del motor tarifario, sin necesidad de despliegue
- Simular el efecto de la oferta y demanda sobre el rango de precios en vivo
- Consultar reportes agregados de demanda, ingresos y anomalías
- Acceder al sistema con un rol de Auditor de solo lectura, separado del rol Administrador

---

## Alcance ajustado durante el sprint

Dos componentes del alcance original se ajustaron mediante el proceso de gestión de cambio, documentado en cada ADR correspondiente:

- **US-005**: el recálculo con GPS real no estaba disponible en la infraestructura del MVP; se entregó con el precio real ingresado manualmente por el conductor, manteniendo intacta la regla de pago invariante.
- **US-008**: los reportes avanzados (desglose por zona, franja horaria y filtros) se difirieron a roadmap; se entregó el resumen agregado vía `GET /reports/summary`.

El valor central de ambas historias se entregó completo; solo se ajustó el nivel de detalle de dos funcionalidades secundarias.
