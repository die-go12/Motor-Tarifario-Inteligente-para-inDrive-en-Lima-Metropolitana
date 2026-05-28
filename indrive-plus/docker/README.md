#  inDrive+ - Infraestructura Docker

## Descripción General

Esta carpeta contiene la infraestructura local basada en Docker para el proyecto **Motor Tarifario Inteligente para inDrive en Lima Metropolitana**.

El objetivo es proporcionar un entorno de desarrollo consistente para todos los integrantes del equipo, permitiendo ejecutar los servicios necesarios sin instalar manualmente PostgreSQL, MongoDB o Redis en cada computadora.

La infraestructura servirá como base para la integración de:

- Aplicación móvil (React Native + Expo)
- Backend Principal (NestJS)
- Motor Tarifario Inteligente (NestJS)
- Bases de Datos Híbridas
- Servicios de Caché y Comunicación

---

# Objetivos

- Estandarizar el entorno de desarrollo.
- Reducir problemas de compatibilidad entre equipos.
- Facilitar la integración entre microservicios.
- Simplificar el despliegue local.
- Preparar la arquitectura para futuras migraciones a AWS y Kubernetes.

---

# Arquitectura Tecnológica

| Componente | Tecnología |
|------------|------------|
| Aplicación Móvil | React Native + Expo |
| Panel Administrativo | React + TypeScript |
| Backend Principal | NestJS |
| Motor Tarifario | NestJS |
| Base de Datos Relacional | PostgreSQL |
| Base de Datos Documental | MongoDB |
| Caché / Memoria | Redis |
| Infraestructura Local | Docker Compose |
| Control de Versiones | GitHub |
| CI/CD (Futuro) | GitHub Actions |
| Cloud (Futuro) | AWS |
| Orquestación (Futuro) | Kubernetes |

---

# Arquitectura de Bases de Datos

## PostgreSQL

Almacena información transaccional:

- Usuarios
- Conductores
- Vehículos
- Solicitudes de viaje
- Estados de viaje
- Historial operativo

---

## MongoDB

Almacena información documental:

- Auditoría de cálculos tarifarios
- Historial de simulaciones
- Registro de anomalías
- Trazabilidad de decisiones
- Datos históricos para análisis

---

## Redis

Almacena información temporal:

- Sesiones activas
- Caché de consultas
- Estados temporales de viaje
- Comunicación rápida entre servicios

---

# Estructura del Proyecto

```text
infrastructure/
└── docker/
    ├── docker-compose.yml
    ├── .env.example
    └── README.md
```

---

# Requisitos Previos

Instalar:

- Docker Desktop
- Git
- Visual Studio Code (Opcional)

---

# Verificación de Instalación

Comprobar que Docker se encuentra instalado:

```bash
docker --version
docker compose version
```

Ejemplo esperado:

```text
Docker version XX.X.X
Docker Compose version XX.X.X
```

---

# Clonar el Proyecto

```bash
git clone <URL_DEL_REPOSITORIO>
```

Ingresar al proyecto:

```bash
cd Motor-Tarifario-Inteligente-para-inDrive-en-Lima-Metropolitana
```

---

# Cambiar a la Rama Docker

```bash
git checkout docker-setup
```

---

# Levantar la Infraestructura

Ubicarse en la carpeta donde se encuentra el archivo Docker Compose:

```bash
cd infrastructure/docker
```

Ejecutar:

```bash
docker compose up -d
```

Durante la primera ejecución Docker descargará automáticamente:

- PostgreSQL
- MongoDB
- Redis

Este proceso puede tardar varios minutos dependiendo de la velocidad de internet.

---

# Verificar Contenedores

```bash
docker ps
```

Resultado esperado:

```text
CONTAINER ID   IMAGE         NAME
xxxxx          postgres:16   indrive_postgres
xxxxx          mongo:7       indrive_mongo
xxxxx          redis:7       indrive_redis
```

Todos los contenedores deben aparecer en estado:

```text
Up
```

---

# Verificación de Servicios

## PostgreSQL

Visualizar logs:

```bash
docker logs indrive_postgres
```

Resultado esperado:

```text
database system is ready to accept connections
```

---

## MongoDB

Visualizar logs:

```bash
docker logs indrive_mongo
```

Resultado esperado:

```text
Waiting for connections
```

Estado actual:

✅ Validado correctamente

---

## Redis

Visualizar logs:

```bash
docker logs indrive_redis
```

Resultado esperado:

```text
Ready to accept connections tcp
```

Estado actual:

✅ Validado correctamente

---

# Administración de Contenedores

## Detener servicios

```bash
docker compose down
```

---

## Reiniciar servicios

```bash
docker compose restart
```

---

## Reconstruir servicios

```bash
docker compose up --build
```

---

## Eliminar contenedores y volúmenes

```bash
docker compose down -v
```

⚠️ Este comando elimina toda la información almacenada en los volúmenes Docker.

---

# Estado Actual del Proyecto

## Completado

- [x] Rama docker-setup creada
- [x] Documentación inicial
- [x] Configuración Docker Compose
- [x] PostgreSQL integrado
- [x] MongoDB integrado
- [x] Redis integrado
- [x] Persistencia mediante volúmenes Docker

---

## En Desarrollo

- [ ] Variables de entorno centralizadas
- [ ] Redes Docker personalizadas
- [ ] Integración API Base (NestJS)
- [ ] Integración Pricing Engine (NestJS)

---

## Futuro

- [ ] GitHub Actions
- [ ] Kubernetes
- [ ] AWS Deployment
- [ ] Monitoreo y Observabilidad

---

# Responsabilidades del Módulo Docker

La infraestructura Docker será responsable de:

- Levantar PostgreSQL.
- Levantar MongoDB.
- Levantar Redis.
- Gestionar redes internas.
- Gestionar persistencia mediante volúmenes.
- Integrar microservicios NestJS.
- Facilitar el entorno local para desarrollo.

---

# Próximos Pasos

## Fase 1 - Infraestructura Base

* Crear docker-compose.yml.
* Configurar PostgreSQL.
* Configurar MongoDB.
* Configurar Redis.
* Validar conectividad entre contenedores.

## Fase 2 - Integración de Microservicios

* Integrar API Base (NestJS).
* Integrar Pricing Engine (NestJS).
* Configurar redes internas Docker.
* Configurar variables de entorno.

## Fase 3 - Validación

* Pruebas de conexión a bases de datos.
* Pruebas de persistencia de datos.
* Pruebas de reinicio de contenedores.
* Documentación de uso para el equipo.

## Fase 4 - Preparación para Despliegue (Opcional) - Solo si se requiere despliegue en producción o local

* Optimización de imágenes Docker.
* Preparación para Kubernetes.
* Preparación para AWS.
* Automatización mediante GitHub Actions.

---

