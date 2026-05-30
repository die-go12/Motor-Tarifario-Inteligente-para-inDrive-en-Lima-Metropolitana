# Sprint 0 – Inicio y Preparación del Proyecto

## Información General

**Proyecto:** Motor Tarifario Inteligente para inDrive en Lima Metropolitana

**Duración:** Sprint 0

**Objetivo General:**

Preparar la infraestructura técnica, definir la arquitectura del sistema, establecer las herramientas de trabajo colaborativo y dejar listo el entorno para iniciar el desarrollo de las funcionalidades principales del producto.

---

# Objetivos del Sprint

Durante este sprint se buscó:

* Definir la visión del producto.
* Elaborar el Product Backlog inicial.
* Identificar las características funcionales (CAR-001 a CAR-010).
* Seleccionar las tecnologías del proyecto.
* Diseñar la arquitectura preliminar.
* Configurar el repositorio GitHub.
* Definir la estrategia de ramas.
* Configurar la infraestructura local mediante Docker.
* Preparar los entornos de desarrollo para Frontend, Backend y Bases de Datos.

---

# Actividades Realizadas

## Gestión del Proyecto

### Vision Document

Se elaboró el documento de visión del sistema con el fin de establecer:

* Objetivos de negocio.
* Alcance del MVP.
* Restricciones.
* Stakeholders.
* Beneficios esperados.

### Product Backlog

Se identificaron y priorizaron las historias de usuario necesarias para la construcción del MVP.

Historias principales:

* US-001 Solicitud de viaje con cálculo de rango.
* US-002 Visualización asimétrica del precio.
* US-003 Negociación acotada.
* US-004 Aceptación bilateral.
* US-005 Recálculo post-viaje.
* US-006 Regla de pago invariante.
* US-007 Administración de parámetros.
* US-008 Reportes y métricas.

---

## Diseño Arquitectónico

Se definió una arquitectura basada en microservicios orientada a eventos.

### Componentes principales

#### Frontend móvil

Tecnologías:

* React Native
* Expo
* TypeScript
* React Native Maps / Mapbox

Responsabilidades:

* Solicitud de viajes.
* Negociación de tarifas.
* Seguimiento de viajes.
* Visualización asimétrica de precios.

#### Backend

Tecnologías:

* Node.js
* NestJS

Responsabilidades:

* Gestión de usuarios.
* Gestión de viajes.
* Motor tarifario.
* Integración con APIs externas.

#### Bases de Datos

PostgreSQL

Almacenará:

* Usuarios
* Conductores
* Vehículos
* Viajes

MongoDB

Almacenará:

* Auditorías
* Historiales
* Registros de cálculos

Redis

Almacenará:

* Caché
* Sesiones
* Estados temporales de negociación

---

## Infraestructura DevOps

### GitHub

Se creó el repositorio principal del proyecto.

Se definió una estrategia de trabajo basada en ramas:

* main
* backend
* frontend
* docker-setup
* feature/*

### Docker

Se implementó una infraestructura local mediante Docker Compose.

Servicios configurados:

* PostgreSQL
* MongoDB
* Redis

Características implementadas:

* Red privada Docker.
* Volúmenes persistentes.
* Variables de entorno.
* Configuración reproducible para todos los integrantes.

---

## Herramientas Seleccionadas

### Desarrollo

* React Native
* Expo
* TypeScript
* Node.js
* NestJS

### Bases de Datos

* PostgreSQL
* MongoDB
* Redis

### DevOps

* Docker
* Docker Compose
* GitHub
* GitHub Actions

### QA

* Postman

### APIs Externas

* Google Maps
* OSINERGMIN
* Servicios de tráfico en tiempo real

---

# Entregables del Sprint

* Vision Document aprobado.
* Product Backlog definido.
* Sprint Backlog inicial.
* Arquitectura preliminar documentada.
* Repositorio GitHub configurado.
* Docker Compose funcional.
* PostgreSQL operativo.
* MongoDB operativo.
* Redis operativo.
* Estrategia de ramas definida.

---

# Riesgos Identificados

* Dependencia de APIs externas.
* Limitaciones de cuota de Google Maps.
* Cambios en datos externos de OSINERGMIN.
* Complejidad del motor tarifario.

---

# Resultado del Sprint

El Sprint 0 permitió establecer la base organizacional, técnica y arquitectónica necesaria para iniciar el desarrollo de las funcionalidades del Motor Tarifario Inteligente.

Estado: Completado
