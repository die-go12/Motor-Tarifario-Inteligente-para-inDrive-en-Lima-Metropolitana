# Quick Reference - API Frontend

Guía rápida para usar los servicios del frontend.

## Importar Servicios

```javascript
import { 
  authService, 
  tripsService, 
  pricingService,
  apiService,
  showToast,
  $ 
} from './services/index.js';
```

## Auth

```javascript
// Login
await authService.login('email@example.com', 'password');

// Demo
authService.loginDemo();

// Logout
await authService.logout();

// Get User
authService.getCurrentUser();

// Check Auth
if (authService.isAuthenticated()) { ... }
```

## Trips

```javascript
// Get all trips
const trips = await tripsService.getMyTrips();

// Get trips filtered
const active = await tripsService.getMyTrips('ACTIVE');

// Get one trip
const trip = await tripsService.getTripById(tripId);

// Create trip
await tripsService.createTrip({
  origin: 'Miraflores',
  destination: 'San Isidro',
  distanceKm: 8.5
});

// Assign (DRIVER)
await tripsService.assignTrip(tripId);

// Start (DRIVER)
await tripsService.startTrip(tripId);

// Complete (DRIVER)
await tripsService.completeTrip(tripId, realPrice);

// Cancel
await tripsService.cancelTrip(tripId);

// Available trips (DRIVER)
await tripsService.getAvailableTrips();

// Stats
const stats = tripsService.calculateStats(trips);
// { total, completed, cancelled, active, avgPrice, totalEarnings }

// Find outliers
const outliers = tripsService.findOutliers(trips);
```

## Pricing

```javascript
// Load config (ADMIN)
await pricingService.loadConfig();

// Get quote
const quote = await pricingService.getQuote(8.5);
// { minimumPrice, maximumPrice }

// Simulate
const sim = pricingService.simulatePrice({
  distanceKm: 8.5,
  fuelPrice: 5.5,
  capacity: 4,
  traffic: 1.6,
  hour: 1.3,
  timeMultiplier: 1.1,
  historic: 15
});

// Validate price
const valid = pricingService.validatePrice(25, 18.45, 28.34);

// Detect anomalies
const anomalies = pricingService.detectAnomalies(trips);

// Format price
pricingService.formatPrice(25.5); // "S/ 25.50"

// Update config (ADMIN)
await pricingService.updateConfig({
  distanceWeight: 40,
  fuelWeight: 25,
  // ...
});
```

## API Service

```javascript
// Get
const data = await apiService.get('/trips');

// Post
const result = await apiService.post('/trips', { origin, destination });

// Patch
await apiService.patch('/trips/1/cancel', {});

// Put
await apiService.put('/pricing/config', configData);

// Delete
await apiService.delete('/path', {});

// Set token
apiService.setToken('token_here');

// Get token
const token = apiService.getToken();

// Clear token
apiService.clearToken();
```

## UI Utils

```javascript
import { showToast, showLoading, closeModal, openModal, $ } from './ui-utils.js';

// Toast
showToast('Éxito!');           // ✓
showToast('Error', false);     // ✗

// Loading
showLoading($('container'), 'Cargando...');

// Modal
openModal();
closeModal();

// Get element
const el = $('my-id');

// Format date
formatDate(new Date()); // "30 may 2026, 14:30"

// Format time
formatTime(new Date()); // "14:30:45"

// Get status config
getStatusConfig('ACTIVE'); // { class: 'active', label: 'Activo' }

// Get initials
getInitials('Juan Pérez'); // "JP"

// Copy to clipboard
await copyToClipboard('text');

// Download JSON
downloadJSON(data, 'file.json');
```

## Estados de Viaje

```javascript
TRIP_STATUS.SEARCHING   // 'SEARCHING'
TRIP_STATUS.ASSIGNED    // 'ASSIGNED'
TRIP_STATUS.ACTIVE      // 'ACTIVE'
TRIP_STATUS.COMPLETED   // 'COMPLETED'
TRIP_STATUS.CANCELLED   // 'CANCELLED'
```

## Roles de Usuario

```javascript
USER_ROLES.ADMIN       // 'ADMIN'
USER_ROLES.DRIVER      // 'DRIVER'
USER_ROLES.PASSENGER   // 'PASSENGER'
```

## Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /auth/login | Login |
| POST | /auth/register | Registrar |
| GET | /trips | Mis viajes |
| POST | /trips | Crear viaje |
| GET | /trips/:id | Detalle viaje |
| PATCH | /trips/:id/cancel | Cancelar |
| PATCH | /trips/:id/assign | Asignar (DRIVER) |
| PATCH | /trips/:id/complete | Completar (DRIVER) |
| GET | /users/me | Mi perfil |
| POST | /pricing/quote | Cotizar |
| GET | /pricing/config | Obtener config (ADMIN) |
| PUT | /pricing/config | Actualizar config (ADMIN) |

## Configuración

```javascript
// Cambiar URL del backend
localStorage.setItem('api_gateway_url', 'http://new-url:3000');
```

## Debugging

```javascript
// Enable debug mode
window.DEBUG = true;

// Check current user
authService.getCurrentUser();

// Check trips state
window.AppState.trips;

// Check pricing config
pricingService.config;
```

## Mobile Responsiveness

Breakpoint media queries en CSS:

```css
@media (max-width: 900px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .pricing-grid { grid-template-columns: 1fr; }
  .fleet-grid { grid-template-columns: repeat(2, 1fr); }
}
```

---

Para documentación completa, ver: [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
