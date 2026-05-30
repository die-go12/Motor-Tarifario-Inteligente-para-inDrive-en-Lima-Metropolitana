# Sprint Backlog – Motor Tarifario Inteligente — inDrive

##  MVP Lima Metropolitana | Duración: 8 meses | Presupuesto: USD $182,000

---

##  Características del Producto (CAR)

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

##  Visión General de Sprints

| Sprint | Nombre | Historias | Story Points | Duración |
|--------|--------|-----------|--------------|----------|
| Sprint 1 | Fase Pre-viaje | US-001, US-002, US-003, US-004 | 16 SP | 2 semanas |
| Sprint 2 | Fase Post-viaje + Administración | US-005, US-006, US-007, US-008 | 18 SP | 2 semanas |

---

##  Sprint 1 – Fase Pre-viaje

###  Objetivo
Implementar la fase pre-viaje: cálculo de rango tarifario, visualización asimétrica, negociación y aceptación bilateral.

---

###  US-001 – Solicitud de viaje con cálculo de rango

| Tarea | Responsable | Estado |
|------|-------------|--------|
| Endpoint solicitud de viaje | Backend | Completado |
| Integración Google Maps | Backend | Pendiente |
| Integración OSINERGMIN | Backend | Pendiente |
| API de tráfico | Backend | Pendiente |
| Algoritmo de cálculo de rango | Backend | En progreso |
| Manejo de fallos externos | Backend | En progreso |
| Pruebas unitarias e integración | QA | En progreso |

---

###  US-002 – Visualización asimétrica del precio

| Tarea | Responsable | Estado |
|------|-------------|--------|
| Vista pasajero (máximo) | Frontend | En progreso |
| Vista conductor (mínimo) | Frontend | En progreso |
| Vista admin (rango completo) | Frontend | En progreso |
| Control de acceso por roles | Frontend | En progreso |
| Pruebas de seguridad | QA | En progreso |

---

###  US-003 – Negociación acotada

| Tarea | Responsable | Estado |
|------|-------------|--------|
| Endpoint de ofertas | Backend | Pendiente |
| Validación de rango | Backend | Pendiente |
| Interfaz de negociación | Frontend | En progreso |
| Registro de ofertas | Backend | Pendiente |
| Contraofertas | Backend | Pendiente |
| Pruebas de límites | QA | Pendiente |

---

###  US-004 – Aceptación bilateral e inicio de viaje

| Tarea | Responsable | Estado |
|------|-------------|--------|
| Endpoint aceptación bilateral | Backend | Pendiente |
| Máquina de estados | Backend | Completado |
| Notificaciones | Frontend | Pendiente |
| Activación GPS | Backend | Pendiente |
| Pruebas de flujo completo | QA | Pendiente |

---

##  Sprint 2 – Post-viaje + Administración

###  Objetivo
Implementar post-viaje (GPS, recálculo, regla de pago) y módulo administrativo (configuración y reportes).

---

###  US-005 a US-008 (resumen)

| US | Estado general |
|----|--------------|
| US-005 Recálculo post-viaje | Pendiente |
| US-006 Regla de pago | Avanzado |
| US-007 Parametrización | En progreso |
| US-008 Reportes | Pendiente |

---

##  Resumen del Sprint

| Métrica | Sprint 1 |
|--------|----------|
| Historias | 4 |
| Tareas totales | 20 |
| Completadas | 2 |
| En progreso | 7 |
| Pendientes | 11 |

