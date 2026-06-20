# Product Backlog – Motor Tarifario Inteligente — inDrive

## MVP Lima Metropolitana | Duración: 8 meses | Presupuesto: USD $182,000

---

## Características del Producto (CAR)

| ID | Característica | Descripción |
|----|----------------|-------------|
| CAR-001 | Cálculo del rango pre-viaje | Pondera 7 variables y genera [mínimo, máximo] en menos de 5 segundos |
| CAR-002 | Visualización asimétrica | Pasajero ve solo el techo / Conductor ve solo el piso + aceptación bilateral |
| CAR-003 | Negociación asistida | Negociación libre pero acotada dentro del rango sin revelar extremos |
| CAR-004 | Cálculo post-viaje + regla de pago | Aplica regla: max(mínimo, min(precio_real, máximo)) |
| CAR-005 | Filtro de anomalías | Descarta datos corruptos o inválidos |
| CAR-006 | Parametrización | Configuración de reglas, pesos y multiplicadores |
| CAR-007 | Registro y trazabilidad | Registro inmutable de todas las fases para auditoría |
| CAR-008 | Reportes | Generación de métricas y análisis del sistema |
| CAR-009 | Integración externa | Google Maps en vivo; OSINERGMIN y tráfico simulados (dato real local) |
| CAR-010 | Tolerancia a fallos | Degradación elegante ante fallos externos |

---

## Visión General del Product Backlog

| Sprint | Historias | Objetivo |
|--------|----------|----------|
| Sprint 1 | US-001, US-002, US-003, US-004 | Fase Pre-viaje |
| Sprint 2 | US-005, US-006, US-007, US-008 | Post-viaje + Administración |

---

## Historias de Usuario (Backlog)

---

## Sprint 1 – Fase Pre-viaje (CORE MVP)

### US-001: Solicitud de viaje con cálculo de rango

| Campo | Valor |
|------|------|
| Prioridad | 🔴 Alta |
| Story Points | 5 |
| Actor | Pasajero |
| CAR | CAR-001, CAR-009, CAR-010 |
| Dependencias | Ninguna |

### Descripción
Como pasajero quiero solicitar un viaje para que el sistema calcule un rango tarifario inteligente en menos de 5 segundos.

### Criterios de aceptación
- Calcula rango en < 5 segundos
- Usa Google Maps (o mock)
- Usa OSINERGMIN (o mock)
- Usa tráfico en tiempo real (o mock)
- Maneja fallos con degradación elegante

---

### US-002: Visualización asimétrica del precio

| Campo | Valor |
|------|------|
| Prioridad | 🔴 Alta |
| Story Points | 4 |
| Actor | Pasajero / Conductor |
| CAR | CAR-002 |
| Dependencias | US-001 |

### Descripción
Pasajero ve solo el máximo, conductor solo el mínimo. El rango completo nunca es visible simultáneamente.

### Criterios de aceptación
- Pasajero solo ve techo
- Conductor solo ve piso
- Admin ve rango completo
- No se expone rango completo en UI normal

---

### US-003: Negociación acotada dentro del rango

| Campo | Valor |
|------|------|
| Prioridad | 🔴 Alta |
| Story Points | 4 |
| Actor | Pasajero / Conductor |
| CAR | CAR-003, CAR-007 |
| Dependencias | US-001, US-002 |

### Descripción
Permitir negociación libre pero solo dentro del rango permitido.

### Criterios de aceptación
- Ofertas dentro del rango aceptadas
- Fuera del rango rechazadas
- Registro de todas las ofertas
- Permite contraofertas
- No expone extremos del rango

---

### US-004: Aceptación bilateral e inicio de viaje

| Campo | Valor |
|------|------|
| Prioridad | 🔴 Alta |
| Story Points | 3 |
| Actor | Pasajero / Conductor |
| CAR | CAR-002, CAR-007 |
| Dependencias | US-003 |

### Descripción
El viaje inicia solo cuando ambas partes aceptan el precio final.

### Criterios de aceptación
- Requiere aceptación bilateral
- Registra timestamp de aceptación
- Notifica a ambas partes
- Cambia estado a "EN_CURSO"
- Activa GPS

---

## Sprint 2 – (NO IMPLEMENTADO EN SPRINT 1)

---

### US-005: Recálculo post-viaje con GPS real

| Campo | Valor |
|------|------|
| Story Points | 5 |
| Dependencias | US-004 |

---

### US-006: Regla de pago invariante

| Campo | Valor |
|------|------|
| Story Points | 5 |
| Dependencias | US-005 |

---

### US-007: Configuración de parámetros

| Campo | Valor |
|------|------|
| Story Points | 3 |
| Dependencias | US-001 |

---

### US-008: Reportes y métricas

| Campo | Valor |
|------|------|
| Story Points | 5 |
| Dependencias | US-007 |

---

## Backlog Pendiente (Roadmap post-MVP)

> En Scrum, el Product Backlog conserva el **trabajo que aún falta**, ordenado por valor. Las historias entregadas (US-001…US-008) se liberaron al **Incremento**; los siguientes ítems quedan como backlog pendiente para después del MVP (no hay Sprint 3 en el curso).

| Orden | Ítem (PBI) | Tipo | CAR / Origen | Valor |
|----|------|------|------|------|
| 1 | Recálculo post-viaje con **GPS real** (hoy: precio ingresado) | Funcional | CAR-004 / US-005 | Alto |
| 2 | **Reportes avanzados**: desglose por zona y franja horaria, tiempos, filtros | Funcional | CAR-008 / US-008 | Alto |
| 3 | **Surge pricing real** (oferta/demanda en tiempo real) | Funcional | CAR-001 | Medio |
| 4 | Integración **en vivo** con API real de OSINERGMIN | Técnico | CAR-009 | Medio |
| 5 | API de **tráfico real** (TomTom/Waze) | Técnico | CAR-009 | Medio |
| 6 | **Pagos reales** | Funcional | CAR-004 | Medio |
| 7 | Migración del bus de eventos **Redis Pub/Sub → RabbitMQ** | Técnico | ADR-005 | Medio |
| 8 | **OpenSearch** para logs y trazabilidad | Técnico | CAR-007 | Bajo |
| 9 | **MFA** del administrador | Técnico (seguridad) | CAR-006 | Bajo |

> Justificación de estos diferimientos en [Sprint 2 §13](../Scrum/Sprints/sprint_2.md) y en la [Gestión de Cambio](../Presentacion_Final/gestion_de_cambio.md).

---

## Resumen del Product Backlog

| Métrica | Valor |
|--------|------|
| Historias liberadas al Incremento (US-001…US-008) | 8 (34 SP) |
| — entregadas en Sprint 1 (pre-viaje) | 4 (16 SP) |
| — entregadas en Sprint 2 (post-viaje + admin) | 4 (18 SP) |
| Ítems pendientes en el backlog (roadmap post-MVP) | 9 |

> **Estado del backlog al cierre:** las 8 historias del MVP están **liberadas al Incremento** (cumplen la Definition of Done); el Product Backlog conserva los **9 ítems de roadmap** como trabajo pendiente, ordenado por valor.

---

## Trazabilidad CAR → US

| CAR | Relación |
|-----|----------|
| CAR-001 | US-001 |
| CAR-002 | US-002, US-004 |
| CAR-003 | US-003 |
| CAR-004 | US-005, US-006 |
| CAR-007 | US-003, US-004 |
| CAR-009 | US-001 |
| CAR-010 | US-001 |
