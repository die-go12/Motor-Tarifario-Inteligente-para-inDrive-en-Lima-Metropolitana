# Sprint Backlog

## Motor Tarifario Inteligente — inDrive

<div align="center">

*MVP Lima Metropolitana | Duración: 8 meses | Presupuesto: USD $182,000*

</div>

---

##  Características del Producto (CAR)

| ID | Característica | Descripción |
| :--- | :--- | :--- |
| **CAR-001** | Cálculo del rango pre-viaje | Pondera 7 variables y genera `[mínimo, máximo]` en menos de 5 segundos |
| **CAR-002** | Visualización asimétrica | Pasajero ve solo el **techo** / Conductor ve solo el **piso** + aceptación bilateral |
| **CAR-003** | Negociación asistida | Negociación libre pero acotada dentro del rango, sin revelar extremos |
| **CAR-004** | Cálculo post-viaje + regla de pago | Recalcula con GPS real y aplica `pago = max(mínimo, min(precio_real, máximo))` |
| **CAR-005** | Filtro de anomalías | Protege el histórico descartando datos corruptos o inválidos |
| **CAR-006** | Parametrización | Configuración de reglas, pesos y multiplicadores desde panel admin |
| **CAR-007** | Registro y trazabilidad | Registro inmutable de todas las fases para auditoría |
| **CAR-008** | Reportes | Generación de métricas para control y toma de decisiones |
| **CAR-009** | Integración externa | Conexión con Google Maps, OSINERGMIN y APIs de tráfico |
| **CAR-010** | Tolerancia a fallos | Degradación elegante ante fallos de servicios externos |

---

## Índice

1. [Visión General de Sprints](#visión-general-de-sprints)
2. [Sprint 1: Fase Pre-viaje](#sprint-1-fase-pre-viaje)
3. [Sprint 2: Fase Post-viaje + Administración](#sprint-2-fase-post-viaje--administración)
4. [Resumen de Sprints](#resumen-de-sprints)

---

## Visión General de Sprints

| Sprint | Nombre | Historias | Story Points | Duración estimada |
| :--- | :--- | :--- | :--- | :--- |
| **Sprint 1** | Fase Pre-viaje | US-001, US-002, US-003, US-004 | 16 SP | 2 semanas |
| **Sprint 2** | Fase Post-viaje + Administración | US-005, US-006, US-007, US-008 | 18 SP | 2 semanas |

---

## Sprint 1: Fase Pre-viaje

**Objetivo del Sprint:**  
Implementar la fase pre-viaje completa, incluyendo cálculo de rango con 7 variables, visualización asimétrica, negociación acotada y aceptación bilateral.

| ID | Tarea | Product Backlog relacionado | Responsable | Prioridad | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| S1-T01 | Implementar endpoint de solicitud de viaje | US-001 | Backend | 🔴 Alta | 🟡 En Progreso |
| S1-T02 | Integrar Google Maps Distance API | US-001 | Backend | 🔴 Alta | 🟡 En Progreso |
| S1-T03 | Integrar OSINERGMIN API con caché de 24h | US-001 | Backend | 🔴 Alta |🟡 En Progreso |
| S1-T04 | Implementar lógica de ponderación de 7 variables | US-001 | Backend | 🔴 Alta | 🟡 En Progreso |
| S1-T05 | Implementar timeout y circuit breaker para APIs externas | US-001 | DevOps | 🔴 Alta | 🟡 En Progreso |
| S1-T06 | Pruebas unitarias e integración de US-001 | US-001 | QA | 🔴 Alta | 🟡 En Progreso |
| S1-T08 | Diseñar componente de visualización para pasajero (techo) | US-002 | Frontend | 🔴 Alta | 🟡 En Progreso |
| S1-T09 | Diseñar componente de visualización para conductor (piso) | US-002 | Frontend | 🔴 Alta | 🟡 En Progreso |
| S1-T10 | Implementar panel admin para visualizar rango completo | US-002 | Frontend | 🔴 Alta | 🟡 En Progreso |
| S1-T11 | Pruebas de acceso por rol | US-002 | QA | 🟠 Media |🟡 En Progreso |
| S1-T12 | Implementar lógica de validación de ofertas | US-003 | Backend | 🔴 Alta | 🟡 En Progreso |
| S1-T13 | Crear endpoint para recibir ofertas | US-003 | Backend | 🔴 Alta | 🟡 En Progreso |
| S1-T14 | Implementar registro de ofertas en logs (CAR-007) | US-003 | Backend | 🟠 Media | 🟡 En Progreso |
| S1-T15 | Diseñar interfaz de chat/negociación | US-003 | Frontend | 🔴 Alta | 🟡 En Progreso |
| S1-T16 | Pruebas de límites del rango | US-003 | QA | 🔴 Alta | ⚪ Pendiente |
| S1-T17 | Implementar endpoint de aceptación bilateral | US-004 | Backend | 🔴 Alta | 🟡 En Progreso|
| S1-T18 | Implementar máquina de estados del viaje | US-004 | Backend | 🔴 Alta | 🟡 En Progreso |
| S1-T19 | Implementar notificaciones push | US-004 | Frontend | 🟠 Media | ⚪ Pendiente|
| S1-T20 | Activar servicio de captura GPS | US-004 | Backend | 🔴 Alta | ⚪ Pendiente|
| S1-T21 | Pruebas de flujo completo | US-004 | QA | 🔴 Alta | ⚪ Pendiente |

---

## Sprint 2: Fase Post-viaje + Administración

**Objetivo del Sprint:**  
Implementar la fase post-viaje (recálculo GPS, regla de pago invariante, filtro de anomalías) y el panel de administración (configuración de parámetros y reportes).

| ID | Tarea | Product Backlog relacionado | Responsable | Prioridad | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| S2-T01 | Implementar servicio de captura GPS continua | US-005 | Backend | 🔴 Alta |  ⚪ Pendiente |
| S2-T02 | Implementar cálculo de distancia real desde coordenadas | US-005 | Backend | 🔴 Alta |  ⚪ Pendiente |
| S2-T03 | Implementar cálculo de tiempo real | US-005 | Backend | 🔴 Alta | 🟡 En Progreso |
| S2-T04 | Implementar detección de paradas/desvíos | US-005 | Backend | 🟠 Media | ⚪ Pendiente |
| S2-T05 | Implementar recálculo de `precio_real` | US-005 | Backend | 🔴 Alta | ⚪ Pendiente  |
| S2-T06 | Pruebas con datos reales | US-005 | QA | 🔴 Alta | ⚪ Pendiente |
| S2-T07 | Implementar función de regla de pago | US-006 | Backend | 🔴 Alta | 🟡 En Progreso |
| S2-T08 | Implementar los 3 escenarios de la regla | US-006 | Backend | 🔴 Alta | 🟡 En Progreso |
| S2-T09 | Registrar condición aplicada en logs | US-006 | Backend | 🟠 Media | ⚪ Pendiente |
| S2-T10 | Integrar con servicio de pagos | US-006 | Backend | 🔴 Alta | ⚪ Pendiente |
| S2-T11 | Pruebas de los 3 escenarios | US-006 | QA | 🔴 Alta | ⚪ Pendiente |
| S2-T12 | Implementar CRUD de parámetros en backend | US-007 | Backend | 🟠 Media | ⚪ Pendiente |
| S2-T13 | Diseñar interfaz de panel admin | US-007 | Frontend | 🟠 Media | 🟡 En Progreso |
| S2-T14 | Implementar formularios de configuración | US-007 | Frontend | 🟠 Media | ⚪ Pendiente |
| S2-T15 | Implementar registro de cambios en logs | US-007 | Backend | 🟠 Media | ⚪ Pendiente |
| S2-T16 | Pruebas de configuración | US-007 | QA | 🟠 Media | ⚪ Pendiente |
| S2-T17 | Implementar consultas de demanda por zona | US-008 | Backend | 🟠 Media | ⚪ Pendiente |
| S2-T18 | Implementar cálculos de precios promedio | US-008 | Backend | 🟠 Media | ⚪ Pendiente |
| S2-T19 | Implementar reportes de anomalías | US-008 | Backend | 🟠 Media | ⚪ Pendiente |
| S2-T20 | Diseñar dashboard de reportes | US-008 | Frontend | 🟠 Media | ⚪ Pendiente |
| S2-T21 | Implementar filtros por fecha y zona | US-008 | Frontend | 🟠 Media | ⚪ Pendiente |
| S2-T22 | Pruebas de reportes | US-008 | QA | 🟠 Media | ⚪ Pendiente |

---

## Resumen de Sprints

### Sprint 1: Fase Pre-viaje

| Métrica | Valor |
| :--- | :--- |
| **Historias** | US-001, US-002, US-003, US-004 |
| **Total de tareas** | 21 |
| **Tareas completadas** | 0 |
| **Tareas en progreso** | 17 |
| **Tareas pendientes** | 4 |
| **Porcentaje de avance** | -- |
| **Estado** | 🟡 En Progreso |

### Sprint 2: Fase Post-viaje + Administración

| Métrica | Valor |
| :--- | :--- |
| **Historias** | US-005, US-006, US-007, US-008 |
| **Total de tareas** | 22 |
| **Tareas completadas** | 0 |
| **Tareas en progreso** | 4 |
| **Tareas pendientes** | 18 |
| **Porcentaje de avance** | -- |
| **Estado** | ⚪ Pendiente |

---

## Distribución de Tareas por Responsable

| Responsable | Sprint 1 | Sprint 2 | Total |
| :--- | :--- | :--- | :--- |
| **Backend** | 9 | 10 | 19 |
| **Frontend** | 5 | 4 | 9 |
| **QA** | 5 | 4 | 9 |
| **DevOps** | 2 | 4 | 6 |
| **Total** | 21 | 22 | 43 |

---

## Leyenda de Estados

| Símbolo | Estado | Significado |
| :--- | :--- | :--- |
| ✅ | Completado | Tarea terminada y aceptada |
| 🟡 | En Progreso | Tarea en desarrollo actualmente |
| ⚪ | Pendiente | Tarea no iniciada |
| 🔴 | Bloqueado | Tarea con impedimento |

---

## Leyenda de Prioridades

| Símbolo | Prioridad | Significado |
| :--- | :--- | :--- |
| 🔴 | Alta | Debe completarse en el sprint sí o sí |
| 🟠 | Media | Importante pero puede postergarse |
| 🟡 | Baja | Se hace si hay tiempo |

---

<div align="center">

---

**Sprint Backlog — Motor Tarifario Inteligente inDrive** | *Mayo 2026*

</div>
