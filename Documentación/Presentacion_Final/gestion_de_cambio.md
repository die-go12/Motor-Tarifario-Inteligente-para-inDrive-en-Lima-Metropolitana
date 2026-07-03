# Gestión de Configuración y Control de Cambios

Este documento registra formalmente el proceso de gobernanza y control de cambios aplicado durante el ciclo de vida del desarrollo del MVP. Cada desviación consciente frente al diseño inicial o arquitectura base fue gestionada bajo un flujo de ingeniería estricto para mitigar riesgos técnicos, de costo y de cronograma.

---

## 1. Proceso Formal de Gestión de Cambios (CMS)

El equipo adoptó un flujo estructurado de **5 etapas** para la evaluación de Solicitudes de Cambio (*Change Request* - CR):

[1. Identificación] ──> [2. Análisis de Impacto] ──> [3. Evaluación/Calificación] ──> [4. Resolución (Aprobar/Rechazar)] ──> [5. Validación / Cierre]

Para realizar la **Fase 3 (Evaluación y Calificación)** de forma objetiva, el comité de control de cambios del proyecto evalúa las alternativas competidoras en una matriz de puntuación de 1 a 5 (donde 5 es el impacto más favorable) bajo cuatro criterios de ingeniería:

- **Viabilidad Técnica (VT):** Complejidad de desarrollo e integración con el stack actual.
- **Impacto en Cronograma (IC):** Riesgo de retrasar las entregas comprometidas en el Sprint Backlog.
- **Costo de Infraestructura (CI):** Consumo de recursos de cómputo local (RAM/CPU) y sobrecarga arquitectónica.
- **Valor de Negocio (VN):** Preservación de las reglas core del MVP y cumplimiento de los Atributos de Calidad.

---

# 2. Registro y Calificación de Change Requests (Matriz de Control Estilo Excel)

A continuación, se detallan las hojas de cálculo transaccionales de control técnico (`change_requests_log.xlsx`). En cada caso se ponderan la opción original frente a la nueva alternativa propuesta.

---

## CR-01 — Fuentes externas: Combustible y Tráfico

**Descripción:** Modificar el origen de datos dinámicos debido a restricciones operativas externas.

| Alternativa Evaluada | VT | IC | CI | VN | Puntaje Total | Estado | Justificación del Resultado |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Opción Original:** APIs en vivo (OSINERGMIN/Waze) | 1 | 2 | 2 | 5 | **10 / 20** | **Descartada** | OSINERGMIN no expone endpoints públicos de baja latencia; APIs de tráfico añaden costos inviables. |
| **Opción Nueva:** Datos locales + Tráfico simulado | 5 | 5 | 5 | 4 | **19 / 20** | **Ganadora** | **Aprobado:** Elimina dependencias externas críticas en el MVP y asegura estabilidad local en las pruebas. |

---

## CR-02 — Arquitectura del Bus de Eventos

**Descripción:** Optimización del backend de mensajería asíncrona para la integración de microservicios.

| Alternativa Evaluada | VT | IC | CI | VN | Puntaje Total | Estado | Justificación del Resultado |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Opción Original:** Clúster dedicado RabbitMQ | 3 | 2 | 2 | 5 | **12 / 20** | **Descartada** | Elevada sobrecarga de configuración de colas/DLQ y consumo de recursos para la fase MVP. |
| **Opción Nueva:** Bus ligero con Redis Pub/Sub | 5 | 5 | 5 | 4 | **19 / 20** | **Ganadora** | **Aprobado:** Redis ya existía en el stack de caché. Cero sobrecosto de infraestructura y latencia en milisegundos. |

---

## CR-03 — Recálculo de Ruta Post-Viaje

**Descripción:** Ajuste en el método de obtención de la distancia y el monto final de liquidación.

| Alternativa Evaluada | VT | IC | CI | VN | Puntaje Total | Estado | Justificación del Resultado |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Opción Original:** Tracking y polling continuo con GPS real | 2 | 2 | 3 | 5 | **12 / 20** | **Descartada** | Alta complejidad para simular hardware y pérdida de paquetes de geolocalización en Docker local. |
| **Opción Nueva:** Precio real ingresado por conductor + Regla | 5 | 5 | 5 | 4 | **19 / 20** | **Ganadora** | **Aprobado:** Asegura el flujo transaccional sin fricción técnica. El algoritmo matemático blinda los límites. |

---

## CR-04 — Topología y Despliegue de Servicios

**Descripción:** Consolidación de la cantidad de contenedores físicos en el ecosistema.

| Alternativa Evaluada | VT | IC | CI | VN | Puntaje Total | Estado | Justificación del Resultado |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Opción Original:** 7 Microservicios + Suite OpenSearch | 2 | 3 | 1 | 5 | **11 / 20** | **Descartada** | Superaba los 12GB de consumo de RAM local, provocando caídas (*Out Of Memory*) en desarrollo. |
| **Opción Nueva:** 4 Microservicios + API Gateway + MongoDB | 5 | 4 | 4 | 5 | **18 / 20** | **Ganadora** | **Aprobado:** Mantiene el desacoplamiento lógico consolidando logs de auditoría nativos en MongoDB. |

---

### CR-05 — Rango de Negociación Dinámica

**Descripción:** Ajuste matemático en el motor de precios bajo condiciones de demanda base.

| Alternativa Evaluada | VT | IC | CI | VN | Puntaje Total | Estado | Justificación del Resultado |
|----------------------|:--:|:--:|:--:|:--:|:-------------:|---------|-----------------------------|
| Opción Original: Cálculo determinista estricto puro | 5 | 4 | 5 | 1 | **15/20** | Descartada | En escenarios de tráfico bajo generaba un rango de negociación de ancho cero (`[X, X]`), impidiendo el proceso de negociación. |
| Opción Nueva: Banda mínima configurable (`minRangeRatio`) | 5 | 5 | 5 | 5 | **20/20** | Ganadora | Garantiza una banda mínima de negociación mediante un factor configurable (`minRangeRatio = 1.2`), preservando la flexibilidad del proceso sin superar los límites establecidos. |

---

### CR-06 — Pasarela de Comunicación en Tiempo Real (CAMBIO RECHAZADO)

**Descripción:** Evaluación de una arquitectura distribuida para WebSockets sin un adaptador centralizado para la transmisión de ofertas.

| Alternativa Evaluada | VT | IC | CI | VN | Puntaje Total | Estado | Justificación del Resultado |
|----------------------|:--:|:--:|:--:|:--:|:-------------:|---------|-----------------------------|
| Opción Original: **WebSocket en instancia única + estado persistente en base de datos** | 5 | 4 | 5 | 4 | **18/20** | Ganadora | Mantiene la comunicación en tiempo real mediante una única instancia del Gateway y garantiza la persistencia consistente del estado de las negociaciones en la base de datos. |
| Opción Propuesta: Clúster distribuido de WebSockets sin adaptador centralizado | 1 | 2 | 3 | 2 | **08/20** | Rechazada | Al distribuir el Gateway sin un mecanismo de sincronización (por ejemplo, Redis Adapter), los eventos podían perderse cuando usuario y conductor se conectaban a instancias distintas. |

---

# 3. Detalle Técnico de los Cambios Gestionados

## CR-01 — Fuentes externas: APIs en tiempo real → Datos oficiales locales

- **Identificación:** El requerimiento original contemplaba consumir APIs externas en tiempo real para variables de combustible y tráfico zonal (CAR-009).

- **Análisis de Impacto:** OSINERGMIN no expone una API pública directa de baja latencia en tiempo real, y los servicios de tráfico en vivo (Waze/TomTom) requerían costos de suscripción elevados. Google Maps sí es viable. Afecta directamente las variables de cálculo del costo base (CAR-009).

- **Análisis Comparativo (Por qué gana la nueva opción):** La opción original se calificó con baja viabilidad técnica (VT: 1) porque forzar el consumo externo mediante scraping no oficial añadía inestabilidad y latencias impredecibles que violaban el SLO de respuesta de 5 segundos. La nueva opción (Puntaje: 19/20) ganó al sustituir el consumo en vivo por el procesamiento local de datasets estructurados oficiales de Datos Abiertos–Facilito, aislando al motor de fallos de red de terceros.

- **Implementación:** El componente `FuelService` lee el costo por galón del archivo de datos estructurados cargado en el sistema; el factor de congestión se procesa mediante lógica determinista y se complementa con Google Maps en vivo para distancias reales. El contrato de integración no cambió.

- **Seguimiento y Validación:** Se verificó mediante pruebas de caja negra que el motor calcula los rangos asimétricos con datos oficiales locales estables. Su migración definitiva a una API real fue enviada al roadmap.

### CR-02 — Bus de eventos: RabbitMQ → Redis Pub/Sub

- **Identificación:** El diseño inicial especificado en el ADR-005 designaba a RabbitMQ como el message broker del sistema de eventos asíncronos.

- **Análisis de Impacto:** Introducir un bróker de mensajería independiente agregaba un componente de infraestructura adicional, afectando la comunicación asíncrona entre `ms-pricing`, auditoría y `ms-reports`.

- **Análisis Comparativo (Por qué gana la nueva opción):** La opción original con RabbitMQ obtuvo un bajo puntaje en cronograma e infraestructura (IC: 2, CI: 2) debido a que levantar un clúster dedicado requería configuraciones complejas de *exchanges* y políticas de reintento que consumían tiempo crítico del core de negocio. La opción basada en Redis Pub/Sub (Puntaje: 19/20) se coronó ganadora porque Redis ya formaba parte activa de nuestra pila tecnológica para almacenamiento en caché; reutilizarlo eliminó la sobrecarga de componentes concurrentes locales.

- **Implementación:** El microservicio `ms-pricing` publica de forma transparente los eventos críticos (`pricing.calculated`, `pricing.settled`, `anomaly.detected`) directamente hacia los canales de Redis, donde los servicios de auditoría y `ms-reports` actúan como subscriptores activos.

- **Seguimiento y Validación:** El flujo de eventos se encuentra completamente operativo. La documentación fue actualizada formalmente en el ADR-005, y la migración a RabbitMQ quedó registrada en el roadmap.

---

### CR-03 — Recálculo post-viaje: GPS real → Precio real ingresado

- **Identificación:** El requerimiento original (**CAR-004**) establecía que el precio final del viaje debía recalcularse automáticamente a partir de la información obtenida mediante GPS al finalizar la ruta.

- **Análisis de impacto:** La captura y el procesamiento continuo de trazas GPS requerían una infraestructura de comunicación, geolocalización y simulación móvil que no estaba disponible de forma homogénea dentro del alcance del MVP, incrementando significativamente la complejidad técnica y el riesgo de implementación.

- **Análisis comparativo (¿Por qué la nueva opción es superior?):** La propuesta original, basada en el seguimiento continuo mediante geofencing, obtuvo una baja puntuación en impacto sobre el cronograma (**IC: 2**) debido al alto riesgo que representaba para la estabilidad del sprint. La simulación de recorridos GPS en un entorno basado en contenedores Docker, sin una aplicación móvil completamente desarrollada, producía resultados inconsistentes y dificultaba la validación del cálculo. En contraste, la alternativa seleccionada (**19/20**) traslada la captura del precio real al momento en que el conductor finaliza el viaje e ingresa el valor correspondiente. Esta decisión reduce la complejidad de la solución y garantiza la correcta liquidación mediante la ejecución inmediata de las reglas de negocio en el backend.

- **Implementación:** La aplicación móvil registra el parámetro `realPrice` al finalizar el viaje y el microservicio `ms-pricing` calcula la liquidación final aplicando la siguiente regla:

$$
\text{pago}=\max(\text{mínimo},\min(\text{precio}_{\text{real}},\text{máximo}))
$$

Esta expresión garantiza que el pago final nunca sea inferior al límite mínimo acordado ni superior al límite máximo establecido durante la negociación.

- **Seguimiento y validación:** Se verificó la consistencia de las liquidaciones mediante pruebas de persistencia en la base de datos, confirmando que los valores calculados se almacenan de forma íntegra y consistente. La incorporación del recálculo automático basado en datos GPS reales se mantiene como una mejora planificada para versiones futuras del sistema.

---

### CR-04 — Alcance de servicios e infraestructura de soporte

- **Identificación:** El plano arquitectónico original proyectaba fragmentar el ecosistema en aproximadamente 7 microservicios independientes, sumando un stack extendido con OpenSearch para la centralización de logs y MFA para autenticación de administración.

- **Análisis de Impacto:** Dividir todos los servicios y desplegar componentes pesados como OpenSearch o flujos avanzados de MFA excedía el alcance operativo y el tiempo establecido para la entrega del MVP.

- **Análisis Comparativo (Por qué gana la nueva opción):** La alternativa original fue penalizada severamente en costo de infraestructura (CI: 1) ya que el análisis demostró que levantar las imágenes de OpenSearch requería un aprovisionamiento local superior a los 12GB de RAM, rompiendo los entornos locales de desarrollo. La nueva opción (Puntaje: 18/20) resultó ganadora al consolidar físicamente los 7 servicios lógicos en 4 contenedores físicos más la API Gateway, absorbiendo los logs transaccionales directamente en colecciones de MongoDB.

- **Implementación:** El sistema opera con 4 microservicios de negocio (`ms-base`, `ms-pricing`, `ms-integration`, `ms-reports`) más el componente centralizado `api-gateway`, todos ellos orquestados con Docker.

- **Seguimiento y Validación:** El sistema se encuentra completamente funcional *end-to-end* con un consumo de recursos controlado. Los servicios e infraestructura restantes viven formalmente en el roadmap.

---

### CR-05 — Rango de negociación: Evitación de bandas de ancho cero

- **Identificación:** Durante la ejecución de escenarios con factores multiplicadores dinámicos mínimos (tráfico bajo, hora base y demanda neutra = `1.0`), el algoritmo generaba un límite máximo idéntico al límite mínimo (`[X, X]`), produciendo una banda de negociación de ancho cero.

- **Análisis de impacto:** Una banda sin dispersión invalidaba la lógica de negociación acotada (**CAR-003**). Al no existir un intervalo de precios, ninguna oferta podía ubicarse válidamente entre los límites definidos, impidiendo el proceso de negociación.

- **Análisis comparativo (¿Por qué la nueva opción es superior?):** La implementación original obtuvo la puntuación mínima en valor de negocio (**VN: 1**) porque, aunque era matemáticamente consistente con las variables de entrada, comprometía el funcionamiento del producto al eliminar la flexibilidad necesaria para la negociación. En contraste, la nueva alternativa (**Puntaje: 20/20**) fue seleccionada al incorporar un coeficiente configurable (`minRangeRatio = 1.2`), el cual garantiza una banda mínima equivalente al **20 %** sobre el límite inferior y preserva la experiencia de usuario.

- **Implementación:** El componente de cálculo del servicio `ms-pricing` determina el límite superior del rango garantizando que:

$$
\text{límite}_{\text{máximo}} \geq \text{límite}_{\text{mínimo}} \times \text{minRangeRatio}
$$

donde `minRangeRatio = 1.2`, equivalente a una banda mínima del **20 %** respecto al límite inferior.

El parámetro `minRangeRatio` forma parte de la configuración dinámica del motor de precios, permitiendo ajustar la amplitud mínima de la banda de negociación sin modificar el código fuente.

- **Seguimiento y validación:** Se incorporaron pruebas automatizadas para verificar que, incluso bajo condiciones de demanda mínima o sin tarifa dinámica (*surge*), el rango siempre conserva una banda de negociación válida.

---
  
### CR-06 — Pasarela de Comunicación: Desacoplamiento de WebSockets en el Gateway sin adaptador centralizado (SOLICITUD RECHAZADA)

- **Identificación:** Durante el diseño de las historias de usuario **US-003** y **US-004**, se evaluó una propuesta para migrar el Gateway de tiempo real hacia un clúster de múltiples instancias WebSocket sin un mecanismo de sincronización compartida, con el objetivo de mejorar la escalabilidad de la transmisión de ofertas.

- **Análisis de impacto:** La propuesta modificaba significativamente la arquitectura de comunicación en tiempo real, ya que requería balanceadores con *sticky sessions* y un mecanismo adicional para sincronizar el estado entre las distintas instancias del Gateway.

- **Análisis comparativo (¿Por qué la propuesta fue rechazada?):** La alternativa obtuvo una calificación de **08/20** debido a su baja viabilidad técnica dentro del cronograma del MVP. En un escenario con múltiples instancias del Gateway, un pasajero podía mantener su conexión WebSocket en una instancia mientras el conductor enviaba una oferta a otra diferente. Al no existir un adaptador centralizado para compartir eventos (como un **Redis WebSocket Adapter**), las notificaciones podían perderse. Incorporar dicho componente implicaba aumentar considerablemente la complejidad de la infraestructura y el riesgo del proyecto.

- **Resolución:** Se mantuvo el diseño original basado en una **única instancia del Gateway WebSocket**, mientras que el estado de los viajes, las ofertas y las contraofertas continúa persistiendo de forma centralizada en la base de datos de `ms-base`. La evolución hacia un clúster distribuido de WebSockets con sincronización mediante Redis quedó planificada como una mejora para futuras versiones del sistema.
---

# 4. Panorama Final de Desviaciones (Diseño Original vs. Entregado)

La siguiente tabla técnica contrasta de manera consolidada las desviaciones conscientes entre el diseño inicial planteado en los registros arquitectónicos históricos (ADR) frente a lo entregado en la versión de producción actual del MVP:

| Dimensión de Diseño | Lo contemplaba el diseño original | Lo entregado en el MVP | Por qué (Justificación de Ingeniería) | Dónde se documenta |
| :--- | :--- | :--- | :--- | :--- |
| **Topología de Servicios** | 6 componentes: Motor, Integración, Anomalías, Logs/Auditoría, Reportes, Panel. | **4 Microservicios + API Gateway** (`api-gateway`, `ms-base`, `ms-pricing` con Anomalías + Logs, `ms-integration`, `ms-reports`). | Reducir la complejidad operativa del MVP; los módulos de Anomalías y Logs no justificaban servicios propios en esta fase. | **CR-04** / ADR-001 |
| **Arquitectura de Mensajería** | Bus de eventos distribuido con RabbitMQ (+ Kafka en entorno cloud). | **Redis Pub/Sub** para la comunicación asíncrona de eventos (`pricing.calculated`, `pricing.settled`, `anomaly.detected`). | Redis ya formaba parte del stack activo → Permite omitir infraestructura nueva y disminuir la latencia interna. | **CR-02** / ADR-005 |
| **Estrategia de Log Centralizado** | Base de datos políglota integrando la suite de OpenSearch para logs. | **PostgreSQL + MongoDB + Redis**. Trazas de logs y auditoría persistidas de forma nativa en MongoDB. | OpenSearch agregaba un motor adicional pesado no justificado para el volumen de datos transaccionales del MVP. | ADR-004 |
| **Políticas de Seguridad** | Autenticación federada vía Keycloak/OIDC + MFA para admin + cifrado TLS/AES. | Autenticación basada en **JWT** (*access token* + *refresh token* con rotación del identificador `jti`) + RBAC con 4 roles. | Implementación de control de acceso esencial seguro sin sobre-infraestructura; MFA y hardening avanzado quedaron diferidos para futuras versiones. | ADR-008 |
| **Estrategia de Cierre de Viaje** | Recálculo automático post-viaje mediante trazas de GPS real en ruta. | Captura manual del **precio real final ingresado por el conductor** al completar el viaje. | La infraestructura y simulación de hardware GPS en tiempo real continuo no estaba disponible para el MVP. | **CR-03** |

---

> **Nota:** Las desviaciones descritas en esta sección son conscientes y se encuentran plenamente trazadas. Mientras el diseño conceptual a largo plazo se conserva intacto dentro de los ADR individuales, este documento actúa como la fuente de verdad de lo que se entregó físicamente y el porqué de sus decisiones. Todo el alcance no implementado fue derivado formalmente al *Roadmap* tecnológico y al backlog de trabajo futuro (Sprint 2 §13).
