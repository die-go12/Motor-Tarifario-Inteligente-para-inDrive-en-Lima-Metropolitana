# Admin Panel - Lima Ops inDrive+

Panel administrativo moderno para gestión de viajes, conductores y tarifas en inDrive+ Lima Metropolitana.

## 📦 Estructura

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

## 🚀 Comenzar

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

## 🎯 Funcionalidades

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

## 📡 API Gateway

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

## 🔑 Autenticación

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

## 🔧 Configuración

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

## 🎨 Diseño

Basado en [DESIGN.md](../DESIGN.md):

- **Tema**: Dark mode moderno
- **Colores**: Lime verde (#C6F70A) + grises
- **Tipografía**: Inter sans-serif
- **Responsive**: Adaptado a mobile

## 📊 Estructura de Datos

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

## 🧪 Testing

### Con Postman/Insomnia

Base URL: `http://localhost:3000`

1. **Login**: `POST /auth/login`
   ```json
   { "email": "admin@indrive.pe", "password": "Admin1234" }
   ```

2. **Get Trips**: `GET /trips`
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

## 🚨 Troubleshooting

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

## 📚 Documentación

- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Guía completa de integración
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Referencia rápida de APIs
- [../DESIGN.md](../DESIGN.md) - Sistema de diseño
- [../indrive-plus/README.md](../indrive-plus/README.md) - Backend

## 🔐 Seguridad

- ✅ JWT authentication
- ✅ CORS configurado
- ✅ Rate limiting (via API Gateway)
- ✅ Validación de inputs
- ✅ Error handling seguro (sin exponer detalles internos)

## 📝 Desarrollo

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

## 🎓 Aprendizaje

Este proyecto demuestra:
- ✅ Arquitectura modular (servicios)
- ✅ Manejo de async/await
- ✅ JWT authentication
- ✅ Error handling
- ✅ State management
- ✅ UI responsiva
- ✅ Integración con backend

## 📞 Soporte

Para reportar bugs o sugerencias, crea un issue en GitHub o contacta al equipo de desarrollo.

---

**Última actualización**: Junio 2026  
**Versión**: 1.0.0-alpha  
**Estado**: En desarrollo activo
