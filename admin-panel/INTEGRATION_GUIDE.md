# Guía de Integración Frontend-Backend

## Estructura del Proyecto

```
admin-panel/
├── index.html (tu HTML actual)
├── js/
│   ├── config.js                     # Configuración centralizada
│   ├── ui-utils.js                   # Utilidades de UI
│   ├── app.js                        # Script principal refactorizado
│   └── services/
│       ├── index.js                  # Exportar todos los servicios
│       ├── api.service.js            # Cliente HTTP base
│       ├── auth.service.js           # Autenticación y usuarios
│       ├── trips.service.js          # Gestión de viajes
│       └── pricing.service.js        # Gestión de tarifas
```

##  Endpoints del Backend

### API Gateway (Puerto 3000) - USAR ESTE
El frontend debe conectarse al **API Gateway en puerto 3000**, NO directamente a ms-base.

```
API_GATEWAY = http://localhost:3000
```

El gateway automáticamente hace proxy a:
- `ms-base` (3001) para `/auth`, `/users`, `/trips`, `/vehicles`
- `ms-pricing` (3002) para `/pricing`

### Endpoints Disponibles

#### Autenticación (`/auth`)
```javascript
// Login
POST /auth/login
Body: { email: "admin@indrive.pe", password: "Admin1234" }
Response: { accessToken, user }

// Register
POST /auth/register
Body: { email, password, name, role }

// Logout
POST /auth/logout
Body: { refreshToken }

// Refresh Token
POST /auth/refresh
Body: { refreshToken }
```

####  Viajes (`/trips`)
```javascript
// Crear viaje (PASSENGER)
POST /trips
Body: { origin, destination, distanceKm }

// Obtener mis viajes
GET /trips
Headers: { Authorization: Bearer TOKEN }

// Obtener todos los viajes (ADMIN)
GET /trips/all
Headers: { Authorization: Bearer TOKEN }

// Obtener detalle de viaje
GET /trips/:id
Headers: { Authorization: Bearer TOKEN }

// Obtener viajes disponibles (DRIVER)
GET /trips/available
Headers: { Authorization: Bearer TOKEN }

// Asignar viaje (DRIVER)
PATCH /trips/:id/assign
Headers: { Authorization: Bearer TOKEN }

// Iniciar viaje (DRIVER)
PATCH /trips/:id/start
Headers: { Authorization: Bearer TOKEN }

// Completar viaje (DRIVER)
PATCH /trips/:id/complete
Headers: { Authorization: Bearer TOKEN }
Body: { realPrice }

// Cancelar viaje
PATCH /trips/:id/cancel
Headers: { Authorization: Bearer TOKEN }
```

####  Usuarios (`/users`)
```javascript
// Mi perfil
GET /users/me
Headers: { Authorization: Bearer TOKEN }

// Actualizar perfil
PATCH /users/me
Headers: { Authorization: Bearer TOKEN }
Body: { name, email, ... }

// Listar usuarios (ADMIN)
GET /users
Headers: { Authorization: Bearer TOKEN }

// Obtener usuario (ADMIN)
GET /users/:id
Headers: { Authorization: Bearer TOKEN }
```

#### Pricing (`/pricing`)
```javascript
// Cotizar precio
POST /pricing/quote
Body: { distanceKm }
Response: { minimumPrice, maximumPrice }

// Liquidar viaje
POST /pricing/settle
Body: { tripId, finalPrice, ... }

// Obtener config (ADMIN)
GET /pricing/config
Headers: { Authorization: Bearer TOKEN }

// Actualizar config (ADMIN)
PUT /pricing/config
Headers: { Authorization: Bearer TOKEN }
Body: { distanceWeight, fuelWeight, ... }

// Anomalías auditadas (ADMIN / AUDITOR)
GET /pricing/anomalies?limit=50
Headers: { Authorization: Bearer TOKEN }
```

#### Reports (`/reports`)
```javascript
// Resumen agregado del sistema (ADMIN / AUDITOR)
GET /reports/summary
Headers: { Authorization: Bearer TOKEN }
```

## Uso de Servicios

### 1. Autenticación

```javascript
import { authService, showToast } from './services/index.js';
import { showToast } from './ui-utils.js';

// Login
async function handleLogin() {
  try {
    const result = await authService.login('admin@indrive.pe', 'Admin1234');
    showToast('Sesión iniciada');
    loadDashboard();
  } catch (error) {
    showToast(error.message, false);
  }
}

// Demo
function handleDemoLogin() {
  authService.loginDemo();
  showToast('Modo demo activado');
  loadDashboard();
}

// Logout
async function handleLogout() {
  await authService.logout();
  showToast('Sesión cerrada');
  window.location.reload();
}

// Verificar autenticación
if (!authService.isAuthenticated()) {
  // Mostrar pantalla de login
}
```

### 2. Obtener Viajes

```javascript
import { tripsService, showToast, showLoading } from './services/index.js';
import { $ } from './ui-utils.js';

async function loadTrips() {
  const container = $('trips-table-wrap');
  showLoading(container);

  try {
    const trips = await tripsService.getAllTrips();
    renderTripsTable(container, trips);
  } catch (error) {
    showToast(`Error: ${error.message}`, false);
    showLoading(container, 'Error al cargar viajes');
  }
}

// Con filtro
async function loadTripsFiltered(status) {
  const trips = await tripsService.getMyTrips(status);
  // status: 'COMPLETED', 'ACTIVE', 'SEARCHING', etc.
}
```

### 3. Crear Viaje

```javascript
async function createTrip() {
  const origin = $('sim-origin').value || 'Miraflores';
  const destination = $('sim-dest').value || 'San Isidro';
  const distanceKm = parseFloat($('sim-dist').value) || 8.5;

  try {
    const result = await tripsService.createTrip({
      origin,
      destination,
      distanceKm
    });
    showToast(result.message);
  } catch (error) {
    showToast(error.message, false);
  }
}
```

### 4. Pricing y Simulación

```javascript
import { pricingService } from './services/index.js';

// Cargar configuración de pesos
async function initPricing() {
  try {
    // Cargar del backend si eres ADMIN
    await pricingService.loadConfig();
  } catch (error) {
    // Usar pesos por defecto
    console.warn('Usando pesos por defecto');
  }
}

// Cotizar precio
async function getQuote() {
  const distanceKm = 8.5;
  try {
    const quote = await pricingService.getQuote(distanceKm);
    console.log(`Rango: S/${quote.minimumPrice} - S/${quote.maximumPrice}`);
  } catch (error) {
    // Fallback a simulación local
    const simulation = pricingService.simulatePrice({ distanceKm });
    console.log(`Rango (local): S/${simulation.minimumPrice} - S/${simulation.maximumPrice}`);
  }
}

// Simular tarifa localmente
function simulatePricing() {
  const params = {
    distanceKm: 8.5,
    fuelPrice: 5.5,
    capacity: 4,
    traffic: 1.6,
    hour: 1.3,
    timeMultiplier: 1.1,
    historic: 15
  };

  const simulation = pricingService.simulatePrice(params);
  console.log(simulation);
  // Output: {
  //   minimumPrice: 18.45,
  //   maximumPrice: 28.34,
  //   breakdown: { ... }
  // }
}

// Validar precio
const validation = pricingService.validatePrice(25.00, 18.45, 28.34);
if (!validation.isValid) {
  showToast(validation.message, false);
}
```

### 5. Actualizar Configuración (ADMIN)

```javascript
async function updatePricingConfig() {
  const configData = {
    distanceWeight: 40,
    fuelWeight: 25,
    capacityWeight: 20,
    historicWeight: 15,
    trafficWeight: 50,
    hourWeight: 30,
    timeWeight: 20,
    minimumPrice: 3.00,
    maximumPrice: 150.00,
    maxRatio: 3.5,
    maxTrafficMultiplier: 2.0
  };

  try {
    const result = await pricingService.updateConfig(configData);
    showToast(result.message);
  } catch (error) {
    showToast(error.message, false);
  }
}
```

##  Cambios en el HTML

Necesitas actualizar tu `index.html` para importar los servicios:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Lima Ops · inDrive+ Fleet Control</title>
  <style>
    /* Tu CSS aquí */
  </style>
</head>
<body>
  <!-- Tu HTML aquí -->

  <!-- Scripts: Importar servicios y app -->
  <script type="module" src="js/app.js"></script>
</body>
</html>
```

En tu `app.js`:

```javascript
import { 
  authService, 
  tripsService, 
  pricingService,
  API_ENDPOINTS 
} from './services/index.js';
import { showToast, $ } from './ui-utils.js';

// Inicializar aplicación
async function init() {
  // Cargar configuración de pricing
  await pricingService.loadConfig();

  // Verificar autenticación
  if (authService.isAuthenticated()) {
    // Mostrar dashboard
    loadDashboard();
  } else {
    // Mostrar login
    showLoginScreen();
  }
}

// Auto-iniciar
window.addEventListener('DOMContentLoaded', init);
```

## Flujo de Autenticación

```
1. Usuario intenta login
   ↓
2. authService.login(email, password)
   ↓
3. apiService.post('/auth/login', { email, password })
   ↓
4. Backend retorna: { accessToken, user }
   ↓
5. Guardar en localStorage
   ↓
6. apiService automáticamente agrega header "Authorization: Bearer TOKEN"
   ↓
7. En próximas peticiones, el token se incluye automáticamente
   ↓
8. Si 401, apiService dispara evento 'auth:logout'
```

## Manejo de Errores

```javascript
try {
  const trips = await tripsService.getMyTrips();
} catch (error) {
  console.error('Error:', error);
  console.error('Status:', error.status);
  console.error('Data:', error.data);

  // Mostrar error usuario-amigable
  showToast(error.message, false);
}
```

## Testing Endpoints

Usa esta URL para probar en Postman/Insomnia:

```
http://localhost:3000
```

Endpoints ejemplo:
- POST http://localhost:3000/auth/login
- GET http://localhost:3000/trips
- POST http://localhost:3000/pricing/quote

## Variables de Configuración

Cambiar URL del backend en tiempo de ejecución:

```javascript
import { API_CONFIG, apiService } from './services/index.js';

// Cambiar URL
API_CONFIG.GATEWAY = 'http://api.production.com:3000';
apiService.setBaseUrl(API_CONFIG.GATEWAY);

// Guardar en localStorage
localStorage.setItem('api_gateway_url', 'http://api.production.com:3000');
```

## Checklist de Integración

- [ ] Backend corriendo en localhost:3000 (API Gateway)
- [ ] Frontend importa servicios correctamente
- [ ] Auth service maneja login/logout
- [ ] Trips service carga/crea viajes
- [ ] Pricing service integrado
- [ ] Toast notifications funcionando
- [ ] Modal y navegación funcionando
- [ ] Filtros y búsqueda funcionando
- [ ] Errores capturados y mostrados al usuario
- [ ] Tokens persistidos en localStorage

## Debugging

Habilitar logs en consola:

```javascript
// En config.js o app.js
window.DEBUG = true;

// En servicios
if (window.DEBUG) {
  console.log('Request:', url, config);
  console.log('Response:', response);
}
```

---

Para más información, ver documentación del backend en: `indrive-plus/README.md`
