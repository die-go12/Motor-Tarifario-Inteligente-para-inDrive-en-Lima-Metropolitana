/**
 * App Main Script - Punto de entrada de la aplicación
 * Refactorizado para usar servicios modulares
 */

import { 
  apiService,
  authService, 
  socketService,
  tripsService, 
  pricingService,
  API_ENDPOINTS,
  TRIP_STATUS,
  USER_ROLES
} from './services/index.js';
import { 
  showToast, 
  showLoading,
  clearElement,
  $,
  openModal,
  closeModal,
  navigateTo,
  formatDate,
  getStatusConfig,
  getInitials,
  getColorByIndex
} from './ui-utils.js';

// Estado global
const AppState = {
  trips: [],
  currentTrip: null,
  chart: null
};

// ==================== INICIALIZACIÓN ====================

/**
 * Inicializar aplicación
 */
async function initApp() {
  console.log('Inicializando aplicación...');

  // Restaurar URLs guardadas
  const savedGateway = localStorage.getItem('api_gateway_url');
  const savedBase = localStorage.getItem('ms_base_url');
  const savedPricing = localStorage.getItem('ms_pricing_url');

  if (savedGateway) $('settings-api-url').value = savedGateway;
  if (savedBase) $('settings-ms-base-url').value = savedBase;
  if (savedPricing) $('settings-ms-pricing-url').value = savedPricing;

  // Cargar configuración de pricing
  try {
    await pricingService.loadConfig();
    console.log('Configuración de pricing cargada');
  } catch (error) {
    console.warn('Usando pesos de pricing por defecto:', error.message);
  }

  // Verificar autenticación (solo admin)
  const currentUser = authService.getCurrentUser();
  if (authService.isAuthenticated() && currentUser?.role === USER_ROLES.ADMIN) {
    showMainUI();
    connectRealtime();
    await loadDashboard();
  } else {
    if (authService.isAuthenticated()) {
      await authService.logout();
    }
    showLoginUI();
  }

  // Inicializar chart
  initChart();

  // Event listeners
  setupEventListeners();
}

/**
 * Configurar event listeners
 */
function setupEventListeners() {
  // Modal
  const modal = $('modal-overlay');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Logout
  const logoutBtn = document.querySelector('[data-action="logout"]');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  // Settings API URLs
  const saveSettingsBtn = document.querySelector('[data-action="save-settings"]');
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', saveSettings);
  }

  const testConnectionBtn = document.querySelector('[data-action="test-connection"]');
  if (testConnectionBtn) {
    testConnectionBtn.addEventListener('click', testConnection);
  }
}

// ==================== AUTENTICACIÓN ====================

/**
 * Mostrar pantalla de login
 */
function showLoginUI() {
  const authScreen = $('auth-screen');
  const mainShell = $('main-shell');

  if (authScreen) authScreen.style.display = 'flex';
  if (mainShell) mainShell.style.display = 'none';
}

/**
 * Mostrar UI principal
 */
function showMainUI() {
  const authScreen = $('auth-screen');
  const mainShell = $('main-shell');

  if (authScreen) authScreen.style.display = 'none';
  if (mainShell) mainShell.style.display = 'flex';

  // Actualizar nombre de usuario
  const user = authService.getCurrentUser();
  if (user) {
    const userDisplay = $('user-name-display');
    if (userDisplay) userDisplay.textContent = user.name || 'Admin';
  }
}

/**
 * Handle login
 */
async function doLogin() {
  const emailInput = $('login-email');
  const passInput = $('login-pass');
  const loginBtn = $('login-btn');
  const errorDisplay = $('auth-error');

  if (!emailInput || !passInput) return;

  const email = emailInput.value.trim();
  const password = passInput.value;

  if (!email || !password) {
    showToast('Completa email y contraseña', false);
    return;
  }

  if (loginBtn) {
    loginBtn.textContent = 'Iniciando...';
    loginBtn.disabled = true;
  }

  if (errorDisplay) errorDisplay.style.display = 'none';

  try {
    const { user } = await authService.login(email, password);
    if (!user || user.role !== USER_ROLES.ADMIN) {
      await authService.logout();
      throw new Error('Acceso exclusivo para administradores');
    }
    connectRealtime();
    showMainUI();
    await loadDashboard();
    showToast('Sesión iniciada');
  } catch (error) {
    console.error('Login error:', error);
    if (errorDisplay) {
      errorDisplay.textContent = error.message || 'Credenciales inválidas';
      errorDisplay.style.display = 'block';
    }

    // Permitir demo si falla
    const demoOption = $('auth-demo');
    if (demoOption) demoOption.style.display = 'block';
  } finally {
    if (loginBtn) {
      loginBtn.textContent = 'Iniciar sesión';
      loginBtn.disabled = false;
    }
  }
}

/**
 * Handle demo login
 */
function fillDemo() {
  const emailInput = $('login-email');
  const passInput = $('login-pass');

  if (emailInput) emailInput.value = 'admin.demo@indrive.pe';
  if (passInput) passInput.value = 'Secret123';
}

/**
 * Mostrar/ocultar contraseña
 */
function togglePassword() {
  const passInput = $('login-pass');
  const toggle = $('toggle-pass');
  if (!passInput) return;

  const show = passInput.type === 'password';
  passInput.type = show ? 'text' : 'password';
  if (toggle) toggle.textContent = show ? '🙈' : '👁';
}

/**
 * Handle logout
 */
async function handleLogout() {
  if (!confirm('¿Estás seguro de que deseas cerrar sesión?')) return;

  socketService.disconnect();
  await authService.logout();
  showLoginUI();
  showToast('Sesión cerrada');
}

// ==================== DASHBOARD ====================

/**
 * Cargar dashboard
 */
async function loadDashboard() {
  console.log('Cargando dashboard...');
  await Promise.all([
    loadKPIs(),
    loadLiveTrips(),
    loadTrips()
  ]);
  setChart('7d');
}

/**
 * Conectar el socket de actualizaciones en tiempo real
 */
function connectRealtime() {
  const token = apiService.getToken();
  if (!token || token === 'DEMO') {
    return;
  }

  socketService.disconnect();
  socketService.connect(token);

  socketService.on('trip_created', () => {
    showToast('Nuevo viaje recibido');
    loadLiveTrips();
    loadTrips();
  });

  socketService.on('offer_received', () => {
    showToast('Nueva oferta recibida');
    loadLiveTrips();
    loadTrips();
  });

  socketService.on('trip_assigned', () => {
    showToast('Viaje asignado');
    loadLiveTrips();
    loadTrips();
  });

  socketService.on('driver_location_update', () => {
    loadLiveTrips();
    loadTrips();
  });

  socketService.on('trip_started', () => {
    showToast('Viaje iniciado');
    loadLiveTrips();
    loadTrips();
  });

  socketService.on('trip_cancelled', () => {
    showToast('Viaje cancelado');
    loadLiveTrips();
    loadTrips();
  });
}

/**
 * Cargar lista completa de viajes
 */
async function loadTrips() {
  const container = $('trips-full-table');
  if (!container) return;

  const filter = $('trip-status-filter')?.value || '';
  try {
    const trips = await tripsService.getMyTrips(filter || null);
    renderTripsTable(container, trips, false);
  } catch (error) {
    console.error('Error loading all trips:', error);
    container.innerHTML = '<div class="empty">Error cargando viajes</div>';
  }
}

/**
 * Navegar a una sección y cargar sus datos
 */
function goTo(viewName, navBtn) {
  navigateTo(viewName, navBtn);
  if (viewName === 'fleet') loadFleet();
}

/**
 * Cargar conductores registrados (GET /users)
 */
async function loadFleet() {
  const container = $('fleet-grid');
  if (!container) return;

  container.innerHTML = 'Cargando conductores...';
  try {
    const users = await authService.listAllUsers();
    const drivers = (users || []).filter((u) => u.role === USER_ROLES.DRIVER);

    if (!drivers.length) {
      container.innerHTML = '<div class="empty">Sin conductores registrados</div>';
      return;
    }

    container.innerHTML = drivers
      .map(
        (u, i) => `
        <div class="driver-card">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
            <div class="driver-av" style="background:${getColorByIndex(i)};color:var(--bg)">${getInitials(u.name)}</div>
            <div>
              <div class="driver-name">${u.name}</div>
              <div class="driver-meta">${u.email}</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div class="dstat"><div class="dstat-label">ID</div><div class="dstat-val">#${u.id}</div></div>
            <div class="dstat"><div class="dstat-label">Estado</div><div class="dstat-val">${u.isActive === false ? 'Inactivo' : 'Activo'}</div></div>
          </div>
        </div>
      `,
      )
      .join('');
  } catch (error) {
    console.error('Error loading fleet:', error);
    container.innerHTML = '<div class="empty">Error cargando conductores</div>';
  }
}

/**
 * Cargar KPIs
 */
async function loadKPIs() {
  try {
    const trips = await tripsService.getMyTrips();
    const stats = tripsService.calculateStats(trips);
    const completed = trips.filter(t => t.status === TRIP_STATUS.COMPLETED);

    // Calcular gap promedio
    const gaps = completed
      .map(t => t.maximumPrice && t.finalPrice ? t.maximumPrice - t.finalPrice : 0)
      .filter(g => g >= 0);
    const avgGap = gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;

    // Actualizar UI
    const kpiTrips = $('kpi-trips');
    const kpiGap = $('kpi-gap');
    const kpiDrivers = $('kpi-drivers');
    const kpiAnomalies = $('kpi-anomalies');

    if (kpiTrips) kpiTrips.textContent = stats.total.toLocaleString();
    if (kpiGap) kpiGap.textContent = `S/ ${avgGap.toFixed(2)}`;
    if (kpiDrivers) kpiDrivers.textContent = trips.filter(t => t.driverId).length;
    if (kpiAnomalies) kpiAnomalies.textContent = pricingService.detectAnomalies(trips).length;

    AppState.trips = trips;
  } catch (error) {
    console.error('Error loading KPIs:', error);
    // Mostrar valores placeholder
    const elements = ['kpi-trips', 'kpi-gap', 'kpi-drivers', 'kpi-anomalies'];
    elements.forEach(id => {
      const el = $(id);
      if (el) el.textContent = '—';
    });
  }
}

/**
 * Cargar viajes en vivo
 */
async function loadLiveTrips() {
  const container = $('trips-table-wrap');
  if (!container) return;

  showLoading(container);

  try {
    const trips = await tripsService.getMyTrips();
    AppState.trips = trips;
    renderTripsTable(container, trips.slice(0, 8), true);
  } catch (error) {
    console.error('Error loading trips:', error);
    showToast(`Error: ${error.message}`, false);
  }
}

// ==================== VIAJES ====================

/**
 * Renderizar tabla de viajes
 */
function renderTripsTable(container, trips, compact = false) {
  if (!trips || !trips.length) {
    container.innerHTML = '<div class="empty">Sin viajes disponibles</div>';
    return;
  }

  let html = `<table><thead><tr>
    <th>Trip ID</th>
    <th>Tiempo</th>
    <th>Ruta</th>
    <th>Pasajero</th>
    <th>Conductor</th>
    ${compact ? '' : '<th>Distancia</th>'}
    <th>Estado</th>
  </tr></thead><tbody>`;

  trips.forEach(trip => {
    const status = getStatusConfig(trip.status);
    const time = trip.requestedAt ? formatDate(trip.requestedAt) : '—';

    html += `
      <tr onclick="window.openTripDetail(${trip.id})" style="cursor: pointer;">
        <td class="trip-id">#LIM-${String(trip.id).padStart(4, '0')}</td>
        <td>${time}</td>
        <td>${trip.origin} → ${trip.destination}</td>
        <td>S/ ${trip.maximumPrice?.toFixed(2) || '—'}</td>
        <td>S/ ${trip.minimumPrice?.toFixed(2) || '—'}</td>
        ${compact ? '' : `<td>${trip.distanceKm} km</td>`}
        <td><span class="status-pill ${status.class}">${status.label}</span></td>
      </tr>
    `;
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

/**
 * Abrir detalle de viaje
 */
async function openTripDetail(tripId) {
  try {
    const trip = await tripsService.getTripById(tripId);
    AppState.currentTrip = trip;

    const status = getStatusConfig(trip.status);
    const modalTitle = $('modal-title');
    const modalBody = $('modal-body');

    if (modalTitle) modalTitle.textContent = `Viaje #LIM-${String(trip.id).padStart(4, '0')}`;

    if (modalBody) {
      modalBody.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <div style="font-size: 12px; color: var(--t3);">Origen</div>
            <div style="font-weight: 700;">${trip.origin}</div>
          </div>
          <div>
            <div style="font-size: 12px; color: var(--t3);">Destino</div>
            <div style="font-weight: 700;">${trip.destination}</div>
          </div>
          <div>
            <div style="font-size: 12px; color: var(--t3);">Distancia</div>
            <div style="font-weight: 700;">${trip.distanceKm} km</div>
          </div>
          <div>
            <div style="font-size: 12px; color: var(--t3);">Estado</div>
            <div style="font-weight: 700;">${status.label}</div>
          </div>
          <div>
            <div style="font-size: 12px; color: var(--t3);">Mínimo</div>
            <div style="font-weight: 700;">S/ ${trip.minimumPrice?.toFixed(2) || '—'}</div>
          </div>
          <div>
            <div style="font-size: 12px; color: var(--t3);">Máximo</div>
            <div style="font-weight: 700;">S/ ${trip.maximumPrice?.toFixed(2) || '—'}</div>
          </div>
        </div>

        <div style="margin-top: 20px; display: flex; gap: 8px;">
          ${trip.status === TRIP_STATUS.SEARCHING ? `<button onclick="window.assignTrip(${trip.id})" class="btn-primary">Asignar Conductor</button>` : ''}
          ${trip.status === TRIP_STATUS.ACTIVE ? `<button onclick="window.completeTrip(${trip.id})" class="btn-primary">Completar Viaje</button>` : ''}
          ${[TRIP_STATUS.SEARCHING, TRIP_STATUS.ASSIGNED, TRIP_STATUS.ACTIVE].includes(trip.status) ? `<button onclick="window.cancelTrip(${trip.id})" class="btn-secondary">Cancelar</button>` : ''}
        </div>
      `;
    }

    openModal();
  } catch (error) {
    showToast(`Error: ${error.message}`, false);
  }
}

/**
 * Cancelar viaje
 */
async function cancelTrip(tripId) {
  if (!confirm('¿Cancelar este viaje?')) return;

  try {
    await tripsService.cancelTrip(tripId);
    showToast('Viaje cancelado');
    closeModal();
    await loadLiveTrips();
  } catch (error) {
    showToast(`Error: ${error.message}`, false);
  }
}

/**
 * Asignar viaje
 */
async function assignTrip(tripId) {
  try {
    await tripsService.assignTrip(tripId);
    showToast('Viaje asignado');
    closeModal();
    await loadLiveTrips();
  } catch (error) {
    showToast(`Error: ${error.message}`, false);
  }
}

/**
 * Completar viaje
 */
async function completeTrip(tripId) {
  const priceInput = prompt('Ingresa el precio final:');
  if (!priceInput) return;

  const realPrice = parseFloat(priceInput);
  if (isNaN(realPrice)) {
    showToast('Precio inválido', false);
    return;
  }

  try {
    await tripsService.completeTrip(tripId, realPrice);
    showToast(`Viaje completado: S/${realPrice.toFixed(2)}`);
    closeModal();
    await loadLiveTrips();
  } catch (error) {
    showToast(`Error: ${error.message}`, false);
  }
}

// ==================== CHART ====================

/**
 * Inicializar chart
 */
function initChart() {
  const canvas = $('bidChart');
  if (!canvas) return;

  const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const passBids = [12, 15, 11, 18, 14, 16, 20];
  const driverAsks = [15, 19, 14, 22, 17, 20, 24];

  if (typeof Chart !== 'undefined') {
    AppState.chart = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Avg Passenger Bid',
            data: passBids,
            backgroundColor: '#C6F70A',
            borderRadius: 4
          },
          {
            label: 'Avg Driver Ask',
            data: driverAsks,
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderColor: 'rgba(255,255,255,0.2)',
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      }
    });
  }
}

/**
 * Cambiar rango de chart
 */
function setChart(range, btn) {
  if (!AppState.chart) return;

  const configs = {
    '1h': {
      labels: ['14:00', '14:10', '14:20', '14:30', '14:40', '14:50', '15:00'],
      pass: [8, 12, 9, 14, 11, 10, 13],
      ask: [11, 15, 12, 17, 14, 13, 16]
    },
    '24h': {
      labels: Array.from({ length: 8 }, (_, i) => `${String(i * 3).padStart(2, '0')}:00`),
      pass: [5, 4, 3, 7, 14, 18, 15, 12],
      ask: [8, 6, 5, 10, 18, 22, 19, 16]
    },
    '7d': {
      labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      pass: [12, 15, 11, 18, 14, 16, 20],
      ask: [15, 19, 14, 22, 17, 20, 24]
    }
  };

  const config = configs[range];
  if (!config) return;

  AppState.chart.data.labels = config.labels;
  AppState.chart.data.datasets[0].data = config.pass;
  AppState.chart.data.datasets[1].data = config.ask;
  AppState.chart.update();
}

// ==================== PRICING ====================

/**
 * Simular tarifa
 */
function simulate() {
  const dist = parseFloat($('sim-dist').value) || 8.5;
  const fuelPrice = parseFloat($('sim-fuel-price').value) || 5.5;
  const cap = parseInt($('sim-cap').value) || 4;
  const traffic = parseFloat($('sim-traffic').value) || 1.6;
  const hour = parseFloat($('sim-hour').value) || 1.3;
  const timeM = parseFloat($('sim-timeM').value) || 1.1;
  const historic = parseFloat($('sim-historic').value) || 15;

  const simulation = pricingService.simulatePrice({
    distanceKm: dist,
    fuelPrice,
    capacity: cap,
    traffic,
    hour,
    timeMultiplier: timeM,
    historic
  });

  // Mostrar resultados
  const result = $('sim-result');
  if (result) {
    result.innerHTML = `
      <div style="font-size: 12px; color: var(--t3); margin-bottom: 8px;">Resultado del Motor</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
        <div><small>Dist. base</small><div style="font-weight: 700;">S/ ${simulation.breakdown.distance.toFixed(2)}</div></div>
        <div><small>Combustible</small><div style="font-weight: 700;">S/ ${simulation.breakdown.fuel.toFixed(2)}</div></div>
        <div><small>Capacidad</small><div style="font-weight: 700;">S/ ${simulation.breakdown.capacity.toFixed(2)}</div></div>
        <div><small>Histórico</small><div style="font-weight: 700;">S/ ${simulation.breakdown.historic.toFixed(2)}</div></div>
      </div>
      <div style="border-top: 1px solid var(--border); padding-top: 12px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span>Mínimo (piso)</span>
          <strong>S/ ${simulation.minimumPrice.toFixed(2)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span>Factor dinámico</span>
          <strong>×${simulation.breakdown.dynamicFactor.toFixed(3)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Máximo (techo)</span>
          <strong>S/ ${simulation.maximumPrice.toFixed(2)}</strong>
        </div>
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); font-size: 16px; font-weight: 700; color: var(--lime);">
          Rango: S/ ${simulation.minimumPrice.toFixed(2)} — S/ ${simulation.maximumPrice.toFixed(2)}
        </div>
      </div>
    `;
    result.style.display = 'block';
  }
}

/**
 * Registrar un nuevo usuario (cualquier rol)
 */
async function registerUser() {
  const name = $('reg-name')?.value.trim();
  const email = $('reg-email')?.value.trim();
  const password = $('reg-pass')?.value;
  const role = $('reg-role')?.value;

  if (!name || !email || !password) {
    showToast('Completa nombre, email y contraseña', false);
    return;
  }
  if (password.length < 8) {
    showToast('La contraseña debe tener al menos 8 caracteres', false);
    return;
  }

  try {
    await authService.register({ name, email, password, role });
    showToast(`Usuario ${email} registrado (${role})`);
    $('reg-name').value = '';
    $('reg-email').value = '';
    $('reg-pass').value = '';
    if (role === USER_ROLES.DRIVER) loadFleet();
  } catch (error) {
    showToast(error.message || 'No se pudo registrar el usuario', false);
  }
}

// ==================== SETTINGS ====================

/**
 * Guardar configuración
 */
function saveSettings() {
  const gatewayUrl = $('settings-api-url').value;
  const baseUrl = $('settings-ms-base-url').value;
  const pricingUrl = $('settings-ms-pricing-url').value;

  localStorage.setItem('api_gateway_url', gatewayUrl);
  localStorage.setItem('ms_base_url', baseUrl);
  localStorage.setItem('ms_pricing_url', pricingUrl);

  showToast('Configuración guardada');
}

/**
 * Probar conexión
 */
async function testConnection() {
  const baseUrl = $('settings-ms-base-url').value;

  try {
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test', password: 'test' })
    });

    if (response.status === 400 || response.status === 401) {
      showToast(`✓ Backend alcanzable (${baseUrl})`);
    } else {
      showToast('Error en la conexión', false);
    }
  } catch (error) {
    showToast(`No se puede conectar a ${baseUrl}`, false);
  }
}

// ==================== EXTRAS UI ====================

/**
 * Actualizar etiquetas de pesos del motor (sliders)
 */
function updateWeights() {
  const sliders = document.querySelectorAll('input[type="range"][id^="w-"]');
  sliders.forEach((slider) => {
    const label = $(`${slider.id}-v`);
    if (label) label.textContent = `${slider.value}%`;
  });
}

/**
 * Protocolo de emergencia (placeholder Sprint 1)
 */
function triggerEmergency() {
  showToast('Protocolo de emergencia activado (simulado)', false);
}

// ==================== EXPORTAR FUNCIONES GLOBALES ====================

// Para llamadas desde HTML
window.doLogin = doLogin;
window.fillDemo = fillDemo;
window.togglePassword = togglePassword;
window.navigateTo = goTo;
window.closeModal = closeModal;
window.loadDashboard = loadDashboard;
window.loadFleet = loadFleet;
window.updateWeights = updateWeights;
window.triggerEmergency = triggerEmergency;
window.handleLogout = handleLogout;
window.openTripDetail = openTripDetail;
window.cancelTrip = cancelTrip;
window.assignTrip = assignTrip;
window.completeTrip = completeTrip;
window.setChart = setChart;
window.simulate = simulate;
window.registerUser = registerUser;
window.loadTrips = loadTrips;
window.saveSettings = saveSettings;
window.testConnection = testConnection;

// ==================== INICIAR ====================

window.addEventListener('DOMContentLoaded', initApp);
