# Documentación Técnica del Sistema - Plataforma de Movilidad y Negociación en Tiempo Real

## 1. Vista General del Sistema

<div align="center">

![Vista General del Sistema](../../Scrum/imgs/vista_general_sistema.jpg)

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

![Centro de Control - Panel Admin](../../Scrum/imgs/centro_de_control.jpg)

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

![Backend, Persistencia y Mensajería](../../Scrum/imgs/backend%2BBD.jpg)

</div>

El backend implementa un desacoplamiento guiado por eventos (*Event-Driven Architecture*) utilizando canales Pub/Sub sobre Redis para sincronizar lecturas optimizadas (*CQRS / Read-Model*).

### 3.1. Flujo de Datos y Eventos

* **Sincronización de Precios y Tarifas:** Cuando `ms-pricing` genera una cotización o detecta una variación dinámica, publica eventos bajo el tópico `pricing.*` hacia el Bus de Eventos de Redis.

* **Consumo Asíncrono:**

    * `ms-pricing` (AuditListener) consume los eventos `pricing.*` para persistir la auditoría (`pricing_logs`, `anomaly_logs`, `pricing_history`) en MongoDB.
    * `ms-reports` consume los mismos eventos de manera asíncrona para alimentar su *read-model* de reportes en MongoDB, evitando sobrecargar la base de datos relacional de operaciones.
    * La actualización en vivo de la negociación hacia el móvil es un mecanismo *in-process* de `ms-base` (EventEmitter2 + `@OnEvent` → WebSocket), independiente del Bus de Eventos de Redis.

* **Fuentes de Datos Externas (`ms-integration`):**

    * **Google Maps (en vivo):** Cálculo de rutas, distancias y tiempos estimados (ETA).
    * **OSINERGMIN local:** Consulta de precios de referencia de combustibles para el cálculo de costos base.
    * **Tráfico Simulado:** Ingesta de variables simuladas de congestión vehicular (stub local, no fuente en vivo).

---

## 4. Aplicación Móvil (React Native + Expo)

<div align="center">

![Aplicación Móvil](../../Scrum/imgs/app_movil.jpg)

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

## 5. Decisiones de Arquitectura y Patrones de Diseño

Esta sección distingue tres niveles de diseño y justifica las decisiones clave del sistema. Una precisión importante: **los microservicios son un *estilo* arquitectónico, no un patrón de diseño**.

### 5.1. Estilos Arquitectónicos

* **Microservicios:** el sistema se divide en servicios desplegables de forma independiente (`api-gateway`, `ms-base`, `ms-pricing`, `ms-integration`, `ms-reports`), cada uno con una responsabilidad acotada.
* **Arquitectura Orientada a Eventos (EDA):** la comunicación asíncrona se realiza mediante un bus de eventos (Redis Pub/Sub), desacoplando a los productores de los consumidores.
* **Arquitectura por Capas:** dentro de cada microservicio NestJS el flujo es `Controller → Service → Repository/Entity`, con responsabilidad única por capa.

### 5.2. Patrones Arquitectónicos

* **API Gateway:** `api-gateway :3000` es la entrada única del Panel Web Admin (JWT, CORS, ruteo REST).
* **CQRS / Read-Model:** `ms-reports` mantiene un modelo de lectura en MongoDB, alimentado por eventos, separado del modelo transaccional (PostgreSQL en `ms-base`).
* **Publish/Subscribe:** los canales `pricing.*` (`CALCULATED`, `SETTLED`, `ANOMALY`) sobre Redis permiten que productores y consumidores no se conozcan entre sí.
* **Circuit Breaker:** protege las llamadas de `ms-base` hacia `ms-integration` (Google Maps / OSINERGMIN / tráfico), evitando fallos en cascada (resiliencia, CAR-010).
* **Base de Datos por Servicio / Persistencia Poliglota:** cada motor de datos se usa según su fortaleza (ver §5.5).

### 5.3. Patrones de Diseño (GoF, a nivel de código)

* **Singleton:** los *providers* de NestJS viven como instancia única dentro de su módulo; en el móvil, `getSocket()` reutiliza una sola conexión WebSocket.
* **Observer:** `ms-base` usa `EventEmitter2` con `@OnEvent`: el *gateway* de tiempo real escucha eventos de dominio internos (p. ej. la creación de un viaje) y los emite por WebSocket a los clientes suscritos.
* **State:** la máquina de estados del viaje (`assertTransition`) controla las transiciones `SEARCHING → ASSIGNED → IN_PROGRESS → COMPLETED | CANCELLED`; una transición inválida lanza una excepción.

### 5.4. Nota de Honestidad Técnica

* Los **`@decoradores`** de NestJS (`@Injectable`, `@Controller`, `@OnEvent`, etc.) son una característica del lenguaje (TypeScript + *metadata reflection*), **no** una implementación del patrón GoF *Decorator*.
* **Repository** y **DTO** son patrones empresariales (Fowler, *PoEAA*), no patrones GoF; se documentan aparte por precisión.

### 5.5. Justificación de Decisiones Clave

| Decisión | Por qué | Alternativa descartada |
| :--- | :--- | :--- |
| Microservicios | Despliegue y escalado independientes, aislamiento de fallos | Monolito (un fallo afecta a todo el sistema) |
| Persistencia poliglota | PostgreSQL (ACID transaccional), MongoDB (*schemaless* para logs/reportes), Redis (latencia + bus) | Una sola base de datos para todos los casos |
| Redis Pub/Sub como bus | Simplicidad y baja latencia para el alcance actual | RabbitMQ (mayor garantía de entrega; en el *roadmap*, ADR-005) |
| Visualización asimétrica (techo/piso) | Diferencial de negocio del motor tarifario | Mostrar el mismo precio a ambos roles |
| Móvil directo a `ms-base` | El *gateway* no hace proxy de WebSocket; reduce latencia crítica | Enrutar el móvil por el `API Gateway` |
| Circuit Breaker en integraciones | Resiliencia ante fallos de servicios externos (CAR-010) | Llamadas directas sin protección |
