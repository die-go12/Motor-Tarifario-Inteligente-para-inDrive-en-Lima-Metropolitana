# Sprint Retrospective – Sprint 1: Fase Pre-Viaje

## Información General

| Campo | Valor |
|------|------|
| Proyecto | Motor Tarifario Inteligente para inDrive en Lima Metropolitana |
| Sprint | Sprint 1 |
| Duración | 2 semanas |
| Metodología | Scrum |
| Fecha | Mayo 2026 |

---

## Objetivo del Sprint

Implementar la fase Pre-Viaje del sistema, permitiendo que el pasajero solicite un viaje, el sistema calcule un rango tarifario inteligente, se muestre de forma asimétrica según rol, se permita la negociación dentro de límites controlados y se habilite la aceptación bilateral para iniciar el viaje.

---

## Resumen del Sprint

Durante el Sprint 1 se construyó la base funcional del sistema enfocada en el flujo pre-viaje, alineado a las historias US-001, US-002, US-003 y US-004.

Se avanzó en la arquitectura del backend, la implementación inicial de endpoints principales, el diseño de interfaces móviles y la lógica base del motor tarifario para cálculo de rangos.

Asimismo, se configuró el entorno de desarrollo con Docker Compose y se estableció una integración inicial mediante datos simulados para servicios externos como mapas, tráfico y combustible.

El resultado del sprint fue una base funcional coherente que permite continuar con la implementación del sistema completo en los siguientes sprints.

---

## ¿Qué salió bien?

### Backend
- Definición de arquitectura modular con NestJS.
- Implementación de endpoints principales del flujo de viaje (US-001 a US-004).
- Avance en la lógica base del cálculo de rango tarifario.
- Implementación inicial de la máquina de estados del viaje.

### Frontend
- Implementación inicial de pantallas en React Native + Expo.
- Desarrollo de la visualización asimétrica por rol (pasajero/conductor/admin).
- Interfaz básica de negociación entre usuarios.
- Estructura de navegación funcional.

### DevOps
- Configuración de Docker Compose.
- Integración de PostgreSQL, MongoDB y Redis.
- Definición de variables de entorno.
- Entorno local reproducible para el equipo.

### Gestión del Proyecto
- Refinamiento del Product Backlog.
- Priorización de historias con MoSCoW.
- Definición clara de alcance del Sprint 1.
- Organización del trabajo por equipos (Backend, Frontend, QA).

---

## ¿Qué podría mejorar?

### Backend
- Integración real de APIs externas (Google Maps, tráfico, combustible).
- Mejora en validaciones de reglas de negocio del cálculo tarifario.
- Documentación formal de APIs (Swagger/OpenAPI).

### Frontend
- Mejor manejo de estados globales en la app.
- Refinar experiencia de usuario en el flujo de negociación.
- Mejorar consistencia visual entre roles.

### DevOps
- Implementar Health Checks en servicios Docker.
- Automatizar CI/CD con GitHub Actions.
- Mejorar scripts de inicialización del entorno.

### Equipo
- Mejor coordinación entre frontend y backend.
- Mayor revisión de Pull Requests antes de merge.
- Definición de estándares de código más estrictos.

---

## Problemas Encontrados

| Problema | Impacto | Solución |
|----------|----------|----------|
| Dependencia de APIs externas no disponibles | Medio | Uso de mocks y datos simulados |
| Conflictos de ramas en Git | Medio | Mejora del flujo de Pull Requests |
| Bugs visuales en la app móvil | Alto | Corrección planificada para Sprint 2 |
| Configuración inicial de Docker | Bajo | Documentación interna y pruebas locales |

---

## Lecciones Aprendidas

### Técnicas
- Docker facilita la consistencia del entorno de desarrollo.
- La separación por dominios mejora el desarrollo paralelo.
- El uso de datos simulados acelera la integración inicial.

### Organizacionales
- La comunicación entre frontend y backend es crítica en flujos en tiempo real.
- La revisión de código reduce errores acumulados.
- Una planificación clara mejora la estabilidad del sprint.

---

## Acciones para el Sprint 2

### Backend
- Completar integración de APIs externas reales.
- Mejorar lógica de validación del cálculo tarifario.
- Fortalecer la máquina de estados del viaje.

### Frontend
- Completar flujos de pantalla pendientes.
- Mejorar experiencia de usuario en negociación.
- Reducir inconsistencias visuales.

### DevOps
- Implementar Health Checks.
- Configurar CI/CD con GitHub Actions.
- Automatizar despliegue del entorno.

### QA
- Incrementar cobertura de pruebas.
- Definir casos de prueba para flujo completo pre-viaje.
- Validar escenarios límite del sistema.

---

## Conclusión

El Sprint 1 permitió establecer una base técnica sólida del Motor Tarifario Inteligente, validando el flujo completo de pre-viaje: solicitud, cálculo de rango, visualización asimétrica, negociación y aceptación bilateral.

El sistema queda listo para evolucionar hacia fases más avanzadas en los siguientes sprints, manteniendo una arquitectura modular y escalable.
