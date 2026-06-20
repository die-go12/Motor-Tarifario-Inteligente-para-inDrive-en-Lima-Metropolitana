# Sprint Backlog – Motor Tarifario Inteligente — inDrive

## MVP Lima Metropolitana | Duración: 8 meses | Presupuesto: USD $182,000

---

## 🧩 Características del Producto (CAR)

| ID | Característica | Descripción |
|----|---------------|-------------|
| CAR-001 | Cálculo del rango pre-viaje | Pondera 7 variables y genera [mínimo, máximo] en menos de 5 segundos |
| CAR-002 | Visualización asimétrica | Pasajero ve solo el techo / Conductor ve solo el piso + aceptación bilateral |
| CAR-003 | Negociación asistida | Negociación dentro del rango sin revelar extremos |
| CAR-004 | Cálculo post-viaje + regla de pago | Aplica regla: max(mínimo, min(precio_real, máximo)) |
| CAR-005 | Filtro de anomalías | Descarta datos corruptos o inválidos |
| CAR-006 | Parametrización | Configuración de reglas, pesos y multiplicadores |
| CAR-007 | Registro y trazabilidad | Registro inmutable de todas las fases |
| CAR-008 | Reportes | Generación de métricas y análisis |
| CAR-009 | Integración externa | Google Maps en vivo; OSINERGMIN y tráfico simulados (dato real local) |
| CAR-010 | Tolerancia a fallos | Degradación elegante ante fallos externos |

---

## 📌 Visión General

| Sprint | Nombre | Historias | Story Points | Estado |
|--------|--------|-----------|--------------|--------|
| Sprint 1 | Fase Pre-viaje | US-001, US-002, US-003, US-004 | 16 SP | ✅ Completado |
| Sprint 2 | Post-viaje + Administración | US-005, US-006, US-007, US-008 | 18 SP | ✅ Completado |

> Este documento detalla el **Sprint Backlog del Sprint 2** (sprint en curso al cierre del proyecto). El detalle del Sprint 1 se conserva en su [retrospectiva](../Scrum/Retrospectivas/retrospective.md) y en el incremento ya integrado a `main`.

---

## 🎯 Sprint Goal (Sprint 2)

Consolidar el MVP integrado: liquidación post-viaje con la regla de pago invariante, parametrización y simulación del motor desde el panel administrativo, y registro/reportes para auditoría.

---

# 🧾 US-005 – Recálculo post-viaje (5 SP)

### Objetivo
Obtener el precio real del servicio al finalizar el viaje para alimentar la regla de pago.

| Tarea | Responsable | Estado |
|------|-------------|--------|
| Captura del precio real al completar el viaje | Móvil | Done |
| Endpoint de liquidación (`/settle`) | Backend | Done |
| Persistencia del registro post-viaje | Backend | Done |

> **Alcance ajustado:** el recálculo con GPS real se reemplazó por el precio real ingresado por el conductor; el GPS real queda en el roadmap (ver [Gestión de Cambio](../Presentacion_Final/gestion_de_cambio.md)).

---

# 🧾 US-006 – Aplicación de la regla de pago invariante (5 SP)

### Objetivo
Aplicar `pago = max(mínimo, min(precio_real, máximo))` protegiendo bilateralmente a pasajero y conductor.

| Tarea | Responsable | Estado |
|------|-------------|--------|
| Implementación de la regla de pago en `ms-pricing` | Backend | Done |
| Liquidación asimétrica por rol (cada uno ve solo su límite garantizado) | Backend / Móvil | Done |
| Persistencia del pago al completar el viaje | Backend | Done |
| Envío del `precio_real` al filtro de anomalías | Backend | Done |

---

# 🧾 US-007 – Configuración de parámetros desde panel admin (3 SP)

### Objetivo
Ajustar los pesos, el multiplicador de tráfico y los umbrales del motor sin desplegar código.

| Tarea | Responsable | Estado |
|------|-------------|--------|
| Endpoint `GET/PUT /pricing/config` | Backend | Done |
| Editor visual de parámetros (valores reales del motor) | Panel | Done |
| Umbrales de anomalías configurables (CA-007-03) | Backend / Panel | Done |
| Simulador de oferta/demanda | Panel | Done |
| Control de acceso por rol (admin escribe / auditor solo lee) | Backend | Done |

---

# 🧾 US-008 – Visualización de reportes y métricas (5 SP)

### Objetivo
Visualizar el estado del sistema para la toma de decisiones del administrador.

| Tarea | Responsable | Estado |
|------|-------------|--------|
| Microservicio `ms-reports` (read-model por eventos Redis Pub/Sub) | Backend | Done |
| `GET /reports/summary` (admin/auditor) + `GET /trips/all` (admin) | Backend | Done |
| Integración visual de reportes y auditoría de anomalías | Panel | Done |
| Reportes avanzados (zona/franja horaria, tiempos, filtros) | — | To Do (roadmap) |

---

## 📊 Resumen del Sprint 2

| Métrica | Valor |
|--------|------|
| Historias | 4 (US-005 … US-008) |
| Story Points | 18 SP |
| Tareas totales | 16 |
| Done | 15 |
| Diferido a roadmap | 1 |

---

## 🔗 Trazabilidad (CAR → US)

| CAR | Relación |
|-----|----------|
| CAR-004 | US-005, US-006 |
| CAR-005 | US-006 (filtro de anomalías) |
| CAR-006 | US-007 |
| CAR-007 | US-005, US-006, US-007, US-008 |
| CAR-008 | US-008 |
