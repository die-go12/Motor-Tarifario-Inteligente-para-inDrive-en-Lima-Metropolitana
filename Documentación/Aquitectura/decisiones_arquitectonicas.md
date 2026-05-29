# Decisiones Arquitectónicas (ADR)

## Motor Tarifario Inteligente — inDrive

<div align="center">

*MVP Lima Metropolitana | Duración: 8 meses | Presupuesto: USD $182,000*

</div>

---

<div style="text-align: justify">

## Índice

1. [Introducción](#1-introducción)
2. [ADR-001: Arquitectura basada en microservicios](#adr-001-arquitectura-basada-en-microservicios)
3. [ADR-002: Visualización asimétrica de tarifas](#adr-002-visualización-asimétrica-de-tarifas)
4. [ADR-003: Regla de pago invariante](#adr-003-regla-de-pago-invariante)
5. [ADR-004: Base de datos poliglota](#adr-004-base-de-datos-poliglota)
6. [ADR-005: Comunicación asíncrona mediante eventos](#adr-005-comunicación-asíncrona-mediante-eventos)
7. [ADR-006: Degradación elegante ante fallos de APIs externas](#adr-006-degradación-elegante-ante-fallos-de-apis-externas)
8. [ADR-007: Filtro de anomalías para protección del histórico](#adr-007-filtro-de-anomalías-para-protección-del-histórico)
9. [ADR-008: Autenticación y autorización por roles (RBAC)](#adr-008-autenticación-y-autorización-por-roles-rbac)
10. [Resumen de ADR](#resumen-de-adr)

---

## 1. Introducción

Este documento registra las **Decisiones Arquitectónicas (Architectural Decision Records - ADR)** más relevantes adoptadas durante el diseño del **Motor Tarifario Inteligente** para inDrive (MVP Lima Metropolitana).

Cada ADR sigue la siguiente estructura:

</div>

<table align="center">
  <tr>
    <th>Campo</th>
    <th>Descripción</th>
  </tr>
  <tr>
    <td><b>Contexto</b></td>
    <td>Situación o problema que motiva la decisión</td>
  </tr>
  <tr>
    <td><b>Decisión</b></td>
    <td>Qué se decidió hacer</td>
  </tr>
  <tr>
    <td><b>Alternativas consideradas</b></td>
    <td>Qué otras opciones se evaluaron</td>
  </tr>
  <tr>
    <td><b>Justificación</b></td>
    <td>Por qué se eligió esta opción</td>
  </tr>
  <tr>
    <td><b>Consecuencias</b></td>
    <td>Impactos positivos y negativos</td>
  </tr>
  <tr>
    <td><b>CAR relacionado</b></td>
    <td>Requisitos funcionales asociados</td>
  </tr>
</table>

---

## ADR-001: Arquitectura basada en microservicios

<table align="center">
  <tr>
    <td><b>Estado</b></td>
    <td>✅ Aceptado</td>
  </tr>
  <tr>
    <td><b>Fecha</b></td>
    <td>Mayo 2026</td>
  </tr>
  <tr>
    <td><b>Responsable</b></td>
    <td>Equipo de Arquitectura inDrive</td>
  </tr>
</table>

<div style="text-align: justify">

### Contexto

El sistema debe calcular rangos tarifarios en menos de 5 segundos (CAR-001), manejar alta concurrencia en horas pico (>10,000 solicitudes simultáneas) y permitir evolución independiente de componentes como el motor de cálculo, integraciones externas y panel administrativo.

### Decisión

Se adopta una **arquitectura basada en microservicios** con los siguientes servicios independientes:

- Motor Tarifario (cálculo de `[mínimo, máximo]` y regla de pago)
- Servicio de Integración Externa (Google Maps, OSINERGMIN, tráfico)
- Servicio de Anomalías (validación de datos)
- Sistema de Logs y Auditoría
- Servicio de Reportes y Analítica
- Panel Administrativo

### Alternativas consideradas

</div>

<table align="center">
  <tr>
    <th>Alternativa</th>
    <th>Razón de rechazo</th>
  </tr>
  <tr>
    <td><b>Monolito</b></td>
    <td>Difícil escalabilidad independiente; cambios en una funcionalidad afectan todo el sistema</td>
  </tr>
  <tr>
    <td><b>Arquitectura serverless</b></td>
    <td>Mayor latencia en tiempo de ejecución; incompatible con SLO de &lt;5 segundos</td>
  </tr>
</table>

<div style="text-align: justify">

### Justificación

- **Escalabilidad horizontal**: cada microservicio escala según su demanda (ej: Motor Tarifario escala más que Logs)
- **Despliegue independiente**: cambios en reglas de negocio no requieren redeploy completo
- **Tolerancia a fallos**: fallo en una API externa no detiene todo el sistema (CAR-010)
- **Alineación con restricción tecnológica**: uso obligatorio de microservicios (ver restricciones del proyecto)

### Consecuencias

</div>

<table align="center">
  <tr>
    <th>Positivas</th>
    <th>Negativas</th>
  </tr>
  <tr>
    <td>Escalabilidad independiente</td>
    <td>Mayor complejidad operativa</td>
  </tr>
  <tr>
    <td>Despliegues más rápidos</td>
    <td>Sobrecarga de comunicación entre servicios</td>
  </tr>
  <tr>
    <td>Equipos paralelos</td>
    <td>Necesidad de orquestación (Docker Compose, Kubernetes)</td>
  </tr>
  <tr>
    <td>Resiliencia mejorada</td>
    <td>Mayor consumo de recursos</td>
  </tr>
</table>

<div style="text-align: justify">

### CAR relacionados

- CAR-001 (cálculo <5s)
- CAR-010 (tolerancia a fallos)

---

## ADR-002: Visualización asimétrica de tarifas

</div>

<table align="center">
  <tr>
    <td><b>Estado</b></td>
    <td>✅ Aceptado (Decisión bloqueada)</td>
  </tr>
  <tr>
    <td><b>Fecha</b></td>
    <td>Mayo 2026</td>
  </tr>
  <tr>
    <td><b>Responsable</b></td>
    <td>Producto + Arquitectura</td>
  </tr>
</table>

<div style="text-align: justify">

### Contexto

La negociación libre es un valor central de inDrive, pero sin límites objetivos puede generar asimetrías de información donde el pasajero oferta muy bajo o el conductor exige muy alto. El sistema debe acotar la negociación sin eliminarla.

### Decisión

Se implementa **visualización asimétrica**:
- **Pasajero**: solo ve el **techo** (máximo garantizado): *"Este viaje no te costará más de S/ X"*
- **Conductor**: solo ve el **piso** (mínimo garantizado): *"Este viaje te pagará al menos S/ Y"*
- **Administrador**: visualiza el rango completo `[mínimo, máximo]`

El rango completo nunca se muestra a ambas partes simultáneamente.

### Alternativas consideradas

</div>

<table align="center">
  <tr>
    <th>Alternativa</th>
    <th>Razón de rechazo</th>
  </tr>
  <tr>
    <td>Mostrar rango completo a ambos</td>
    <td>Genera efecto de anclaje: pasajero oferta mínimo, conductor exige máximo</td>
  </tr>
  <tr>
    <td>No mostrar ningún valor</td>
    <td>Elimina transparencia y confianza</td>
  </tr>
  <tr>
    <td>Mostrar un solo precio fijo</td>
    <td>Elimina la negociación, valor central de inDrive</td>
  </tr>
</table>

<div style="text-align: justify">

### Justificación

- **Evita el efecto de anclaje**: ninguna parte tiene punto de referencia extremo
- **Preserva la negociación**: el regateo sigue existiendo, pero dentro de límites objetivos
- **Transparencia controlada**: cada actor ve solo lo que le importa (tope de gasto o base de ingreso)
- **Decisión bloqueada por el equipo**: Opción B confirmada, no se discute más

### Consecuencias

</div>

<table align="center">
  <tr>
    <th>Positivas</th>
    <th>Negativas</th>
  </tr>
  <tr>
    <td>Negociación justa y acotada</td>
    <td>El pasajero no conoce el mínimo</td>
  </tr>
  <tr>
    <td>Protección bilateral</td>
    <td>El conductor no conoce el máximo</td>
  </tr>
  <tr>
    <td>Confianza en el sistema</td>
    <td>Requiere implementación por roles</td>
  </tr>
</table>

<div style="text-align: justify">

### CAR relacionados

- CAR-002 (visualización asimétrica + aceptación bilateral)
- CAR-003 (negociación asistida sin revelar extremos)

---

## ADR-003: Regla de pago invariante

</div>

<table align="center">
  <tr>
    <td><b>Estado</b></td>
    <td>✅ Aceptado (Decisión bloqueada)</td>
  </tr>
  <tr>
    <td><b>Fecha</b></td>
    <td>Mayo 2026</td>
  </tr>
  <tr>
    <td><b>Responsable</b></td>
    <td>Producto + Legal</td>
  </tr>
</table>

<div style="text-align: justify">

### Contexto

Al finalizar el viaje, el precio real puede diferir del estimado por cambios en ruta, tráfico o tiempo. El sistema debe proteger a ambas partes sin necesidad de reclamos posteriores.

### Decisión

Se implementa la **regla de pago invariante**:

`pago = max(mínimo, min(precio_real, máximo))`

</div>

<table align="center">
  <tr>
    <th>Escenario</th>
    <th>Resultado</th>
    <th>Protección</th>
  </tr>
  <tr>
    <td><code>precio_real &lt; mínimo</code></td>
    <td>Paga <code>mínimo</code></td>
    <td>Conductor nunca cobra menos de lo garantizado</td>
  </tr>
  <tr>
    <td><code>precio_real</code> dentro del rango</td>
    <td>Paga <code>precio_real</code></td>
    <td>Justo para ambos</td>
  </tr>
  <tr>
    <td><code>precio_real &gt; máximo</code></td>
    <td>Paga <code>máximo</code></td>
    <td>Pasajero nunca paga más de lo acordado</td>
  </tr>
</table>

<div style="text-align: justify">

### Alternativas consideradas

</div>

<table align="center">
  <tr>
    <th>Alternativa</th>
    <th>Razón de rechazo</th>
  </tr>
  <tr>
    <td>Pago siempre = precio_real</td>
    <td>Injusto para una de las partes si hay desviaciones extremas</td>
  </tr>
  <tr>
    <td>Pago siempre = mínimo</td>
    <td>Desprotege al pasajero</td>
  </tr>
  <tr>
    <td>Pago siempre = máximo</td>
    <td>Desprotege al conductor</td>
  </tr>
  <tr>
    <td>Reclamos manuales post-viaje</td>
    <td>Costoso, lento, mala experiencia de usuario</td>
  </tr>
</table>

<div style="text-align: justify">

### Justificación

- **Protección bilateral automática**: sin necesidad de reclamos
- **Invariante de negocio**: cualquier modificación requiere aprobación legal
- **Transparencia**: la regla es conocida por ambas partes antes del viaje
- **Simplicidad**: una sola fórmula que cubre todos los casos

### Consecuencias

</div>

<table align="center">
  <tr>
    <th>Positivas</th>
    <th>Negativas</th>
  </tr>
  <tr>
    <td>Protección automática</td>
    <td>El conductor puede recibir menos que precio_real</td>
  </tr>
  <tr>
    <td>Sin reclamos post-viaje</td>
    <td>El pasajero puede pagar más que precio_real</td>
  </tr>
  <tr>
    <td>Regla simple y comprensible</td>
    <td>Requiere aprobación legal para cambios</td>
  </tr>
</table>

<div style="text-align: justify">

### CAR relacionados

- CAR-004 (cálculo post-viaje + regla de pago)

---

## ADR-004: Base de datos poliglota

</div>

<table align="center">
  <tr>
    <td><b>Estado</b></td>
    <td>✅ Aceptado</td>
  </tr>
  <tr>
    <td><b>Fecha</b></td>
    <td>Mayo 2026</td>
  </tr>
  <tr>
    <td><b>Responsable</b></td>
    <td>Equipo de Arquitectura</td>
  </tr>
</table>

<div style="text-align: justify">

### Contexto

El sistema maneja diferentes tipos de datos: transaccionales (usuarios, viajes, pagos), documentales (histórico de viajes para aprendizaje), logs de auditoría y caché de alta velocidad. Un solo motor de base de datos no es óptimo para todos los casos.

### Decisión

Se implementa una **estrategia de base de datos poliglota**:

</div>

<table align="center">
  <tr>
    <th>Almacén</th>
    <th>Tecnología</th>
    <th>Propósito</th>
    <th>Retención</th>
  </tr>
  <tr>
    <td><b>Transaccional</b></td>
    <td>PostgreSQL 15</td>
    <td>Usuarios, viajes, rangos, pagos</td>
    <td>3 meses (caliente)</td>
  </tr>
  <tr>
    <td><b>Histórico + Anomalías</b></td>
    <td>MongoDB 6</td>
    <td>Viajes validados para aprendizaje</td>
    <td>5 años</td>
  </tr>
  <tr>
    <td><b>Caché + Sesiones</b></td>
    <td>Redis 7</td>
    <td>Rangos recientes, configuraciones</td>
    <td>TTL variable</td>
  </tr>
  <tr>
    <td><b>Logs + Auditoría</b></td>
    <td>OpenSearch 2</td>
    <td>Eventos del sistema</td>
    <td>90 días</td>
  </tr>
</table>

<div style="text-align: justify">

### Alternativas consideradas

</div>

<table align="center">
  <tr>
    <th>Alternativa</th>
    <th>Razón de rechazo</th>
  </tr>
  <tr>
    <td>Solo PostgreSQL</td>
    <td>Mal rendimiento para datos no estructurados y volumetría alta de histórico</td>
  </tr>
  <tr>
    <td>Solo MongoDB</td>
    <td>Sin integridad referencial para transacciones críticas (pagos, regla de pago)</td>
  </tr>
  <tr>
    <td>Solo Redis</td>
    <td>Persistencia limitada, no apto para histórico</td>
  </tr>
</table>

<div style="text-align: justify">

### Justificación

- **PostgreSQL**: integridad ACID para regla de pago invariante (CAR-004)
- **MongoDB**: esquema flexible para `detalle_json` en anomalías; alto volumen de inserts en histórico
- **Redis**: latencia sub-milisegundo para cumplir SLO de <5 segundos (CAR-001)
- **OpenSearch**: búsqueda full-text sobre `payload_json` para auditoría (CAR-007)

### Consecuencias

</div>

<table align="center">
  <tr>
    <th>Positivas</th>
    <th>Negativas</th>
  </tr>
  <tr>
    <td>Motor óptimo para cada caso</td>
    <td>Mayor complejidad operativa</td>
  </tr>
  <tr>
    <td>Mejor rendimiento</td>
    <td>Múltiples puntos de respaldo</td>
  </tr>
  <tr>
    <td>Escalabilidad independiente</td>
    <td>Coordinación entre motores</td>
  </tr>
</table>

<div style="text-align: justify">

### CAR relacionados

- CAR-001 (cálculo <5s con Redis)
- CAR-004 (integridad en PostgreSQL)
- CAR-005 (MongoDB para anomalías)
- CAR-007 (OpenSearch para logs)

---

## ADR-005: Comunicación asíncrona mediante eventos

</div>

<table align="center">
  <tr>
    <td><b>Estado</b></td>
    <td>✅ Aceptado</td>
  </tr>
  <tr>
    <td><b>Fecha</b></td>
    <td>Mayo 2026</td>
  </tr>
  <tr>
    <td><b>Responsable</b></td>
    <td>Equipo de Arquitectura</td>
  </tr>
</table>

<div style="text-align: justify">

### Contexto

El sistema necesita desacoplar el registro de logs, la validación de anomalías y la actualización del histórico del flujo principal de pago, para no afectar la latencia de respuesta al usuario.

### Decisión

Se adopta una **arquitectura orientada a eventos (EDA)** con RabbitMQ como message broker (MVP local) y proyección a AWS MSK (Kafka) en cloud.

**Eventos principales:**

</div>

<table align="center">
  <tr>
    <th>Evento</th>
    <th>Productor</th>
    <th>Consumidor</th>
  </tr>
  <tr>
    <td><code>range.calculated</code></td>
    <td>Motor Tarifario</td>
    <td>Logs, Apps móviles</td>
  </tr>
  <tr>
    <td><code>trip.completed</code></td>
    <td>Motor Tarifario</td>
    <td>Anomalías, Pagos, Logs</td>
  </tr>
  <tr>
    <td><code>anomaly.detected</code></td>
    <td>Servicio Anomalías</td>
    <td>Alertas, Logs, Panel Admin</td>
  </tr>
  <tr>
    <td><code>payment.applied</code></td>
    <td>Servicio Pagos</td>
    <td>Logs, Apps</td>
  </tr>
</table>

<div style="text-align: justify">

### Alternativas consideradas

</div>

<table align="center">
  <tr>
    <th>Alternativa</th>
    <th>Razón de rechazo</th>
  </tr>
  <tr>
    <td>Comunicación síncrona para todo</td>
    <td>Mayor latencia; fallo en logs afecta pago</td>
  </tr>
  <tr>
    <td>Sin broker (llamadas directas)</td>
    <td>Alto acoplamiento; difícil escalar</td>
  </tr>
  <tr>
    <td>Kafka desde MVP</td>
    <td>Sobrecarga operativa para proyecto local</td>
  </tr>
</table>

<div style="text-align: justify">

### Justificación

- **Desacoplamiento**: logs y anomalías no bloquean el pago
- **Resiliencia**: si logs falla, el viaje continúa
- **Trazabilidad**: todos los eventos quedan registrados (CAR-007)
- **Escalabilidad**: consumidores independientes
- **MVP pragmático**: RabbitMQ en Docker (fácil) + migración a Kafka planificada

### Consecuencias

</div>

<table align="center">
  <tr>
    <th>Positivas</th>
    <th>Negativas</th>
  </tr>
  <tr>
    <td>Bajo acoplamiento</td>
    <td>Complejidad de idempotencia</td>
  </tr>
  <tr>
    <td>Resiliencia mejorada</td>
    <td>Mensajes pueden llegar desordenados</td>
  </tr>
  <tr>
    <td>Escalabilidad de consumidores</td>
    <td>Dead Letter Queue para mensajes fallidos</td>
  </tr>
</table>

<div style="text-align: justify">

### CAR relacionados

- CAR-007 (registro y trazabilidad)
- CAR-010 (tolerancia a fallos)

---

## ADR-006: Degradación elegante ante fallos de APIs externas

</div>

<table align="center">
  <tr>
    <td><b>Estado</b></td>
    <td>✅ Aceptado</td>
  </tr>
  <tr>
    <td><b>Fecha</b></td>
    <td>Mayo 2026</td>
  </tr>
  <tr>
    <td><b>Responsable</b></td>
    <td>Equipo de Arquitectura</td>
  </tr>
</table>

<div style="text-align: justify">

### Contexto

El sistema depende de APIs externas (Google Maps, OSINERGMIN, tráfico) que pueden fallar o tener latencia. El sistema debe continuar operando.

### Decisión

Se implementa **degradación elegante (graceful degradation)** con las siguientes estrategias:

</div>

<table align="center">
  <tr>
    <th>Servicio</th>
    <th>Fallback</th>
    <th>Tiempo de degradación</th>
  </tr>
  <tr>
    <td><b>Google Maps</b></td>
    <td>Distancia estimada por coordenadas directas</td>
    <td>&lt;1 segundo</td>
  </tr>
  <tr>
    <td><b>OSINERGMIN</b></td>
    <td>Último precio conocido válido</td>
    <td>24 horas</td>
  </tr>
  <tr>
    <td><b>Tráfico API</b></td>
    <td>Multiplicador base (1.3x) según hora del día</td>
    <td>Tiempo real</td>
  </tr>
  <tr>
    <td><b>Sistemas internos</b></td>
    <td>Datos cacheados del usuario</td>
    <td>&lt;500 ms</td>
  </tr>
</table>

<div style="text-align: justify">

**Mecanismos adicionales:**
- Timeout configurable (3-5 segundos)
- Circuit Breaker (3 errores consecutivos)
- Retry con backoff exponencial (1s, 2s, 4s)
- Health checks continuos

### Alternativas consideradas

</div>

<table align="center">
  <tr>
    <th>Alternativa</th>
    <th>Razón de rechazo</th>
  </tr>
  <tr>
    <td>Detener el servicio si falla una API</td>
    <td>Inaceptable para disponibilidad</td>
  </tr>
  <tr>
    <td>Reintentos infinitos</td>
    <td>Puede sobrecargar el sistema</td>
  </tr>
  <tr>
    <td>Sin fallback (solo error)</td>
    <td>Mala experiencia de usuario</td>
  </tr>
</table>

<div style="text-align: justify">

### Justificación

- **Disponibilidad > 99.5%**: el sistema nunca se detiene completamente
- **CAR-010 explícito**: tolerancia a fallos es requisito
- **Contexto Lima**: tráfico variable; es preferible un estimado a ningún servicio

### Consecuencias

</div>

<table align="center">
  <tr>
    <th>Positivas</th>
    <th>Negativas</th>
  </tr>
  <tr>
    <td>Sistema siempre disponible</td>
    <td>Precio puede ser menos preciso</td>
  </tr>
  <tr>
    <td>Buena experiencia de usuario</td>
    <td>Complejidad de implementación</td>
  </tr>
  <tr>
    <td>Cumple SLO de disponibilidad</td>
    <td>Necesita monitoreo de calidad</td>
  </tr>
</table>

<div style="text-align: justify">

### CAR relacionados

- CAR-010 (tolerancia a fallos, degradación elegante)
- CAR-009 (integración con APIs externas)

---

## ADR-007: Filtro de anomalías para protección del histórico

</div>

<table align="center">
  <tr>
    <td><b>Estado</b></td>
    <td>✅ Aceptado</td>
  </tr>
  <tr>
    <td><b>Fecha</b></td>
    <td>Mayo 2026</td>
  </tr>
  <tr>
    <td><b>Responsable</b></td>
    <td>Equipo de Arquitectura</td>
  </tr>
</table>

<div style="text-align: justify">

### Contexto

El histórico de viajes alimenta la variable 7/7 (aprendizaje) del Motor Tarifario. Si entran datos corruptos o atípicos (GPS erróneo, rutas inválidas), el modelo de aprendizaje se degrada.

### Decisión

Se implementa un **Servicio de Anomalías** que valida todos los datos post-viaje antes de su ingreso al histórico.

**Flujo de validación:**
1. Recibe `precio_real` y datos GPS del viaje
2. Verifica contra umbrales estadísticos configurados en panel admin
3. Si es válido → pasa a MongoDB (Histórico)
4. Si es inválido → corrige si es posible, o descarta y registra en colección `Anomalia`

### Alternativas consideradas

</div>

<table align="center">
  <tr>
    <th>Alternativa</th>
    <th>Razón de rechazo</th>
  </tr>
  <tr>
    <td>No filtrar, almacenar todo</td>
    <td>Datos corruptos contaminan el aprendizaje</td>
  </tr>
  <tr>
    <td>Solo corrección manual</td>
    <td>No escala; operador humano es lento</td>
  </tr>
  <tr>
    <td>Descartar sin registro</td>
    <td>Pérdida de trazabilidad</td>
  </tr>
</table>

<div style="text-align: justify">

### Justificación

- **Calidad del aprendizaje**: el histórico solo contiene datos confiables (CAR-005)
- **Trazabilidad**: las anomalías se registran para auditoría
- **Configurabilidad**: umbrales ajustables desde panel admin (CAR-006)

### Consecuencias

</div>

<table align="center">
  <tr>
    <th>Positivas</th>
    <th>Negativas</th>
  </tr>
  <tr>
    <td>Histórico de alta calidad</td>
    <td>Algunos viajes no entran al aprendizaje</td>
  </tr>
  <tr>
    <td>Trazabilidad de datos descartados</td>
    <td>Procesamiento adicional post-viaje</td>
  </tr>
  <tr>
    <td>Configurable sin deploy</td>
    <td>Riesgo de umbrales mal configurados</td>
  </tr>
</table>

<div style="text-align: justify">

### CAR relacionados

- CAR-005 (filtro de anomalías para retroalimentación del histórico)
- CAR-006 (parametrización desde panel admin)

---

## ADR-008: Autenticación y autorización por roles (RBAC)

</div>

<table align="center">
  <tr>
    <td><b>Estado</b></td>
    <td>✅ Aceptado</td>
  </tr>
  <tr>
    <td><b>Fecha</b></td>
    <td>Mayo 2026</td>
  </tr>
  <tr>
    <td><b>Responsable</b></td>
    <td>Equipo de Seguridad + Arquitectura</td>
  </tr>
</table>

<div style="text-align: justify">

### Contexto

El sistema maneja información sensible: rangos tarifarios completos (solo para admin), datos personales de usuarios (Ley N° 29733) y trazabilidad de pagos. Se requiere control de acceso estricto.

### Decisión

Se implementa **autenticación OAuth2 / OIDC** con **JWT** (expiración 1 hora) y **Refresh Token** (7 días), más **RBAC** para autorización:

</div>

<table align="center">
  <tr>
    <th>Rol</th>
    <th>Permisos</th>
  </tr>
  <tr>
    <td><b>Pasajero</b></td>
    <td>Ver techo del rango, solicitar viaje, negociar precio</td>
  </tr>
  <tr>
    <td><b>Conductor</b></td>
    <td>Ver piso del rango, aceptar viaje, ver historial propio</td>
  </tr>
  <tr>
    <td><b>Administrador</b></td>
    <td>Ver rango completo, configurar reglas, ver reportes</td>
  </tr>
  <tr>
    <td><b>Auditor</b></td>
    <td>Solo lectura de logs y reportes</td>
  </tr>
</table>

<div style="text-align: justify">

**Medidas adicionales:**
- MFA (autenticación de dos factores) obligatorio para Administrador
- TLS 1.3 en todas las comunicaciones
- AES-256 para datos sensibles en reposo
- Cumplimiento OWASP API Top 10 y OWASP MASVS

### Alternativas consideradas

</div>

<table align="center">
  <tr>
    <th>Alternativa</th>
    <th>Razón de rechazo</th>
  </tr>
  <tr>
    <td>Sin autenticación</td>
    <td>Inaceptable por seguridad y ley peruana</td>
  </tr>
  <tr>
    <td>Solo JWT sin RBAC</td>
    <td>Todos los usuarios tendrían mismos permisos</td>
  </tr>
  <tr>
    <td>OAuth2 con proveedor externo (Google)</td>
    <td>Dependencia externa; se prefiere Keycloak local</td>
  </tr>
</table>

<div style="text-align: justify">

### Justificación

- **Ley Peruana N° 29733**: protección de datos personales
- **Asimetría de información**: solo admin ve rango completo
- **OWASP compliance**: seguridad desde el diseño

### Consecuencias

</div>

<table align="center">
  <tr>
    <th>Positivas</th>
    <th>Negativas</th>
  </tr>
  <tr>
    <td>Control de acceso granular</td>
    <td>Mayor complejidad de implementación</td>
  </tr>
  <tr>
    <td>Cumplimiento normativo</td>
    <td>Gestión de tokens y refresh</td>
  </tr>
  <tr>
    <td>Seguridad desde el diseño</td>
    <td>MFA añade fricción para admin</td>
  </tr>
</table>

<div style="text-align: justify">

### CAR relacionados

- CAR-002 (visualización asimétrica por rol)
- CAR-006 (panel admin con control de acceso)

---

## Resumen de ADR

</div>

<table align="center">
  <tr>
    <th>ID</th>
    <th>Decisión</th>
    <th>Estado</th>
    <th>CAR relacionados</th>
  </tr>
  <tr>
    <td>ADR-001</td>
    <td>Microservicios</td>
    <td>✅ Aceptado</td>
    <td>CAR-001, CAR-010</td>
  </tr>
  <tr>
    <td>ADR-002</td>
    <td>Visualización asimétrica</td>
    <td>✅ Aceptado (bloqueado)</td>
    <td>CAR-002, CAR-003</td>
  </tr>
  <tr>
    <td>ADR-003</td>
    <td>Regla de pago invariante</td>
    <td>✅ Aceptado (bloqueado)</td>
    <td>CAR-004</td>
  </tr>
  <tr>
    <td>ADR-004</td>
    <td>Base de datos poliglota</td>
    <td>✅ Aceptado</td>
    <td>CAR-001, CAR-004, CAR-005, CAR-007</td>
  </tr>
  <tr>
    <td>ADR-005</td>
    <td>Comunicación asíncrona (EDA)</td>
    <td>✅ Aceptado</td>
    <td
