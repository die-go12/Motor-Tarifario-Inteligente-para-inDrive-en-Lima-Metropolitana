# Sprint Backlog – Motor Tarifario Inteligente — inDrive

## MVP Lima Metropolitana | Duración: 8 meses | Presupuesto: USD $182,000

---

## Características del Producto (CAR)

| ID | Característica | Descripción |
|----|----------------|-------------|
| CAR-001 | Cálculo del rango pre-viaje | Pondera 7 variables y genera [mínimo, máximo] en menos de 5 segundos |
| CAR-002 | Visualización asimétrica | Pasajero ve solo el techo / Conductor ve solo el piso + aceptación bilateral |
| CAR-003 | Negociación asistida | Negociación dentro del rango sin revelar extremos |
| CAR-004 | Cálculo post-viaje + regla de pago | Aplica regla: max(mínimo, min(precio_real, máximo)) |
| CAR-005 | Filtro de anomalías | Descarta datos corruptos o inválidos |
| CAR-006 | Parametrización | Configuración de reglas, pesos y multiplicadores |
| CAR-007 | Registro y trazabilidad | Registro inmutable de todas las fases |
| CAR-008 | Reportes | Generación de métricas y análisis |
| CAR-009 | Integración externa | Google Maps, OSINERGMIN y tráfico en tiempo real |
| CAR-010 | Tolerancia a fallos | Degradación elegante ante fallos externos |

---

## Visión General del Sprint 1

| Sprint | Nombre | Historias | Story Points | Duración |
|--------|--------|-----------|--------------|----------|
| Sprint 1 | Fase Pre-viaje | US-001, US-002, US-003, US-004 | 16 SP | 2 semanas |

---

## Sprint 1 – Fase Pre-viaje

### Objetivo
Implementar el flujo completo de pre-viaje: solicitud de viaje, cálculo de rango tarifario, visualización asimétrica, negociación controlada y aceptación bilateral.

---

# US-001 – Solicitud de viaje con cálculo de rango (5 SP)

### Objetivo
Generar un rango tarifario inteligente en menos de 5 segundos.

| Tarea | Responsable | Estado |
|------|-------------|--------|
| Endpoint solicitud de viaje | Backend | Completado |
| Integración Google Maps (distancia y tiempo) | Backend | Pendiente |
| Integración OSINERGMIN (combustible) | Backend | Pendiente |
| API de tráfico en tiempo real | Backend | Pendiente |
| Algoritmo de cálculo de rango (7 variables) | Backend | En progreso |
| Manejo de fallos externos (degradación elegante) | Backend | En progreso |
| Pruebas unitarias e integración | QA | En progreso |

---

# US-002 – Visualización asimétrica del precio (4 SP)

### Objetivo
Mostrar información distinta según el rol del usuario.

| Tarea | Responsable | Estado |
|------|-------------|--------|
| Vista pasajero (solo máximo) | Frontend | En progreso |
| Vista conductor (solo mínimo) | Frontend | En progreso |
| Vista administrador (rango completo) | Frontend | En progreso |
| Control de acceso por roles | Frontend | En progreso |
| Pruebas de seguridad y autorización | QA | En progreso |

---

# US-003 – Negociación acotada dentro del rango (4 SP)

### Objetivo
Permitir negociación dentro de límites controlados del rango tarifario.

| Tarea | Responsable | Estado |
|------|-------------|--------|
| Endpoint de ofertas y contraofertas | Backend | Pendiente |
| Validación de rango permitido | Backend | Pendiente |
| Interfaz de negociación en tiempo real | Frontend | En progreso |
| Registro de ofertas (trazabilidad) | Backend | Pendiente |
| Gestión de contraofertas | Backend | Pendiente |
| Pruebas de límites y validaciones | QA | Pendiente |

---

# US-004 – Aceptación bilateral e inicio de viaje (3 SP)

### Objetivo
Formalizar el inicio del viaje mediante aceptación de ambas partes.

| Tarea | Responsable | Estado |
|------|-------------|--------|
| Endpoint aceptación bilateral | Backend | Pendiente |
| Máquina de estados del viaje | Backend | Completado |
| Registro de aceptación con timestamp | Backend | Pendiente |
| Sistema de notificaciones | Frontend | Pendiente |
| Activación de GPS | Backend | Pendiente |
| Cambio de estado a “En curso” | Backend | Pendiente |
| Pruebas de flujo completo end-to-end | QA | Pendiente |

---

## Resumen del Sprint 1

| Métrica | Valor |
|--------|------|
| Historias | 4 |
| Story Points | 16 SP |
| Tareas totales | 24 |
| Completadas | 2 |
| En progreso | 7 |
| Pendientes | 15 |

---

## Trazabilidad (CAR → US)

| CAR | Relación |
|-----|----------|
| CAR-001 | US-001 |
| CAR-002 | US-002 |
| CAR-003 | US-003 |
| CAR-007 | US-001 / US-003 / US-004 |
| CAR-009 | US-001 |
| CAR-002 (parcial UX) | US-002 |

---
