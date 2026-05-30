# Product Backlog

## Motor Tarifario Inteligente — inDrive

<div align="center">

*MVP Lima Metropolitana | Duración: 8 meses | Presupuesto: USD $182,000*

</div>

---

## Características del Producto (CAR)

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

1. [Visión General del Product Backlog](#visión-general-del-product-backlog)
2. [Historias de Usuario (Backlog)](#historias-de-usuario-backlog)
3. [Desglose de Tareas por Historia](#desglose-de-tareas-por-historia)
4. [Resumen del Backlog](#resumen-del-backlog)

---

## Visión General del Product Backlog

El **Product Backlog** contiene todas las funcionalidades necesarias para construir el **Motor Tarifario Inteligente** para inDrive (MVP Lima Metropolitana). Está organizado por **historias de usuario**, cada una con su prioridad, estimación y tareas asociadas.

| Elemento | Descripción |
| :--- | :--- |
| **Formato** | Historias de usuario con criterios de aceptación |
| **Priorización** | Alta (6) / Media (2) / Baja (0) |
| **Estimación** | Story Points (Fibonacci: 1, 2, 3, 5, 8, 13) |
| **Total de historias** | 8 |
| **Total de story points** | 34 |

---

## Historias de Usuario (Backlog)

### US-001: Solicitud de viaje con cálculo de rango

| Campo | Valor |
| :--- | :--- |
| **Prioridad** | 🔴 Alta |
| **Story Points** | 5 |
| **Actor** | Pasajero |
| **CAR** | CAR-001, CAR-009, CAR-010 |
| **Dependencias** | Ninguna |

**Descripción:**  
Yo como **pasajero** quiero **solicitar un viaje ingresando mi origen y destino** para que el **Motor Tarifario Inteligente calcule un rango `[mínimo, máximo]` en menos de 5 segundos** basado en las 7 variables.

**Criterios de aceptación:**

| ID | Criterio |
| :--- | :--- |
| CA-001-01 | El sistema calcula el rango en menos de 5 segundos |
| CA-001-02 | Considera distancia desde Google Maps API |
| CA-001-03 | Considera precio de combustible desde OSINERGMIN API |
| CA-001-04 | Considera condición de tráfico en tiempo real |
| CA-001-05 | Tolera fallos de APIs con degradación elegante |

**Tareas técnicas:**

| Tarea | Estimación (horas) |
| :--- | :--- |
| Implementar endpoint de solicitud de viaje | 8 |
| Integrar Google Maps Distance API | 6 |
| Integrar OSINERGMIN API con caché de 24h | 4 |
| Implementar lógica de ponderación de 7 variables | 10 |
| Implementar timeout y circuit breaker para APIs externas | 6 |
| Pruebas unitarias e integración | 6 |
| **Total** | **40 horas** |

---

### US-002: Visualización asimétrica del precio

| Campo | Valor |
| :--- | :--- |
| **Prioridad** | 🔴 Alta |
| **Story Points** | 3 |
| **Actor** | Pasajero / Conductor |
| **CAR** | CAR-002 |
| **Dependencias** | US-001 |

**Descripción:**  
Yo como **pasajero** quiero **ver solo el techo** (máximo garantizado).  
Yo como **conductor** quiero **ver solo el piso** (mínimo garantizado).  
El rango completo nunca se muestra a ambas partes.

**Criterios de aceptación:**

| ID | Criterio |
| :--- | :--- |
| CA-002-01 | Pasajero solo visualiza el techo |
| CA-002-02 | Conductor solo visualiza el piso |
| CA-002-03 | Administrador ve rango completo desde panel admin |
| CA-002-04 | El rango completo nunca se muestra a ambos |
| CA-002-05 | Mensajes siguen formato exacto especificado |

**Tareas técnicas:**

| Tarea | Estimación (horas) |
| :--- | :--- |
| Implementar lógica de roles en frontend | 4 |
| Diseñar componente de visualización para pasajero (techo) | 3 |
| Diseñar componente de visualización para conductor (piso) | 3 |
| Implementar panel admin para visualizar rango completo | 4 |
| Pruebas de acceso por rol | 2 |
| **Total** | **16 horas** |

---

### US-003: Negociación acotada dentro del rango

| Campo | Valor |
| :--- | :--- |
| **Prioridad** | 🔴 Alta |
| **Story Points** | 5 |
| **Actor** | Pasajero / Conductor |
| **CAR** | CAR-003, CAR-007 |
| **Dependencias** | US-001, US-002 |

**Descripción:**  
Yo como **pasajero** y **conductor** quiero **negociar el precio libremente**, pero el sistema debe **rechazar cualquier oferta fuera del rango** `[mínimo, máximo]`.

**Criterios de aceptación:**

| ID | Criterio |
| :--- | :--- |
| CA-003-01 | Permite ofertas dentro del rango |
| CA-003-02 | Rechaza ofertas fuera del rango |
| CA-003-03 | No revela extremos del rango durante negociación |
| CA-003-04 | Permite múltiples contraofertas |
| CA-003-05 | Cada oferta se registra en logs |

**Tareas técnicas:**

| Tarea | Estimación (horas) |
| :--- | :--- |
| Implementar lógica de validación de ofertas | 6 |
| Crear endpoint para recibir ofertas | 4 |
| Implementar registro de ofertas en logs (CAR-007) | 4 |
| Diseñar interfaz de chat/negociación | 8 |
| Pruebas de límites del rango | 4 |
| **Total** | **26 horas** |

---

### US-004: Aceptación bilateral e inicio de viaje

| Campo | Valor |
| :--- | :--- |
| **Prioridad** | 🔴 Alta |
| **Story Points** | 3 |
| **Actor** | Pasajero / Conductor |
| **CAR** | CAR-002, CAR-007 |
| **Dependencias** | US-003 |

**Descripción:**  
Yo como **pasajero** y **conductor** quiero **aceptar mutuamente el precio negociado** para que el **viaje pueda iniciar oficialmente** y el sistema registre el evento.

**Criterios de aceptación:**

| ID | Criterio |
| :--- | :--- |
| CA-004-01 | Viaje solo inicia con aceptación bilateral |
| CA-004-02 | Registra aceptación con timestamp |
| CA-004-03 | Notifica inicio a ambas partes |
| CA-004-04 | Estado del viaje cambia a "En Curso" |
| CA-004-05 | Activa captura de datos GPS |

**Tareas técnicas:**

| Tarea | Estimación (horas) |
| :--- | :--- |
| Implementar endpoint de aceptación bilateral | 4 |
| Implementar máquina de estados del viaje | 4 |
| Implementar notificaciones push | 3 |
| Activar servicio de captura GPS | 3 |
| Pruebas de flujo completo | 4 |
| **Total** | **18 horas** |

---

### US-005: Recálculo post-viaje con GPS real

| Campo | Valor |
| :--- | :--- |
| **Prioridad** | 🔴 Alta |
| **Story Points** | 5 |
| **Actor** | Sistema (automático) |
| **CAR** | CAR-004, CAR-009 |
| **Dependencias** | US-004 |

**Descripción:**  
Yo como **sistema** quiero **capturar los datos reales del recorrido** (ruta, tiempo, distancia) al finalizar el viaje para **recalcular el `precio_real`**.

**Criterios de aceptación:**

| ID | Criterio |
| :--- | :--- |
| CA-005-01 | Captura ruta real recorrida desde GPS |
| CA-005-02 | Captura tiempo real de viaje |
| CA-005-03 | Captura distancia real recorrida |
| CA-005-04 | Identifica paradas o desvíos |
| CA-005-05 | Recalcula `precio_real` con datos capturados |

**Tareas técnicas:**

| Tarea | Estimación (horas) |
| :--- | :--- |
| Implementar servicio de captura GPS continua | 8 |
| Implementar cálculo de distancia real desde coordenadas | 6 |
| Implementar cálculo de tiempo real | 4 |
| Implementar detección de paradas/desvíos | 6 |
| Implementar recálculo de `precio_real` | 4 |
| Pruebas con datos reales | 6 |
| **Total** | **34 horas** |

---

### US-006: Aplicación de la regla de pago invariante

| Campo | Valor |
| :--- | :--- |
| **Prioridad** | 🔴 Alta |
| **Story Points** | 5 |
| **Actor** | Sistema (automático) |
| **CAR** | CAR-004, CAR-005 |
| **Dependencias** | US-005 |

**Descripción:**  
Yo como **sistema** quiero **aplicar la regla de pago** `pago = max(mínimo, min(precio_real, máximo))` para **proteger bilateralmente** a pasajeros y conductores.

**Criterios de aceptación:**

| ID | Criterio |
| :--- | :--- |
| CA-006-01 | Si `precio_real < mínimo` → paga `mínimo` (protege conductor) |
| CA-006-02 | Si `precio_real` en rango → paga `precio_real` (justo) |
| CA-006-03 | Si `precio_real > máximo` → paga `máximo` (protege pasajero) |
| CA-006-04 | Registra condición aplicada en cada caso |
| CA-006-05 | Envía `precio_real` al filtro de anomalías |

**Tareas técnicas:**

| Tarea | Estimación (horas) |
| :--- | :--- |
| Implementar función de regla de pago | 4 |
| Implementar los 3 escenarios de la regla | 4 |
| Registrar condición aplicada en logs | 3 |
| Integrar con servicio de pagos | 4 |
| Pruebas de los 3 escenarios | 4 |
| **Total** | **19 horas** |

---

### US-007: Configuración de parámetros desde panel admin

| Campo | Valor |
| :--- | :--- |
| **Prioridad** | 🟠 Media |
| **Story Points** | 3 |
| **Actor** | Administrador |
| **CAR** | CAR-006, CAR-007 |
| **Dependencias** | US-001 |

**Descripción:**  
Yo como **administrador** quiero **configurar pesos de variables, multiplicador de tráfico y umbrales de anomalías** desde un panel administrativo, sin desplegar nuevo código.

**Criterios de aceptación:**

| ID | Criterio |
| :--- | :--- |
| CA-007-01 | Modificar pesos de las 7 variables |
| CA-007-02 | Modificar multiplicador de tráfico (tope ×2.0) |
| CA-007-03 | Modificar umbrales para filtro de anomalías |
| CA-007-04 | Visualizar rango completo `[mínimo, máximo]` |
| CA-007-05 | Cada cambio se registra con timestamp y usuario |

**Tareas técnicas:**

| Tarea | Estimación (horas) |
| :--- | :--- |
| Implementar CRUD de parámetros en backend | 6 |
| Diseñar interfaz de panel admin | 8 |
| Implementar formularios de configuración | 6 |
| Implementar registro de cambios en logs | 3 |
| Pruebas de configuración | 4 |
| **Total** | **27 horas** |

---

### US-008: Visualización de reportes y métricas

| Campo | Valor |
| :--- | :--- |
| **Prioridad** | 🟠 Media |
| **Story Points** | 5 |
| **Actor** | Administrador |
| **CAR** | CAR-008 |
| **Dependencias** | US-007 |

**Descripción:**  
Yo como **administrador** quiero **visualizar reportes y métricas** (demanda por zona, precios promedio, desviaciones) para **tomar decisiones informadas**.

**Criterios de aceptación:**

| ID | Criterio |
| :--- | :--- |
| CA-008-01 | Reportes de demanda por zona y franja horaria |
| CA-008-02 | Reportes de precios promedio y desviaciones |
| CA-008-03 | Reportes de tiempos de viaje |
| CA-008-04 | Métricas de anomalías detectadas |
| CA-008-05 | Filtrar reportes por fecha y zona |

**Tareas técnicas:**

| Tarea | Estimación (horas) |
| :--- | :--- |
| Implementar consultas de demanda por zona | 6 |
| Implementar cálculos de precios promedio | 4 |
| Implementar reportes de anomalías | 4 |
| Diseñar dashboard de reportes | 8 |
| Implementar filtros por fecha y zona | 4 |
| Pruebas de reportes | 4 |
| **Total** | **30 horas** |

---

## Resumen del Backlog

| ID | Historia de Usuario | Prioridad | Story Points | Dependencias | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| US-001 | Solicitud de viaje con cálculo de rango | 🔴 Alta | 5 | Ninguna | ✅ Definida |
| US-002 | Visualización asimétrica del precio | 🔴 Alta | 3 | US-001 | ✅ Definida |
| US-003 | Negociación acotada dentro del rango | 🔴 Alta | 5 | US-001, US-002 | ✅ Definida |
| US-004 | Aceptación bilateral e inicio de viaje | 🔴 Alta | 3 | US-003 | ✅ Definida |
| US-005 | Recálculo post-viaje con GPS real | 🔴 Alta | 5 | US-004 | ✅ Definida |
| US-006 | Aplicación de la regla de pago invariante | 🔴 Alta | 5 | US-005 | ✅ Definida |
| US-007 | Configuración de parámetros desde panel admin | 🟠 Media | 3 | US-001 | ✅ Definida |
| US-008 | Visualización de reportes y métricas | 🟠 Media | 5 | US-007 | ✅ Definida |

**Totales:**

| Métrica | Valor |
| :--- | :--- |
| **Total de historias** | 8 |
| **Total de story points** | 34 |
| **Estimación total de horas** | ~210 horas |

---

## 📊 Priorización del Backlog

```text
Prioridad Alta (6 historias)
├── US-001: Solicitud de viaje con cálculo de rango (5 SP)
├── US-002: Visualización asimétrica del precio (3 SP)
├── US-003: Negociación acotada dentro del rango (5 SP)
├── US-004: Aceptación bilateral e inicio de viaje (3 SP)
├── US-005: Recálculo post-viaje con GPS real (5 SP)
└── US-006: Aplicación de la regla de pago invariante (5 SP)

Prioridad Media (2 historias)
├── US-007: Configuración de parámetros desde panel admin (3 SP)
└── US-008: Visualización de reportes y métricas (5 SP)
