# Admin Panel — Lima Ops inDrive+

Panel administrativo para la gestión de conductores, usuarios, viajes, tarifas y auditoría del sistema inDrive+ Lima Metropolitana.

---

## Índice

1. [Requisitos](#requisitos)
2. [Inicio rápido](#inicio-rápido)
3. [Comandos del día a día](#comandos-del-día-a-día)
4. [Credenciales de acceso](#credenciales-de-acceso)
5. [URLs de los servicios](#urls-de-los-servicios)
6. [Funcionalidades del panel](#funcionalidades-del-panel)
7. [Solución de problemas comunes](#solución-de-problemas-comunes)

---

## Requisitos

- **Docker** y **Docker Compose** instalados
- **Node.js 20+** (para correr el seed de datos)
- Puertos libres: `3000`, `3001`, `3002`, `3003`, `5432`, `6379`, `27017`, `8080`

---

## Inicio rápido

### Opción A — Script automático (recomendada)

Desde la raíz del repositorio:

```bash
cd /workspaces/Motor-Tarifario-Inteligente-para-inDrive-en-Lima-Metropolitana

# Inicia todo y carga datos demo (conserva usuarios existentes)
./start.sh
```

El script:
1. Levanta todos los contenedores Docker.
2. Espera a que `ms-base` esté disponible.
3. Corre el seed de forma **idempotente**: si los usuarios demo ya existen, los reutiliza sin borrarlos.

Una vez terminado, abre el panel en: **http://localhost:8080**

---

### Opción B — Manual paso a paso

```bash
# 1. Entrar al directorio de Docker
cd indrive-plus/docker

# 2. Levantar todos los servicios
docker compose up -d

# 3. Esperar ~15 segundos y verificar que todo esté UP
docker ps

# 4. Volver a la raíz y cargar datos demo
cd ../..
node admin-panel/seed.js
```

---

## Comandos del día a día

### Arrancar después de un reinicio del equipo (sin borrar datos)

```bash
cd indrive-plus/docker
docker compose up -d
```

Los volúmenes de PostgreSQL y MongoDB persisten entre reinicios; **los usuarios y viajes se conservan**.

---

### Detener todos los servicios

```bash
cd indrive-plus/docker
docker compose down
```

---

### Reiniciar un servicio específico

```bash
cd indrive-plus/docker
docker compose restart ms-base    # reiniciar solo ms-base
docker compose restart ms-pricing # reiniciar solo ms-pricing
```

---

### Reconstruir imágenes (después de cambios en el backend)

```bash
cd indrive-plus/docker
docker compose up -d --build
```

---

### Reinicio completo borrando todos los datos

> ⚠️ **Usar solo cuando quieras empezar desde cero.** Elimina todos los usuarios, viajes y auditoría.

```bash
# Con el script automático (pedirá confirmación)
./start.sh --reset

# O manualmente
cd indrive-plus/docker
docker compose down
docker volume rm docker_postgres_data docker_mongo_data
docker compose up -d
cd ../..
node admin-panel/seed.js
```

---

### Verificar estado de los contenedores

```bash
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
```

Salida esperada cuando todo está corriendo:

```
NAMES                   STATUS          PORTS
indrive_admin_panel     Up X minutes    0.0.0.0:8080->80/tcp
indrive_api_gateway     Up X minutes    0.0.0.0:3000->3000/tcp
indrive_ms_base         Up X minutes    0.0.0.0:3001->3001/tcp
indrive_ms_pricing      Up X minutes    0.0.0.0:3002->3002/tcp
indrive_ms_integration  Up X minutes    0.0.0.0:3003->3003/tcp
indrive_postgres        Up X minutes    0.0.0.0:5432->5432/tcp
indrive_redis           Up X minutes    0.0.0.0:6379->6379/tcp
indrive_mongo           Up X minutes    0.0.0.0:27017->27017/tcp
```

---

### Ver logs de un servicio

```bash
docker logs indrive_ms_base --tail 50 -f   # ms-base en vivo
docker logs indrive_ms_pricing --tail 50   # ms-pricing
```

---

## Credenciales de acceso

| Rol | Email | Contraseña |
|---|---|---|
| Admin | `admin.demo@indrive.pe` | `Secret123` |
| Pasajero | `pasajero.demo@indrive.pe` | `Secret123` |
| Conductor | `conductor.demo@indrive.pe` | `Secret123` |

> Estos usuarios los crea automáticamente `seed.js`. Si ya existen, el seed los reutiliza.

---

## URLs de los servicios

| Servicio | URL | Descripción |
|---|---|---|
| **Admin Panel** | http://localhost:8080 | Interfaz web principal |
| **API Gateway** | http://localhost:3000 | Entrada unificada al backend |
| **ms-base** | http://localhost:3001 | Auth, usuarios, vehículos, viajes |
| **ms-pricing** | http://localhost:3002 | Motor de tarifas, auditoría pricing |
| **ms-integration** | http://localhost:3003 | Integraciones externas (combustible) |

### Swagger / Documentación de API

- ms-base: http://localhost:3001/api
- ms-pricing: http://localhost:3002/api

---

## Funcionalidades del panel

### Dashboard
- KPIs en tiempo real: total de viajes, gap de negociación, conductores activos, anomalías.
- Conductores activos se cuentan desde `/users` (rol `driver`, estado activo) —no desde trips.
- Gráfico de tendencias de negociación (pasajero vs conductor).
- Tabla de viajes recientes.

### Fleet Management
- Lista de conductores con datos de vehículo (marca, modelo, placa, capacidad, año, combustible).
- Botón **Editar vehículo** por conductor: abre modal, carga datos actuales y guarda cambios en tiempo real.
- Al guardar, la tarjeta se actualiza inmediatamente en pantalla.
- Botón **+ Nuevo conductor**: crea conductor e ingresa datos del vehículo en el mismo formulario.

### Usuarios
- Tabla de todos los usuarios con filtros por rol: Todos / Conductores / Pasajeros / Admins / Auditores.
- Acciones por fila: Activar/Desactivar y Eliminar.
- Botón **+ Nuevo Registro**: crea usuario con cualquier rol; si el rol es Conductor, muestra campos de vehículo.

### Auditoría
- Registro de todos los cambios hechos por admins:
  - `CREAR USUARIO` al crear usuario desde el panel.
  - `ACTUALIZAR USUARIO` al editar datos del conductor/vehículo.
  - `ELIMINAR USUARIO` al eliminar usuario.
  - `PESOS` / `CONFIG` al modificar la configuración de tarifas.
- Los cambios de configuración/pesos se registran en MongoDB (ms-pricing).
- Los cambios de usuarios/vehículos se registran en PostgreSQL (ms-base).

### Pricing
- Configuración de pesos del motor tarifario (sliders).
- Simulador de tarifa: ingresa origen, distancia, combustible, capacidad y factores dinámicos.
- Al guardar configuración, el cambio queda registrado en auditoría.

### Viajes
- Tabla completa de viajes con filtro por estado.
- Acciones: ver detalle, asignar conductor, cancelar, completar.

### Configuración
- URLs configurables del backend (API Gateway, ms-base, ms-pricing).
- Prueba de conexión.
- Formulario de registro de usuario (con campos de vehículo para conductores).

---

## Solución de problemas comunes

### El panel muestra "Error cargando conductores"

El ms-base tardó en iniciar. Espera 15-20 segundos y recarga la página.

```bash
docker logs indrive_ms_base --tail 30
```

### El seed falla con "Credenciales inválidas"

El usuario demo ya existe con otra contraseña (por un reset previo parcial). Borra manualmente los usuarios demo y vuelve a correr el seed:

```bash
docker exec -i indrive_postgres psql -U admin -d indrive -c \
  "DELETE FROM users WHERE email LIKE '%indrive.pe';"
node admin-panel/seed.js
```

### Los cambios del backend no se reflejan (imagen vieja en Docker)

```bash
cd indrive-plus/docker
docker compose up -d --build
```

### El navegador muestra datos viejos

Haz recarga fuerte: `Ctrl + Shift + R` (Windows/Linux) o `Cmd + Shift + R` (Mac).

### PostgreSQL dice "role admin does not exist"

El volumen tiene datos de una inicialización previa sin el usuario `admin`. Resetea el volumen:

```bash
cd indrive-plus/docker
docker compose down
docker volume rm docker_postgres_data
docker compose up -d
node ../../admin-panel/seed.js
```

## Estructura

```
admin-panel/
├── index.html                    # HTML principal
├── INTEGRATION_GUIDE.md          # Guía completa de integración
├── QUICK_REFERENCE.md           # Referencia rápida de APIs
├── README.md                     # Este archivo
└── js/
    ├── config.js                 # Configuración centralizada
    ├── ui-utils.js              # Utilidades de UI
    ├── app.js                    # Script principal refactorizado
    └── services/
        ├── index.js              # Exportar servicios
        ├── api.service.js        # Cliente HTTP
        ├── auth.service.js       # Autenticación
        ├── trips.service.js      # Gestión de viajes
        └── pricing.service.js    # Motor de tarifas
```

## Comenzar

### 1. Iniciar Backend

```bash
cd indrive-plus

# Instalar dependencias
npm install

# Ejecutar con Docker Compose (recomendado)
docker-compose up

# O ejecutar en desarrollo
npm run start:dev

# Backend disponible en:
# - API Gateway: http://localhost:3000
# - ms-base: http://localhost:3001
# - ms-pricing: http://localhost:3002
```

### 2. Usar el Panel Admin

Simplemente abre `index.html` en tu navegador:

```bash
# Con live server en VS Code
# O desde terminal
python -m http.server 8000
# Luego visita: http://localhost:8000/admin-panel/
```

### 3. Login

**Credenciales de desarrollo:**
- Email: `admin@indrive.pe`
- Contraseña: `Admin1234`

O usa **Modo Demo** si el backend no está disponible.

## Funcionalidades

### Dashboard
- KPIs en tiempo real: Total de viajes, gap de negociación, conductores activos, anomalías
- Gráfico de tendencias: Comparación pasajero vs conductor
- Tabla de transacciones en vivo

### Fleet Management
- Listar conductores registrados
- Ver estadísticas por conductor
- Validación de conductores

### Gestión de Viajes
- Crear viaje de prueba
- Filtrar por estado (SEARCHING, ASSIGNED, ACTIVE, COMPLETED, CANCELLED)
- Ver detalles de viaje
- Cancelar viaje
- Asignar conductor
- Completar viaje

### Motor Tarifario
- **Configuración de pesos** (distancia, combustible, capacidad, histórico)
- **Factores dinámicos** (tráfico, hora/demanda, tiempo)
- **Simulador de tarifa**: Calcula rango mínimo-máximo
- **Validación de precios**: Asegura que se respeten límites

### Seguridad
- Monitor de anomalías
- Reglas de negocio activas
- Dashboard de seguridad del sistema

### Configuración
- URLs configurables del backend
- Prueba de conexión
- Registro de nuevos usuarios

## API Gateway

El frontend se conecta al **API Gateway** (puerto 3000), que actúa como punto central:

```
Frontend
  │
  ├─────→ API Gateway (3000)
            │
            ├─────→ ms-base (3001) → /auth, /users, /trips, /vehicles
            │
            └─────→ ms-pricing (3002) → /pricing, /pricing/config
```

**Ventajas:**
- ✅ Punto de entrada único
- ✅ Rate limiting centralizado
- ✅ CORS configurado correctamente
- ✅ Autenticación en un solo lugar
- ✅ Fácil de escalar

## Autenticación

Token JWT almacenado automáticamente en `localStorage`:

```javascript
// El token se incluye automáticamente en cada petición
GET /trips
Headers: { Authorization: "Bearer <token>" }
```

Si el token expira (401):
1. El frontend dispara evento `auth:logout`
2. Redirige a login
3. Usuario puede ingresar nuevamente

## Configuración

### Cambiar URL del Backend

**En settings (GUI):**
1. Ve a la sección "Configuración del Sistema"
2. Ingresa las URLs nuevas
3. Click "Guardar configuración"
4. Click "Probar conexión"

**O programáticamente:**

```javascript
// En app.js o config.js
localStorage.setItem('api_gateway_url', 'http://api.production.com:3000');
```

### URLs Disponibles

```javascript
// config.js
API_CONFIG.GATEWAY = 'http://localhost:3000'    // API Gateway
API_CONFIG.MS_BASE = 'http://localhost:3001'    // ms-base
API_CONFIG.MS_PRICING = 'http://localhost:3002' // ms-pricing
```

## Diseño

Basado en [DESIGN.md](../DESIGN.md):

- **Tema**: Dark mode moderno
- **Colores**: Lime verde (#C6F70A) + grises
- **Tipografía**: Inter sans-serif
- **Responsive**: Adaptado a mobile

## Estructura de Datos

### Trip
```javascript
{
  id: number,
  origin: string,
  destination: string,
  distanceKm: number,
  minimumPrice: number,
  maximumPrice: number,
  finalPrice: number | null,
  status: 'SEARCHING' | 'ASSIGNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED',
  passengerId: number,
  driverId: number | null,
  requestedAt: Date
}
```

### User
```javascript
{
  id: number,
  name: string,
  email: string,
  role: 'ADMIN' | 'DRIVER' | 'PASSENGER',
  createdAt: Date
}
```

### PricingConfig
```javascript
{
  distanceWeight: number,      // 40%
  fuelWeight: number,          // 25%
  capacityWeight: number,      // 20%
  historicWeight: number,      // 15%
  trafficWeight: number,       // 50%
  hourWeight: number,          // 30%
  timeWeight: number,          // 20%
  minimumPrice: number,        // 3.00
  maximumPrice: number,        // 150.00
  maxRatio: number,            // 3.5
  maxTrafficMultiplier: number // 2.0
}
```

## Testing

### Con Postman/Insomnia

Base URL: `http://localhost:3000`

1. **Login**: `POST /auth/login`
   ```json
   { "email": "admin@indrive.pe", "password": "Admin1234" }
   ```

2. **Get Trips**: `GET /trips/all` (admin)
   - Header: `Authorization: Bearer <token>`

3. **Quote**: `POST /pricing/quote`
   ```json
   { "distanceKm": 8.5 }
   ```

### Modo Demo

Si el backend no está disponible, el frontend entra automáticamente en **modo demo**:
- Datos generados localmente
- Funcionalidad parcial
- Perfecto para desarrollo y UI testing

## Troubleshooting

### "No se puede conectar al backend"
```
1. Verifica que el API Gateway esté corriendo: http://localhost:3000
2. Verifica logs del backend: docker logs <container>
3. Usa Modo Demo para UI testing
```

### "Credenciales inválidas"
```
1. Verifica email y contraseña en la DB
2. Intenta modo demo
3. Revisa logs de autenticación
```

### "CORS error"
```
El API Gateway tiene CORS habilitado.
Si aún hay problemas, verifica el frontend está en puerto permitido.
```

### "Token expirado"
```
El sistema automáticamente redirige a login.
El token se almacena en localStorage.
Limpia cache si persiste el problema.
```

## Documentación

- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Guía completa de integración
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Referencia rápida de APIs
- [../DESIGN.md](../DESIGN.md) - Sistema de diseño
- [../indrive-plus/README.md](../indrive-plus/README.md) - Backend

## Seguridad

- ✅ JWT authentication
- ✅ CORS configurado
- ✅ Rate limiting (via API Gateway)
- ✅ Validación de inputs
- ✅ Error handling seguro (sin exponer detalles internos)

## Desarrollo

### Agregar nueva función

1. **Crear service** en `js/services/`
   ```javascript
   export class MyService {
     async getData() { ... }
   }
   ```

2. **Exportar en index.js**
   ```javascript
   export { myService } from './my.service.js';
   ```

3. **Usar en app.js**
   ```javascript
   import { myService } from './services/index.js';
   ```

### Agregar nuevo endpoint

1. **Definir en config.js**
   ```javascript
   export const API_ENDPOINTS = {
     MY_FEATURE: {
       GET_DATA: '/my-feature/data'
     }
   };
   ```

2. **Implementar en service**
   ```javascript
   async getData() {
     return apiService.get(API_ENDPOINTS.MY_FEATURE.GET_DATA);
   }
   ```

## Aprendizaje

Este proyecto demuestra:
- ✅ Arquitectura modular (servicios)
- ✅ Manejo de async/await
- ✅ JWT authentication
- ✅ Error handling
- ✅ State management
- ✅ UI responsiva
- ✅ Integración con backend

## Soporte

Para reportar bugs o sugerencias, crea un issue en GitHub o contacta al equipo de desarrollo.

---

**Última actualización**: Junio 2026  
**Versión**: 1.0.0-alpha  
**Estado**: En desarrollo activo
