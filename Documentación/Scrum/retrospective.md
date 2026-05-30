# Sprint Retrospective – Sprint 1: Fase Pre-Viaje

##  Información General

| Campo | Valor |
|------|------|
| Proyecto | Motor Tarifario Inteligente para inDrive en Lima Metropolitana |
| Sprint | Sprint 1 |
| Duración | 2 semanas |
| Metodología | Scrum |
| Fecha | Mayo 2026 |

---

##  Objetivo del Sprint

Implementar la fase Pre-Viaje del sistema, permitiendo que el pasajero solicite un viaje, el sistema calcule un rango tarifario inteligente, se muestre de forma asimétrica según rol, se permita la negociación dentro de límites controlados y se habilite la aceptación bilateral para iniciar el viaje.

---

##  Resumen del Sprint

Durante el Sprint 1 se construyó la base funcional del sistema enfocada en el flujo pre-viaje. Se avanzó en la arquitectura del backend, la implementación inicial de endpoints, el diseño de interfaces móviles y la estructura base de la lógica del motor tarifario.

También se configuró el entorno de desarrollo con Docker y se estableció la integración inicial con servicios externos simulados o parciales para el cálculo tarifario.

El equipo logró establecer una base técnica estable para continuar con la lógica completa del sistema en los siguientes sprints.

---

##  ¿Qué salió bien?

###  Backend
- Definición de arquitectura con NestJS.
- Diseño de endpoints principales del flujo de viaje.
- Separación inicial por módulos y dominios.
- Avance en lógica base del cálculo tarifario.

###  Frontend
- Implementación inicial de pantallas en React Native + Expo.
- Desarrollo de la visualización asimétrica por rol.
- Estructura de navegación base funcional.

###  DevOps
- Configuración de Docker Compose.
- Integración de PostgreSQL, MongoDB y Redis.
- Definición de variables de entorno.
- Entorno local reproducible para el equipo.

###  Gestión del proyecto
- Refinamiento del Product Backlog.
- Priorización de historias con MoSCoW.
- Organización inicial de tareas por equipo.

---

##  ¿Qué podría mejorar?

###  Backend
- Integración real completa con APIs externas (Google Maps, tráfico, combustible).
- Mejorar validaciones de entrada y reglas de negocio.
- Documentación formal de API (Swagger/OpenAPI).

### Frontend
- Mejorar manejo de estados globales.
- Refinar experiencia de usuario en negociación.
- Reducir inconsistencias visuales detectadas en pruebas.

###  DevOps
- Implementar Health Checks en servicios Docker.
- Automatizar CI/CD con GitHub Actions.
- Mejorar scripts de inicialización del entorno.

### Equipo
- Mejor coordinación entre frontend y backend.
- Mayor revisión de Pull Requests antes de merge.
- Estándares de código más estrictos desde el inicio.

---

## Problemas Encontrados

| Problema | Impacto | Solución |
|----------|--------|----------|
| Dependencias de APIs externas no disponibles | Medio | Uso de mocks y datos simulados |
| Conflictos de ramas en Git | Medio | Mejora de flujo de Pull Requests |
| Bugs visuales en app móvil | Alto | Corrección planificada en Sprint 2 |
| Configuración inicial de Docker | Bajo | Documentación interna y pruebas locales |

---

## Lecciones Aprendidas

### Técnicas
- Docker facilita la replicación del entorno de desarrollo.
- La separación por dominios mejora el desarrollo paralelo.
- El uso de múltiples bases de datos requiere responsabilidades bien definidas.

### Organizacionales
- Las revisiones constantes evitan errores acumulados.
- La comunicación entre frontend y backend es crítica en flujos en tiempo real.
- La planificación detallada reduce bloqueos en integración.

---

##  Acciones para el Sprint 2

###  Backend
- Completar recálculo post-viaje.
- Implementar regla de pago invariante.
- Desarrollar filtro de anomalías.

###  Frontend
- Completar pantallas pendientes.
- Corregir errores visuales.
- Implementar panel administrativo.

###  DevOps
- Implementar Health Checks.
- Configurar CI/CD con GitHub Actions.
- Automatizar despliegues locales.

###  QA
- Incrementar cobertura de pruebas.
- Definir casos de prueba de post-viaje.
- Validar escenarios límite del sistema.

---

## 🏁 Conclusión

El Sprint 1 permitió establecer la base técnica del sistema y validar la arquitectura general del Motor Tarifario Inteligente. Aunque varias funcionalidades aún están en desarrollo, se logró un entorno estable, una estructura modular y avances importantes en frontend y backend.

Esto permite iniciar el Sprint 2 con una base sólida para implementar la lógica avanzada del sistema (post-viaje, reglas de pago, anomalías y reportes).
