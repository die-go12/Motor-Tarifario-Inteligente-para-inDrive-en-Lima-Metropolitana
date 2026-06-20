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

## Resumen del Product Backlog

| Métrica | Valor |
|--------|------|
| Total historias | 8 |
| Sprint 1 | 4 historias |
| Sprint 2 | 4 historias |
| Total Story Points | 34 |

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
