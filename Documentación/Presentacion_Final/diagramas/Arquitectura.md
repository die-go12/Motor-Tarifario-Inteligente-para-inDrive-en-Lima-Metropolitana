# Documentación Técnica del Sistema - Plataforma de Movilidad y Negociación en Tiempo Real

## 1. Vista General del Sistema

<div align="center">

![Vista General del Sistema](https://github.com/die-go12/Motor-Tarifario-Inteligente-para-inDrive-en-Lima-Metropolitana/blob/main/Documentaci%C3%B3n/Scrum/imgs/vista_general_sistema.jpg)

</div>

El sistema está basado en una arquitectura de microservicios diseñada para soportar alta disponibilidad, comunicación reactiva y consistencia políglota en la persistencia de datos.

### 1.1. Arquitectura de Alto Nivel
* **Capa de Presentación:**
  
    * **App Móvil (React Native + Expo):** Utilizada por Pasajeros y Conductores para interactuar con los flujos de viaje en tiempo real de forma directa con el servicio base (`ms-base`).
    * **Panel Web Admin (Lima Ops):** Utilizado por Administradores y Auditores para la gestión de métricas, configuraciones y auditoría mediante un `API Gateway`.
* **Capa de Orquestación y Ruteo:**
    * **API Gateway (:3000):** Encargado de la autenticación por JWT, manejo de CORS y ruteo REST exclusivo para las peticiones del Panel Web Admin hacia los microservicios backend.
* **Capa de Microservicios (NestJS):**
    * `ms-base :3001`: Núcleo transaccional (autenticación, usuarios, vehículos, viajes, negociación y WebSockets).
    * `ms-pricing :3002`: Motor dinámico de 7 variables, cálculo de precios, gestión de anomalías, topes y límites.
    * `ms-integration :3003`: Integración con fuentes externas protegida con patrones de resiliencia (*Circuit Breaker*).
    * `ms-reports :3004`: Consumo y procesamiento asíncrono de eventos para la generación de reportes avanzados.
* **Capa de Persistencia:**
    * **PostgreSQL:** Almacenamiento transaccional ACID para usuarios, vehículos, viajes, negociaciones y ofertas.
    * **MongoDB:** Almacenamiento de logs históricos, auditorías de tarifas (`pricing_logs`, `anomaly_logs`), configuraciones dinámicas e históricos de reportes.
    * **Redis:** Caché de sesiones de usuario, almacenamiento de estados rápidos y Bus de Eventos asíncronos mediante el patrón Pub/Sub.

---

## 2. Centro de Control - Panel Admin (Lima Ops)

<div align="center">

![Vista General del Sistema](https://github.com/die-go12/Motor-Tarifario-Inteligente-para-inDrive-en-Lima-Metropolitana/blob/main/Documentaci%C3%B3n/Scrum/imgs/centro_de_control.jpg)

</div>

Interfaz web centralizada orientada al monitoreo operativo y auditoría del ecosistema.

### 2.1. Módulos y Funcionalidades
1. **Dashboard:** Monitoreo en tiempo real de KPIs clave y estado de viajes en vivo. (Rutea a `/trips/all` en `ms-base` y `reports/summary` en `ms-reports`).
2. **Viajes:** Visualización detallada de todos los viajes del sistema con capacidades de filtrado avanzado.
3. **Auditoría de Anomalías:** Panel de control para la revisión de alertas y comportamientos irregulares en las tarifas detectados por `ms-pricing`.
4. **Seguridad / Reportes:** Análisis de fluctuación de demanda, ingresos globales y logs de anomalías.
5. **Pricing (Motor):** Configuración en caliente de variables, establecimiento de umbrales tolerables y simulador dinámico de oferta/demanda.
6. **Usuarios / Fleet:** Control, alta y bloqueo de cuentas de pasajeros, conductores y flota de vehículos habilitada.

---

## 3. Backend, Persistencia y Mensajería (NestJS)

<div align="center">

![Vista General del Sistema](https://github.com/die-go12/Motor-Tarifario-Inteligente-para-inDrive-en-Lima-Metropolitana/blob/main/Documentaci%C3%B3n/Scrum/imgs/backend%2BBD.jpg)

</div>

El backend implementa un desacoplamiento guiado por eventos (*Event-Driven Architecture*) utilizando canales Pub/Sub sobre Redis para sincronizar lecturas optimizadas (*CQRS / Read-Model*).

### 3.1. Flujo de Datos y Eventos

* **Sincronización de Precios y Tarifas:** Cuando `ms-pricing` genera una cotización o detecta una variación dinámica, publica eventos bajo el tópico `pricing.*` hacia el Bus de Eventos de Redis.
  
* **Consumo Asíncrono:**
  
    * `ms-base` consume estos eventos para actualizar las negociaciones activas vía WebSockets hacia la aplicación móvil.
    * `ms-reports` consume los eventos de manera asíncrona para actualizar la base de datos documental (MongoDB), evitando sobrecargar la base de datos relacional de operaciones.
      
* **Fuentes de Datos Externas (`ms-integration`):**
  
    * **Google Maps (en vivo):** Cálculo de rutas, distancias y tiempos estimados (ETA).
    * **OSINERGMIN local:** Consulta de precios de referencia de combustibles para el cálculo de costos base.
    * **Tráfico Simulado:** Ingesta de variables de congestión vehicular en tiempo real.

---

## 4. Aplicación Móvil (React Native + Expo)

<div align="center">

![Vista General del Sistema](https://github.com/die-go12/Motor-Tarifario-Inteligente-para-inDrive-en-Lima-Metropolitana/blob/main/Documentaci%C3%B3n/Scrum/imgs/app_movil.jpg)

</div>

Diseñada para un rendimiento ágil, la aplicación móvil realiza conexiones directas mediante HTTP (REST) y WebSockets bidireccionales con `ms-base :3001` sin pasar por el API Gateway corporativo, optimizando la latencia crítica del negocio.

### 4.1. Flujos Diferenciados por Rol

* **Gestión de Estado Global:** Implementado mediante Stores dedicados (`useAuthStore`, `useTripStore`).
  
* **Flujo del Pasajero (Visualiza TECHO / `maximumPrice`):**
  
    1. *SearchTrip:* Solicita un viaje definiendo origen, destino y visualiza el precio máximo sugerido.
    2. *Negotiation:* Recibe ofertas de conductores cercanos, contraoferta y acepta la tarifa final.
    3. *PassengerMap:* Monitoreo en mapa interactivo de la ubicación en vivo del conductor asignado.
       
* **Flujo del Conductor (Visualiza PISO / `minimumPrice`):**
  
    1. *DriverMap:* GPS activo enviando coordenadas constantes del vehículo en tiempo real.
    2. *TripOffers:* Visualización de solicitudes de viaje disponibles que superan el precio mínimo base.
    3. *ActiveTrip:* Gestión de estados del viaje en curso: inicio del recorrido y finalización segura.

---

## 5. Control de Tareas del Sprint (Matriz de Actividades)

A continuación se consolidan las actividades del último ciclo de desarrollo técnico junto con sus respectivos identificadores de requerimiento y estados actuales:

| Código | Requerimiento / Componente | Descripción Técnica | Estado |
| :--- | :--- | :--- | :--- |
| **RS-3** | HU-07 | Motor de 7 variables + topes y límites | `LISTO` |
| **RS-4** | HU-05/06 | Presentador asimétrico por rol (Pasajero/Conductor) | `LISTO` |
| **RS-5** | CAR-003 | Negociación acotada + aceptación bilateral de tarifa | `LISTO` |
| **RS-6** | CAR-004 | Persistir la información del Payment post-viaje | `LISTO` |
| **RS-7** | CAR-005 | Módulo de Anomalías enriquecidas + endpoints GET | `LISTO` |
| **RS-8** | CAR-008 | Implementación de `ms-reports` + endpoints `/reports/summary` y `/trips/all` | `LISTO` |
| **RS-12**| HU-08 | Flujo de Login seguro + Dashboard operacional de administración | `LISTO` |
| **RS-13**| CAR-006 | Editor visual del endpoint `/pricing/config` en Panel Admin | `LISTO` |
| **RS-14**| CAR-005 | Consumo del módulo de anomalías desde el front web | `LISTO` |
| **RS-15**| CAR-008 | Consumo e integración visual del módulo de reportes | `LISTO` |
| **RS-16**| CAR-008 | Tabla maestra con filtros para visualización de todos los viajes | `LISTO` |
| **RS-21**| HU-05 | Despliegue y estabilización de la App Pasajero | `LISTO` |
| **RS-22**| HU-06 | Despliegue y estabilización de la App Conductor | `LISTO` |
| **RS-23**| CAR-004 | Pulido visual de la vista post-viaje e impresión de precio final | `LISTO` |
| **RS-25**| CAR-009 | Integración nativa con SDK de Google Maps | `LISTO` |
| **RS-30**| CAR-010 | Configuración de orquestación local con Stack Docker Compose completo | `LISTO` |
| **RS-38**| - | Consolidación y cierre de métricas Scrum del ciclo | `LISTO` |
| **RS-17**| US-007 | Formulario dinámico para parametrización de umbrales | `EN CURSO` |
| **RS-31**| - | Integración de cambios de Docker Compose a la rama principal `main` | `EN CURSO` |
| **RS-37**| - | Levantamiento de evidencias, matriz de riesgos y apoyo en base de datos | `EN CURSO` |
| **RS-9** | US-007 | Configuración de Umbrales de anomalía dinámicos en backend | `EN REVISIÓN` |
| **RS-10**| - | Elaboración de documentación técnica de arquitectura y endpoints | `EN REVISIÓN` |
| **RS-18**| HU-08 | Implementación del simulador avanzado de oferta y demanda | `EN REVISIÓN` |
| **RS-19**| - | Integración y merge final de la rama `Panel_Admin` con `main` | `EN REVISIÓN` |
| **RS-26**| - | Fase de pruebas para la integración bidireccional mediante WebSockets | `EN REVISIÓN` |
| **RS-27**| - | Sincronización y resolución de conflictos de la rama móvil con `main` | `EN REVISIÓN` |
| **RS-32**| CAR-008 | Incorporación del servicio `ms-reports` al entorno local de compose | `EN REVISIÓN` |
| **RS-33**| Docker-002| Configuración de Healthchecks de servicios e integración continua | `EN REVISIÓN` |
| **RS-34**| HU-05/06 | Ejecución de pruebas integrales segmentadas por rol de usuario | `EN REVISIÓN` |
| **RS-35**| CAR-004 | Validación exhaustiva del motor de reglas de pago | `EN REVISIÓN` |
| **RS-36**| - | Ejecución del Smoke Test integral End-to-End en entorno *Staging* | `EN REVISIÓN` |
