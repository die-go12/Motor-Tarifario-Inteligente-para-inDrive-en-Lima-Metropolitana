# 📋 Historias de Usuario

## Motor Tarifario Inteligente — inDrive

<div align="center">

*MVP Lima Metropolitana | Duración: 8 meses | Presupuesto: USD $182,000*

</div>

---

## Características del Producto (CAR)

Las siguientes **10 características funcionales y no funcionales** (CAR-001 a CAR-010) son la base sobre la cual se construyen las historias de usuario.

| ID | Característica | Descripción |
| :--- | :--- | :--- |
| **CAR-001** | Cálculo del rango pre-viaje | Pondera 7 variables y genera `[mínimo, máximo]` en menos de 5 segundos |
| **CAR-002** | Visualización asimétrica | Pasajero ve solo el **techo** (máximo) / Conductor ve solo el **piso** (mínimo) + aceptación bilateral |
| **CAR-003** | Negociación asistida | Negociación libre pero acotada dentro del rango `[mínimo, máximo]`, sin revelar los extremos |
| **CAR-004** | Cálculo post-viaje + regla de pago | Recalcula con GPS real y aplica `pago = max(mínimo, min(precio_real, máximo))` |
| **CAR-005** | Filtro de anomalías | Protege el histórico de aprendizaje descartando datos corruptos o inválidos |
| **CAR-006** | Parametrización | Configuración de reglas de negocio, pesos y multiplicadores desde panel administrativo |
| **CAR-007** | Registro y trazabilidad | Registro inmutable de todas las fases (pre-viaje y post-viaje) para auditoría |
| **CAR-008** | Reportes | Generación de métricas para control y toma de decisiones |
| **CAR-009** | Integración externa | Conexión con Google Maps, OSINERGMIN y APIs de tráfico en tiempo real |
| **CAR-010** | Tolerancia a fallos | Degradación elegante ante fallos de servicios externos |

---

## Índice

1. [Historia US-001: Solicitud de viaje con cálculo de rango](#historia-us-001-solicitud-de-viaje-con-cálculo-de-rango)
2. [Historia US-002: Visualización asimétrica del precio](#historia-us-002-visualización-asimétrica-del-precio)
3. [Historia US-003: Negociación acotada dentro del rango](#historia-us-003-negociación-acotada-dentro-del-rango)
4. [Historia US-004: Aceptación bilateral e inicio de viaje](#historia-us-004-aceptación-bilateral-e-inicio-de-viaje)
5. [Historia US-005: Recálculo post-viaje con GPS real](#historia-us-005-recálculo-post-viaje-con-gps-real)
6. [Historia US-006: Aplicación de la regla de pago invariante](#historia-us-006-aplicación-de-la-regla-de-pago-invariante)
7. [Historia US-007: Configuración de parámetros desde panel admin](#historia-us-007-configuración-de-parámetros-desde-panel-admin)
8. [Historia US-008: Visualización de reportes y métricas](#historia-us-008-visualización-de-reportes-y-métricas)

---

## Historia US-001: Solicitud de viaje con cálculo de rango

| Campo | Valor |
| :--- | :--- |
| **ID** | US-001 |
| **Título** | Solicitud de viaje con cálculo de rango |
| **Actor** | Pasajero |
| **CAR relacionado** | CAR-001, CAR-009 |

### Descripción

Yo como **pasajero** quiero **solicitar un viaje ingresando mi origen y destino** para que el **Motor Tarifario Inteligente calcule un rango `[mínimo, máximo]` en menos de 5 segundos** basado en las 7 variables (distancia, tráfico, combustible, capacidad, hora/demanda, tiempo estimado, histórico).

### Criterios de aceptación

| Criterio | Descripción |
| :--- | :--- |
| CA-001-01 | El sistema debe calcular el rango `[mínimo, máximo]` en menos de 5 segundos |
| CA-001-02 | El cálculo debe considerar la distancia obtenida desde Google Maps API |
| CA-001-03 | El cálculo debe considerar el precio de combustible desde OSINERGMIN API |
| CA-001-04 | El cálculo debe considerar la condición de tráfico en tiempo real |
| CA-001-05 | El sistema debe tolerar fallos de APIs externas con degradación elegante (CAR-010) |

---

## Historia US-002: Visualización asimétrica del precio

| Campo | Valor |
| :--- | :--- |
| **ID** | US-002 |
| **Título** | Visualización asimétrica del precio |
| **Actor** | Pasajero y Conductor |
| **CAR relacionado** | CAR-002 |

### Descripción

Yo como **pasajero** quiero **ver solo el techo del precio** (máximo garantizado) con el mensaje *"Este viaje no te costará más de S/ X"*.  
Yo como **conductor** quiero **ver solo el piso del precio** (mínimo garantizado) con el mensaje *"Este viaje te pagará al menos S/ Y"*.  
El rango completo `[mínimo, máximo]` nunca se muestra a ambas partes.

### Criterios de aceptación

| Criterio | Descripción |
| :--- | :--- |
| CA-002-01 | El pasajero solo visualiza el techo (valor máximo) |
| CA-002-02 | El conductor solo visualiza el piso (valor mínimo) |
| CA-002-03 | El administrador puede visualizar el rango completo desde el panel admin |
| CA-002-04 | El rango completo nunca se muestra simultáneamente a pasajero y conductor |
| CA-002-05 | El mensaje mostrado debe seguir el formato exacto especificado |

---

## Historia US-003: Negociación acotada dentro del rango

| Campo | Valor |
| :--- | :--- |
| **ID** | US-003 |
| **Título** | Negociación acotada dentro del rango |
| **Actor** | Pasajero y Conductor |
| **CAR relacionado** | CAR-003 |

### Descripción

Yo como **pasajero** y **conductor** quiero **negociar el precio del viaje libremente**, pero el sistema debe **rechazar cualquier oferta que se salga del rango `[mínimo, máximo]`** , asegurando que la negociación siempre ocurra dentro de límites objetivos.

### Criterios de aceptación

| Criterio | Descripción |
| :--- | :--- |
| CA-003-01 | El sistema permite ofertas dentro del rango `[mínimo, máximo]` |
| CA-003-02 | El sistema rechaza ofertas menores al mínimo o mayores al máximo |
| CA-003-03 | El sistema no revela los extremos del rango durante la negociación |
| CA-003-04 | Ambas partes pueden realizar múltiples contraofertas |
| CA-003-05 | Cada oferta se registra en el sistema de logs (CAR-007) |

---

## Historia US-004: Aceptación bilateral e inicio de viaje

| Campo | Valor |
| :--- | :--- |
| **ID** | US-004 |
| **Título** | Aceptación bilateral e inicio de viaje |
| **Actor** | Pasajero y Conductor |
| **CAR relacionado** | CAR-002, CAR-007 |

### Descripción

Yo como **pasajero** y **conductor** quiero **aceptar mutuamente el precio negociado** para que el **viaje pueda iniciar oficialmente** y el sistema registre el evento para trazabilidad.

### Criterios de aceptación

| Criterio | Descripción |
| :--- | :--- |
| CA-004-01 | El viaje solo inicia si ambas partes aceptan el precio negociado |
| CA-004-02 | El sistema registra la aceptación bilateral con timestamp (CAR-007) |
| CA-004-03 | El sistema notifica a ambas partes el inicio del viaje |
| CA-004-04 | El estado del viaje cambia a "En Curso" |
| CA-004-05 | Se activa la captura de datos GPS en tiempo real |

---

## Historia US-005: Recálculo post-viaje con GPS real

| Campo | Valor |
| :--- | :--- |
| **ID** | US-005 |
| **Título** | Recálculo post-viaje con GPS real |
| **Actor** | Sistema (automático) |
| **CAR relacionado** | CAR-004, CAR-009 |

### Descripción

Yo como **sistema** quiero **capturar los datos reales del recorrido** (ruta, tiempo, distancia, paradas/desvíos) al finalizar el viaje para **recalcular el `precio_real`** basado en la ejecución real del servicio.

### Criterios de aceptación

| Criterio | Descripción |
| :--- | :--- |
| CA-005-01 | El sistema captura la ruta real recorrida desde GPS |
| CA-005-02 | El sistema captura el tiempo real de viaje |
| CA-005-03 | El sistema captura la distancia real recorrida |
| CA-005-04 | El sistema identifica paradas o desvíos significativos |
| CA-005-05 | El sistema recalcula `precio_real` con los datos capturados |

---

## Historia US-006: Aplicación de la regla de pago invariante

| Campo | Valor |
| :--- | :--- |
| **ID** | US-006 |
| **Título** | Aplicación de la regla de pago invariante |
| **Actor** | Sistema (automático) |
| **CAR relacionado** | CAR-004 |

### Descripción

Yo como **sistema** quiero **aplicar la regla de pago** `pago = max(mínimo, min(precio_real, máximo))` al finalizar el viaje para **proteger bilateralmente** a pasajeros y conductores, asegurando que ninguna parte pague o cobre fuera del rango acordado.

### Criterios de aceptación

| Criterio | Descripción |
| :--- | :--- |
| CA-006-01 | Si `precio_real < mínimo`, el pago es `mínimo` (protege conductor) |
| CA-006-02 | Si `precio_real` está dentro del rango, el pago es `precio_real` (justo) |
| CA-006-03 | Si `precio_real > máximo`, el pago es `máximo` (protege pasajero) |
| CA-006-04 | El sistema registra la condición aplicada en cada caso |
| CA-006-05 | El `precio_real` (no el monto pagado) se envía al filtro de anomalías (CAR-005) |

---

## Historia US-007: Configuración de parámetros desde panel admin

| Campo | Valor |
| :--- | :--- |
| **ID** | US-007 |
| **Título** | Configuración de parámetros desde panel admin |
| **Actor** | Administrador |
| **CAR relacionado** | CAR-006 |

### Descripción

Yo como **administrador** quiero **configurar los pesos de las 7 variables, el multiplicador de tráfico (tope ×2.0) y los umbrales de anomalías** desde un panel administrativo, para **ajustar dinámicamente el comportamiento del Motor Tarifario** sin necesidad de desplegar nuevo código.

### Criterios de aceptación

| Criterio | Descripción |
| :--- | :--- |
| CA-007-01 | El administrador puede modificar los pesos de las 7 variables |
| CA-007-02 | El administrador puede modificar el multiplicador de tráfico (tope ×2.0) |
| CA-007-03 | El administrador puede modificar los umbrales para el filtro de anomalías |
| CA-007-04 | El administrador puede visualizar el rango completo `[mínimo, máximo]` |
| CA-007-05 | Cada cambio se registra con timestamp y usuario (CAR-007) |

---

## Historia US-008: Visualización de reportes y métricas

| Campo | Valor |
| :--- | :--- |
| **ID** | US-008 |
| **Título** | Visualización de reportes y métricas |
| **Actor** | Administrador |
| **CAR relacionado** | CAR-008 |

### Descripción

Yo como **administrador** quiero **visualizar reportes y métricas** (demanda por zona, precios promedio, tiempos de viaje, desviaciones del rango) para **tomar decisiones informadas** sobre la configuración del Motor Tarifario y el comportamiento del sistema.

### Criterios de aceptación

| Criterio | Descripción |
| :--- | :--- |
| CA-008-01 | El sistema genera reportes de demanda por zona y franja horaria |
| CA-008-02 | El sistema genera reportes de precios promedio y desviaciones |
| CA-008-03 | El sistema genera reportes de tiempos de viaje |
| CA-008-04 | El sistema muestra métricas de anomalías detectadas y descartadas |
| CA-008-05 | El administrador puede filtrar reportes por fecha y zona |

---

## Resumen de Historias de Usuario

| ID | Módulo | Historia de Usuario | Prioridad | Sprint sugerido | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| US-001 | Pre-viaje | Solicitud de viaje con cálculo de rango | 🔴 Alta | Sprint 1 | ✅ Completado |
| US-002 | Pre-viaje | Visualización asimétrica del precio | 🔴 Alta | Sprint 1 | ✅ Completado |
| US-003 | Pre-viaje | Negociación acotada dentro del rango | 🔴 Alta | Sprint 1 | ✅ Completado |
| US-004 | Pre-viaje | Aceptación bilateral e inicio de viaje | 🔴 Alta | Sprint 1 | ✅ Completado |
| US-005 | Post-viaje | Recálculo post-viaje con GPS real | 🔴 Alta | Sprint 2 | 🟡 En Progreso |
| US-006 | Post-viaje | Aplicación de la regla de pago invariante | 🔴 Alta | Sprint 2 | 🟡 En Progreso |
| US-007 | Administración | Configuración de parámetros desde panel admin | 🟠 Media | Sprint 2 | ⚪ Pendiente |
| US-008 | Administración | Visualización de reportes y métricas | 🟠 Media | Sprint 2 | ⚪ Pendiente |

---

<div align="center">

---

**Historias de Usuario — Motor Tarifario Inteligente inDrive** | *Mayo 2026*

</div>
