
# Sprint Planning – Sprint 1: Fase Pre-Viaje

## Información General

| Elemento    | Descripción                                                    |
| ----------- | -------------------------------------------------------------- |
| Proyecto    | Motor Tarifario Inteligente para inDrive en Lima Metropolitana |
| Sprint      | Sprint 1                                                       |
| Duración    | 2 semanas                                                      |
| Metodología | Scrum + MoSCoW + ADR + DDD                                     |

---

# Sprint Goal

Implementar la fase Pre-Viaje del sistema permitiendo que un pasajero solicite un viaje, obtenga un rango tarifario calculado por el Motor Tarifario Inteligente, negocie el precio con un conductor dentro de límites establecidos y formalice el inicio del viaje mediante aceptación bilateral.

---

# Aplicación de la Metodología Híbrida

## Scrum

Durante este Sprint se desarrollarán iterativamente las funcionalidades correspondientes a las historias US-001, US-002, US-003 y US-004 mediante reuniones Daily, revisión continua del Sprint Backlog y validación incremental de funcionalidades.

## MoSCoW

Las historias seleccionadas para este Sprint pertenecen a la categoría **Must Have**, ya que representan la funcionalidad mínima necesaria para validar el MVP.

| Historia | Clasificación |
| -------- | ------------- |
| US-001   | Must Have     |
| US-002   | Must Have     |
| US-003   | Must Have     |
| US-004   | Must Have     |

## Domain Driven Design (DDD)

### Pricing Domain

Responsable de:

* Cálculo del rango tarifario.
* Negociación asistida.
* Visualización asimétrica.

Historias relacionadas:

* US-001
* US-002
* US-003

### Trip Domain

Responsable de:

* Solicitud de viaje.
* Aceptación bilateral.
* Gestión de estados del viaje.

Historias relacionadas:

* US-004

### Infrastructure Domain

Responsable de:

* Docker Compose.
* PostgreSQL.
* MongoDB.
* Redis.
* Variables de entorno.

## ADR Aplicados

* ADR-001: Uso de NestJS para Backend.
* ADR-002: Uso de React Native para App Móvil.
* ADR-003: Uso de PostgreSQL para datos transaccionales.
* ADR-004: Uso de MongoDB para auditoría y trazabilidad.
* ADR-005: Uso de Redis para sesiones y caché.
* ADR-006: Uso de Docker Compose para desarrollo local.

---

# Historias de Usuario Seleccionadas

| ID     | Historia de Usuario                     | Prioridad |
| ------ | --------------------------------------- | --------- |
| US-001 | Solicitud de viaje con cálculo de rango | Alta      |
| US-002 | Visualización asimétrica del precio     | Alta      |
| US-003 | Negociación acotada dentro del rango    | Alta      |
| US-004 | Aceptación bilateral e inicio de viaje  | Alta      |

---

# Sprint Backlog

## US-001 – Solicitud de viaje con cálculo de rango

### Objetivo

Permitir al pasajero solicitar un viaje y obtener un rango tarifario calculado en menos de 5 segundos.

### Tareas

| ID     | Tarea                                                              |
| ------ | ------------------------------------------------------------------ |
| S1-T01 | Crear endpoint de solicitud de viaje                               |
| S1-T02 | Integrar Google Maps para distancia y tiempo estimado              |
| S1-T03 | Integrar OSINERGMIN para precio de combustible                     |
| S1-T04 | Integrar API de tráfico en tiempo real                             |
| S1-T05 | Implementar algoritmo de cálculo de rango                          |
| S1-T06 | Implementar mecanismo de degradación elegante ante fallos externos |
| S1-T07 | Realizar pruebas funcionales y de rendimiento                      |

---

## US-002 – Visualización Asimétrica del Precio

### Objetivo

Mostrar información distinta a pasajero y conductor sin revelar el rango completo.

### Tareas

| ID     | Tarea                                               |
| ------ | --------------------------------------------------- |
| S1-T08 | Implementar vista de precio máximo para pasajero    |
| S1-T09 | Implementar vista de precio mínimo para conductor   |
| S1-T10 | Implementar vista administrativa con rango completo |
| S1-T11 | Validar restricciones de visualización por rol      |
| S1-T12 | Ejecutar pruebas de seguridad y acceso              |

---

## US-003 – Negociación Acotada Dentro del Rango

### Objetivo

Permitir ofertas y contraofertas respetando el rango calculado.

### Tareas

| ID     | Tarea                                         |
| ------ | --------------------------------------------- |
| S1-T13 | Crear endpoint de registro de ofertas         |
| S1-T14 | Validar ofertas dentro del rango permitido    |
| S1-T15 | Implementar interfaz de negociación           |
| S1-T16 | Registrar todas las ofertas para trazabilidad |
| S1-T17 | Gestionar múltiples contraofertas             |
| S1-T18 | Ejecutar pruebas de límites y validaciones    |

---

## US-004 – Aceptación Bilateral e Inicio de Viaje

### Objetivo

Permitir que ambas partes acepten el precio acordado e iniciar el viaje.

### Tareas

| ID     | Tarea                                    |
| ------ | ---------------------------------------- |
| S1-T19 | Crear endpoint de aceptación bilateral   |
| S1-T20 | Implementar máquina de estados del viaje |
| S1-T21 | Registrar aceptación con timestamp       |
| S1-T22 | Notificar inicio de viaje a ambas partes |
| S1-T23 | Cambiar estado a "En Curso"              |
| S1-T24 | Activar captura GPS inicial              |
| S1-T25 | Ejecutar pruebas de flujo completo       |

---

# Dependencias Técnicas

## Backend

* NestJS
* Node.js
* PostgreSQL
* MongoDB
* Redis

## Frontend

* React Native
* Expo
* React Native Maps / Mapbox

## Infraestructura

* Docker Compose
* GitHub
* GitHub Actions

---

# Definition of Done (DoD)

Se considerará terminada una historia cuando:

* El código haya sido implementado.
* Exista Pull Request aprobado.
* Se hayan ejecutado pruebas unitarias.
* Se hayan ejecutado pruebas de integración.
* Se cumplan todos los criterios de aceptación.
* La documentación técnica se encuentre actualizada.
* La funcionalidad esté disponible en el entorno de desarrollo.

---

# Resultado Esperado

Al finalizar el Sprint 1 el sistema deberá permitir:

* Solicitar un viaje.
* Calcular un rango tarifario inteligente.
* Mostrar precios de forma asimétrica.
* Negociar dentro de límites permitidos.
* Aceptar el acuerdo entre pasajero y conductor.
* Iniciar formalmente el viaje.

---

# Evidencias Esperadas

* Capturas del backend funcionando.
* Capturas de Docker Compose operativo.
* Capturas de la aplicación móvil.
* Capturas de pruebas realizadas en Postman.
* Capturas de Pull Requests aprobados.
* Capturas de reuniones Daily.
