# Sprint 2 – Fase Post-viaje y Administración

## Información General

| Elemento | Valor |
|-----------|---------|
| Sprint | Sprint 2 |
| Objetivo | Implementar la fase post-viaje, la regla de pago invariante, el filtro de anomalías y el panel administrativo |
| Estado | 🟡 En Progreso |
---

# Objetivo del Sprint

Desarrollar las funcionalidades posteriores a la finalización del viaje, permitiendo recalcular el precio utilizando datos GPS reales, aplicar la regla de pago establecida por el motor tarifario, almacenar información histórica para auditoría y habilitar herramientas administrativas para la configuración y monitoreo del sistema.

---

# Historias de Usuario Incluidas

| ID | Historia | Story Points |
|------|-----------|---------------|
| US-005 | Recálculo post-viaje con GPS real | 5 SP |
| US-006 | Aplicación de la regla de pago invariante | 5 SP |
| US-007 | Configuración de parámetros desde panel administrativo | 3 SP |
| US-008 | Visualización de reportes y métricas | 5 SP |

**Total:** 18 Story Points

---

# Características Relacionadas

| CAR | Descripción |
|-------|-------------|
| CAR-004 | Cálculo post-viaje y regla de pago |
| CAR-005 | Filtro de anomalías |
| CAR-006 | Parametrización |
| CAR-007 | Registro y trazabilidad |
| CAR-008 | Reportes |
| CAR-010 | Tolerancia a fallos |

---

# Tareas del Sprint

## US-005 – Recálculo Post-viaje con GPS Real

| ID | Tarea | Responsable | Estado |
|------|---------|------------|----------|
| S2-T01 | Implementar servicio de captura GPS continua | Backend | ⚪ Pendiente |
| S2-T02 | Implementar cálculo de distancia real | Backend | ⚪ Pendiente |
| S2-T03 | Implementar cálculo de tiempo real | Backend | 🟡 En Progreso |
| S2-T04 | Implementar detección de desvíos y paradas | Backend | ⚪ Pendiente |
| S2-T05 | Implementar recálculo de precio real | Backend | ⚪ Pendiente |
| S2-T06 | Pruebas con datos reales | QA | ⚪ Pendiente |

---

## US-006 – Regla de Pago Invariante

### Fórmula Principal

La regla de negocio definida para el proyecto es:

:contentReference[oaicite:0]{index=0}

---

| ID | Tarea | Responsable | Estado |
|------|---------|------------|----------|
| S2-T07 | Implementar función de regla de pago | Backend | 🟡 En Progreso |
| S2-T08 | Implementar los tres escenarios de pago | Backend | 🟡 En Progreso |
| S2-T09 | Registrar condición aplicada en auditoría | Backend | ⚪ Pendiente |
| S2-T10 | Integración con servicio de pagos | Backend | ⚪ Pendiente |
| S2-T11 | Pruebas de escenarios | QA | ⚪ Pendiente |

---

## US-007 – Configuración de Parámetros

| ID | Tarea | Responsable | Estado |
|------|---------|------------|----------|
| S2-T12 | CRUD de parámetros | Backend | ⚪ Pendiente |
| S2-T13 | Diseño del panel administrativo | Frontend | 🟡 En Progreso |
| S2-T14 | Formularios de configuración | Frontend | ⚪ Pendiente |
| S2-T15 | Registro de cambios en auditoría | Backend | ⚪ Pendiente |
| S2-T16 | Pruebas funcionales | QA | ⚪ Pendiente |

---

## US-008 – Reportes y Métricas

| ID | Tarea | Responsable | Estado |
|------|---------|------------|----------|
| S2-T17 | Consultas de demanda por zona | Backend | ⚪ Pendiente |
| S2-T18 | Cálculo de precios promedio | Backend | ⚪ Pendiente |
| S2-T19 | Reportes de anomalías | Backend | ⚪ Pendiente |
| S2-T20 | Dashboard administrativo | Frontend | ⚪ Pendiente |
| S2-T21 | Filtros por fecha y zona | Frontend | ⚪ Pendiente |
| S2-T22 | Pruebas de reportes | QA | ⚪ Pendiente |

---

# Arquitectura Involucrada

## Backend

- Node.js
- NestJS
- PostgreSQL
- MongoDB
- Redis

### Responsabilidades

- Recalcular tarifas post-viaje.
- Aplicar regla de pago.
- Registrar auditorías.
- Gestionar parámetros administrativos.
- Generar métricas y reportes.

---

## Frontend

### Aplicación Móvil

- React Native
- Expo
- TypeScript

### Panel Administrativo

- React
- TypeScript

### Responsabilidades

- Configuración de parámetros.
- Visualización de reportes.
- Monitoreo operativo.

---

## DevOps

### Docker Compose

Servicios desplegados:

- PostgreSQL
- MongoDB
- Redis


# Riesgos del Sprint

| Riesgo | Impacto | Mitigación |
|----------|----------|------------|
| Errores en cálculos GPS | Alto | Validación con rutas simuladas |
| Datos inconsistentes | Medio | Filtro de anomalías |
| Problemas de rendimiento | Medio | Uso de Redis |
| Fallas de APIs externas | Alto | Circuit Breaker y Cache |

---

# Resultado Esperado

Al finalizar el Sprint 2 el sistema deberá ser capaz de:

- Recalcular tarifas utilizando GPS real.
- Aplicar la regla de pago definida.
- Detectar datos anómalos.
- Registrar auditorías completas.
- Configurar parámetros desde el panel administrativo.
- Generar reportes operativos.
- Ejecutarse localmente mediante Docker Compose.

---

# Estado General

| Área | Estado |
|--------|---------|
| Backend | 🟡 En Desarrollo |
| Frontend | 🟡 En Desarrollo |
| Docker | 🟢 Operativo |
| QA | ⚪ Pendiente |
| Documentación | 🟢 Actualizada |
