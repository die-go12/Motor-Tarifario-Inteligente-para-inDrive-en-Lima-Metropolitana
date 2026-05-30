# Sprint Retrospective – Sprint 1: Fase Pre-Viaje

## Información General

| Campo | Valor |
|---------|---------|
| Proyecto | Motor Tarifario Inteligente para inDrive en Lima Metropolitana |
| Sprint | Sprint 1 |
| Duración | 2 semanas |
| Metodología | Scrum Híbrido (Scrum + MoSCoW + DDD + ADR) |
| Fecha | Mayo 2026 |

---

# Objetivo del Sprint

Implementar la fase Pre-Viaje del sistema, permitiendo que el pasajero solicite un viaje, obtenga un rango tarifario calculado por el Motor Tarifario Inteligente, negocie con el conductor dentro de límites permitidos y formalice el inicio del viaje mediante aceptación bilateral.

---

# Resumen del Sprint

Durante el Sprint 1 se trabajó en la construcción de la base funcional del sistema enfocada en el flujo previo al inicio del viaje. Se avanzó en la definición de la arquitectura del backend, la configuración inicial del entorno Docker, el desarrollo de componentes de interfaz para la visualización asimétrica y la integración preliminar con servicios externos necesarios para el cálculo tarifario.

El equipo logró establecer las bases técnicas que permitirán desarrollar la lógica principal del Motor Tarifario Inteligente durante los siguientes sprints.

---

# ¿Qué salió bien?

### Backend

- Definición de la arquitectura basada en NestJS.
- Diseño inicial de endpoints para solicitudes de viaje.
- Avance en la estructura de microservicios.
- Definición de la lógica preliminar para cálculo tarifario.

### Frontend

- Construcción inicial de pantallas móviles en React Native + Expo.
- Diseño de componentes para visualización asimétrica.
- Avances en navegación y estructura visual de la aplicación.

### DevOps

- Configuración inicial del repositorio GitHub.
- Creación de rama de trabajo para Docker.
- Implementación de Docker Compose.
- Integración de:

  - PostgreSQL
  - MongoDB
  - Redis

- Configuración de variables de entorno.
- Creación de red interna Docker para comunicación entre servicios.

### Gestión del Proyecto

- Product Backlog refinado.
- Sprint Backlog actualizado.
- Definición de historias de usuario.
- Priorización mediante metodología MoSCoW.
- Organización de tareas por responsables.

---

# ¿Qué podría mejorar?

### Backend

- Completar integración real con APIs externas.
- Implementar validaciones más robustas.
- Definir contratos API mediante Swagger.

### Frontend

- Corregir errores visuales detectados durante pruebas.
- Mejorar experiencia de usuario durante negociación.
- Implementar manejo de estados globales.

### DevOps

- Incorporar Health Checks en Docker Compose.
- Configurar GitHub Actions para CI/CD.
- Crear scripts automáticos para inicialización del entorno.
- Documentar procedimientos de despliegue.

### Equipo

- Mejor coordinación entre frontend y backend.
- Mayor frecuencia de revisión de Pull Requests.
- Definir estándares de nomenclatura desde etapas tempranas.

---

# Problemas Encontrados

| Problema | Impacto | Solución Aplicada |
|-----------|-----------|------------------|
| Conflictos de ramas Git | Medio | Uso de Pull antes de Push |
| Configuración inicial Docker | Bajo | Documentación y pruebas locales |
| Dependencias de APIs externas | Medio | Uso temporal de datos simulados |
| Bugs visuales en la aplicación móvil | Alto | Corrección planificada para Sprint 2 |

---

# Lecciones Aprendidas

### Técnicas

- Docker simplifica significativamente la preparación del entorno local.
- El uso combinado de PostgreSQL, MongoDB y Redis requiere una clara definición de responsabilidades.
- La documentación temprana reduce problemas de integración.

### Organizacionales

- La división por dominios facilita el trabajo paralelo.
- Los Pull Requests permiten mantener la calidad del código.
- Las reuniones periódicas ayudan a detectar bloqueos rápidamente.

---

# Acciones para el Sprint 2

## Backend

- Completar lógica de recálculo post-viaje.
- Implementar regla de pago invariante.
- Desarrollar filtro de anomalías.

## Frontend

- Finalizar pantallas pendientes.
- Corregir errores detectados en pruebas.
- Implementar panel administrativo.

## DevOps

- Implementar Health Checks.
- Configurar GitHub Actions.
- Automatizar validaciones básicas.
- Mejorar documentación de despliegue.

## QA

- Incrementar cobertura de pruebas.
- Diseñar casos de prueba para la fase post-viaje.
- Validar escenarios límite.

---

# Conclusión

El Sprint 1 permitió construir las bases tecnológicas del proyecto y validar la arquitectura general propuesta. Aunque varias funcionalidades aún se encuentran en desarrollo, el equipo logró establecer un entorno local funcional, una estructura de microservicios sólida y avances importantes en la aplicación móvil.

Los resultados obtenidos permiten iniciar el Sprint 2 con una infraestructura estable y una visión clara de las siguientes funcionalidades a implementar.
