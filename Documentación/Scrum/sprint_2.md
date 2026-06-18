# Sprint 2 – Desarrollo del MVP

## Información general

- **Proyecto:** Motor Tarifario Inteligente para inDrive en Lima Metropolitana
- **Sprint:** 2
- **Duración estimada:** 2 semanas
- **Objetivo del sprint:** Implementar las funcionalidades principales del MVP relacionadas con el cálculo tarifario, la visualización diferenciada por rol y la integración inicial entre la aplicación móvil, los microservicios y el panel administrativo.

---

## Sprint Goal

Desarrollar una versión funcional del motor tarifario que permita calcular un rango de precios para un viaje, mostrar información específica para pasajeros y conductores, y registrar la información generada para su posterior análisis.

---

## Product Backlog seleccionado

| ID | Historia de usuario | Prioridad |
|----|---------------------|------------|
| HU-05 | Como pasajero, quiero visualizar una tarifa máxima estimada antes de iniciar un viaje. | Alta |
| HU-06 | Como conductor, quiero visualizar un ingreso mínimo garantizado para decidir si acepto un viaje. | Alta |
| HU-07 | Como sistema, quiero calcular un rango tarifario basado en variables dinámicas. | Alta |
| HU-08 | Como administrador, quiero configurar parámetros tarifarios desde el panel web. | Media |
| HU-09 | Como sistema, quiero almacenar el historial de cálculos realizados. | Media |

---

## Tareas del Sprint

### Backend

- Implementar el microservicio de cálculo tarifario.
- Crear endpoints para consultar tarifas estimadas.
- Registrar cálculos e historiales en la base de datos.
- Integrar servicios de geolocalización simulados.

### Aplicación móvil

- Diseñar la interfaz de solicitud de viaje.
- Mostrar el rango tarifario estimado.
- Implementar vistas diferenciadas para pasajero y conductor.


### Panel administrativo

- Configurar parámetros tarifarios.
- Visualizar métricas básicas del sistema.
- Gestionar usuarios y roles de prueba.

### Infraestructura

- Configurar variables de entorno.
- Validar la persistencia de datos.

---

## Criterios de aceptación

- El sistema calcula un rango tarifario considerando las variables configuradas.
- El pasajero visualiza la tarifa máxima estimada.
- El conductor visualiza el ingreso mínimo garantizado.
- La información de los cálculos queda almacenada para auditoría.

---

## Entregables

- Microservicio de cálculo tarifario funcional.
- Aplicación móvil conectada al backend.
- Panel administrativo operativo.
- Base de datos con persistencia configurada.
- Documentación técnica actualizada.

---

## Riesgos identificados

- Retrasos en la integración entre microservicios.
- Inconsistencias en el cálculo de tarifas.
- Problemas de sincronización entre entornos de desarrollo.

---

## Definición de terminado (Definition of Done)

- Código implementado y versionado en GitHub.
- Funcionalidades probadas en entorno local.
- Documentación actualizada.
- Revisión y aprobación del equipo.

---

## Reunión de Sprint

> Evidencia fotográfica de la reunión del Sprint 2.

![Evidencia de Reunión](imgs/evidencia.jpeg)

### Participantes

- Matias Dario
- Nardy Condori
- Juan Diego Lopez
- Enrique Orozco
- Luis Valenzela

### Acuerdos

- Revisar el avance del motor tarifario al cierre del sprint.
- Priorizar la integración entre la aplicación móvil y el backend.
- Registrar incidencias y bloqueos durante las reuniones diarias.

