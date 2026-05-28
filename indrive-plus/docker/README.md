#  inDrive+ - Infraestructura Docker

## Descripción

Esta carpeta contiene la configuración de infraestructura local para el proyecto **inDrive+**, una plataforma de transporte basada en microservicios que incorpora un **Motor Tarifario Inteligente** para el cálculo dinámico y transparente de tarifas.

La finalidad de esta configuración es permitir que cualquier integrante del equipo pueda levantar todos los servicios necesarios en su entorno local mediante Docker, garantizando consistencia entre los entornos de desarrollo.

---

# Objetivos de la Infraestructura

* Estandarizar el entorno de desarrollo.
* Facilitar la integración entre microservicios.
* Evitar instalaciones manuales de bases de datos.
* Permitir pruebas locales antes del despliegue.
* Reducir problemas de compatibilidad entre equipos.

---

# Arquitectura Tecnológica

| Componente                  | Tecnología          |
| --------------------------- | ------------------- |
| Aplicación móvil            | React Native + Expo |
| Panel administrativo        | React + TypeScript  |
| Backend principal           | NestJS              |
| Motor tarifario             | NestJS              |
| Base de datos transaccional | PostgreSQL          |
| Base de datos documental    | MongoDB             |
| Caché y sesiones            | Redis               |
| Contenedorización           | Docker              |
| Orquestación local          | Docker Compose      |
| Control de versiones        | GitHub              |

---

## Bases de Datos del Proyecto

### MongoDB


### PostgreSQL


### Redis


# Estructura Inicial de Infraestructura

```text 
infrastructure/
└── docker/
    ├── docker-compose.yml
    ├── .env.example
    └── README.md
```

---



# Estado Actual

## Completado

* [x] Creación de rama docker-setup.
* [x] Documentación inicial.
* [x] Definición de tecnologías base.
* [x] Definición de arquitectura local.

## En progreso

* [ ] Configuración de Docker Compose.
* [ ] Configuración de PostgreSQL.
* [ ] Configuración de MongoDB.
* [ ] Configuración de Redis.

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

