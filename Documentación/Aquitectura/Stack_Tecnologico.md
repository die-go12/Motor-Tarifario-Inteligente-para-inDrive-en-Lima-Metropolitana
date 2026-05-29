# Stack de Tecnologías

## Motor Tarifario Inteligente — inDrive

<div align="center">

*MVP Lima Metropolitana | Duración: 8 meses*

</div>

---

## Índice

1. [Frontend (Capa de Presentación)](#1-frontend-capa-de-presentación)
2. [Backend (Capa de Lógica y Datos)](#2-backend-capa-de-lógica-y-datos)
3. [Bases de Datos](#3-bases-de-datos)
4. [Infraestructura y Orquestación](#4-infraestructura-y-orquestación)
5. [Integraciones Externas](#5-integraciones-externas)
6. [DevOps y Calidad](#6-devops-y-calidad)
7. [Herramientas Transversales](#7-herramientas-transversales)
8. [Resumen Tecnológico](#8-resumen-tecnológico)

---

## 1. Frontend (Capa de Presentación)

| Componente | Tecnología | Propósito |
|------------|------------|-----------|
| **App Móvil (Pasajero/Conductor)** | React Native + TypeScript | Aplicación única que compila interfaces para pasajeros y conductores. Tipado estricto para solicitudes de viaje y ofertas. |
| **Mapas y Rutas** | react-native-maps / Mapbox SDK | Renderizado de mapa interactivo, trazado de rutas, marcador del vehículo. Mapbox permite personalizar colores para resaltar interfaz de precios. |
| **Compilación Frontend** | Metro Bundler | Herramienta local (incluida en React Native) para compilar y servir código en tiempo real hacia emuladores móviles (Android Studio / Xcode). |
| **Panel Administrativo** | React + TypeScript | Aplicación web independiente para configuración de pesos, topes de tráfico y umbrales (CAR-006). Único punto que visualiza rango completo `[mínimo, máximo]`. |
| **Módulo Asimétrico** | React Native (inyectado) | Componentes visuales controlados por rol del usuario. Oculta rango completo y muestra solo techo (pasajero) o piso (conductor) - CAR-002. |

---

## 2. Backend (Capa de Lógica y Datos)

| Componente | Tecnología | Propósito |
|------------|------------|-----------|
| **Servicios Base** | Node.js + NestJS | Microservicio para lógica transaccional común: gestión de perfiles, autenticación, solicitudes de viaje, estados del trayecto (Buscando, Asignado, En Curso, Finalizado). |
| **Motor Tarifario** | Node.js + NestJS | Servidor independiente con lógica matemática core. Procesamiento pre-viaje de 7 variables (CAR-001) y aplicación de regla de pago post-viaje (CAR-004). |
| **API Gateway** | Node.js + NestJS | Punto único de entrada. Gestiona autenticación, enrutamiento y control de acceso hacia microservicios. |

---

## 3. Bases de Datos

| Base de Datos | Tecnología | Propósito | Almacena |
|---------------|------------|-----------|----------|
| **Transaccional** | PostgreSQL (contenedor local) | Base de datos relacional ACID. Almacena información estructurada de usuarios, vehículos y relaciones de viajes. | Usuario, Conductor, Vehículo, Viaje, Negociación, Oferta, RangoTarifario, Tarifa, Pago, Parámetro |
| **Histórico + Auditoría** | MongoDB (contenedor local) | Base de datos NoSQL documental. Almacena payload completo de auditoría y trazabilidad (CAR-007). Guarda histórico de viajes validados por filtro de anomalías (CAR-005). | Anomalía, Histórico, LogAuditoria |
| **Caché + Sesiones** | Redis (contenedor local) | Capa de memoria intermedia (in-memory). Maneja estado inmediato de asignación de viaje y persistencia de sesiones activas. | Sesiones activas, Rangos tarifarios recientes, Configuraciones de parámetros |

---

## 4. Infraestructura y Orquestación

| Herramienta | Propósito |
|-------------|-----------|
| **Docker Compose** | Orquestación local. Levanta e intercomunica 5 contenedores: NestJS Base, NestJS Motor Tarifario, PostgreSQL, MongoDB y Redis. |
| **Docker** | Contenerización de microservicios para entornos consistentes. |
| **Kubernetes** | Orquestación de contenedores para escalabilidad y resiliencia (proyección cloud). |

---

## 5. Integraciones Externas

| API | Propósito | Frecuencia |
|-----|-----------|------------|
| **Google Maps API** | Cálculo de distancias, rutas y geolocalización | Por solicitud de viaje |
| **OSINERGMIN API** | Precio oficial de combustible en Perú | Diaria / Bajo demanda |
| **Tráfico API** (TomTom/Waze) | Congestión vehicular en tiempo real | Tiempo real (cada 5 min) |
| **GPS Real Time** | Geolocalización de vehículos durante el viaje | Tiempo real |

---

## 6. DevOps y Calidad

| Herramienta | Propósito |
|-------------|-----------|
| **GitHub** | Alojamiento del código fuente y control de versiones. |
| **GitHub Actions** | Automatización de pruebas unitarias. Valida que cambios en reglas algorítmicas no rompan la regla de pago antes de actualizar contenedores locales. |
| **ArgoCD** | Entrega continua (CD) para despliegue en Kubernetes. |
| **Vercel** | Plataforma cloud que toma el frontend de GitHub y lo publica en internet. |
| **Postman** | Pruebas de APIs. Simula inyección de datos de APIs externas (OSINERGMIN, tráfico) mediante colecciones HTTP hacia microservicios NestJS. |

---

## 7. Herramientas Transversales

| Herramienta | Propósito |
|-------------|-----------|
| **Metro Bundler** | Compilación y hot-reload del frontend React Native hacia emuladores. |
| **Android Studio / Xcode** | Emuladores móviles para pruebas locales de la app. |
| **Docker Compose** | Orquestación multi-contenedor (5 servicios). |
| **TypeScript** | Tipado estático para frontend y backend. |

---

## 8. Resumen Tecnológico

| Capa | Tecnologías |
|------|-------------|
| **App Móvil** | React Native, TypeScript, react-native-maps / Mapbox SDK, Metro Bundler |
| **Panel Admin** | React, TypeScript |
| **Backend** | Node.js, NestJS |
| **Bases de Datos** | PostgreSQL, MongoDB, Redis |
| **Infraestructura Local** | Docker, Docker Compose |
| **Infraestructura Cloud** | Kubernetes, ArgoCD|
| **Integraciones** | Google Maps API, OSINERGMIN API, Tráfico API, GPS |
| **DevOps** | GitHub, GitHub Actions, Vercel, Postman |

---

<div align="center">

---

**Stack Tecnológico — Motor Tarifario Inteligente inDrive** | *Mayo 2026*

</div>
