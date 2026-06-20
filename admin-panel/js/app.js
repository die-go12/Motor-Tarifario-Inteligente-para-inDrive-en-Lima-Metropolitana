/**
 * App Main Script - Punto de entrada de la aplicación
 * Refactorizado para usar servicios modulares
 */

import { 
  apiService,
  authService, 
  socketService,
  tripsService, 
  reportsService,
  vehiclesService,
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
import { debounce } from './ui-utils.js';

// Estado global
const AppState = {
  trips: [],
  currentTrip: null,
  chart: null,
  summary: null
};

function totalBySeverity(anomaliesBySeverity = {}) {
  return Object.values(anomaliesBySeverity).reduce((sum, value) => sum + Number(value || 0), 0);
}

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
    syncPricingConfigFields();
    syncBaseConfigFields();
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

  // Sincroniza formulario de registro para mostrar datos de vehículo solo en rol conductor
  toggleRegisterVehicleFields();
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

  // Sidebar navigation
  document.querySelectorAll('.nav-item[data-view]').forEach((button) => {
    try {
      button.addEventListener('click', () => {
        console.debug('Nav click:', button.dataset.view);
        goTo(button.dataset.view, button);
      });
    } catch (err) {
      console.error('Error attaching nav listener', err);
    }
  });

  // User role tab navigation
  document.querySelectorAll('.users-tab-btn').forEach((button) => {
    try {
      button.addEventListener('click', () => {
        const role = button.getAttribute('data-role') || 'all';
        console.debug('Users tab click:', role);
        loadUsers(role);
      });
      // remove any inline onclick to avoid double-calls
      if (button.getAttribute('onclick')) button.removeAttribute('onclick');
    } catch (err) {
      console.error('Error attaching users tab listener', err);
    }
  });

  // Nuevo conductor buttons
  const newDriverBtn = $('new-driver-btn');
  if (newDriverBtn) {
    newDriverBtn.addEventListener('click', openNewDriverModal);
  }
  const newDriverBtnUsers = $('new-driver-btn-users');
  if (newDriverBtnUsers) {
    newDriverBtnUsers.addEventListener('click', openNewUserModal);
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
    const trips = await tripsService.getAllTrips(filter || null);
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
  try {
    console.debug('goTo ->', viewName);
    navigateTo(viewName, navBtn);
  } catch (err) {
    console.error('navigateTo failed:', err);
  }

  // Fallback: si la vista no se activó, forzar toggle manualmente
  const targetView = document.getElementById(`view-${viewName}`);
  if (targetView && !targetView.classList.contains('active')) {
    // Ocultar todas las vistas y activar la requerida
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
    targetView.classList.add('active');

    // Actualizar estado activo del nav
    document.querySelectorAll('.nav-item').forEach((n) => n.classList.remove('active'));
    if (navBtn) navBtn.classList.add('active');

    showToast(`Navegando a: ${viewName}`);
  }

  if (viewName === 'fleet') loadFleet();
  if (viewName === 'users') loadUsers();
  if (viewName === 'audit') loadAuditLogs();
  if (viewName === 'safety') loadSafetySummary();
  if (viewName === 'pricing') {
    syncPricingConfigFields();
    syncBaseConfigFields();
  }
}

/**
 * Cargar conductores registrados (GET /users)
 */
async function loadFleet() {
  const container = $('fleet-grid');
  if (!container) return;

  container.innerHTML = 'Cargando conductores...';
  try {
    let users = await authService.listAllUsers();
    if (users && typeof users === 'object') {
      users = Array.isArray(users.data) ? users.data : Array.isArray(users.users) ? users.users : users;
    }
    console.debug('Fleet users response:', users);
    const drivers = (users || []).filter((u) => u.role === USER_ROLES.DRIVER);

    let vehiclesByDriver = {};
    try {
      const vehicles = await vehiclesService.getVehicles();
      vehiclesByDriver = (vehicles || []).reduce((acc, vehicle) => {
        acc[vehicle.driverId] = vehicle;
        return acc;
      }, {});
    } catch (vehicleError) {
      console.warn('No se pudieron cargar vehículos de conductores:', vehicleError);
    }

    if (!drivers.length) {
      container.innerHTML = '<div class="empty">Sin conductores registrados</div>';
      return;
    }

    container.innerHTML = drivers
      .map(
        (u, i) => {
          const vehicle = vehiclesByDriver[u.id];
          const vehicleDetail = vehicle
            ? `${vehicle.brand || '—'} ${vehicle.model || ''} • ${vehicle.plate || '—'}`
            : 'Sin vehículo registrado';
          const vehicleCapacity = vehicle?.capacity ? `${vehicle.capacity} pasajeros` : 'No definida';
          const vehicleFuel = vehicle?.fuelType || 'No definido';
          const vehicleYear = vehicle?.year || '—';

          return `
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
            <div class="dstat"><div class="dstat-label">Rol</div><div class="dstat-val">${u.role}</div></div>
            <div class="dstat" style="grid-column:1 / span 2"><div class="dstat-label">Vehículo</div><div class="dstat-val">${vehicleDetail}</div></div>
            <div class="dstat"><div class="dstat-label">Capacidad</div><div class="dstat-val">${vehicleCapacity}</div></div>
            <div class="dstat"><div class="dstat-label">Año / Combustible</div><div class="dstat-val">${vehicleYear} • ${vehicleFuel}</div></div>
          </div>
          <div style="margin-top:12px">
            <button class="btn-secondary" onclick="window.openVehicleModal(${u.id}, '${String(u.name || '').replace(/'/g, "\\'")}')">Editar vehículo</button>
          </div>
        </div>
      `;
        },
      )
      .join('');
  } catch (error) {
    console.error('Error loading fleet:', error);
    container.innerHTML = '<div class="empty">Error cargando conductores</div>';
  }
}

/**
 * Activar tab de usuarios por rol
 */
function setActiveUserTab(role) {
  document.querySelectorAll('.users-tab-btn').forEach((button) => {
    const buttonRole = button.getAttribute('data-role');
    button.classList.toggle('active', buttonRole === role);
  });
}

/**
 * Cargar usuarios registrados (GET /users)
 */
async function loadUsers(roleFilter = 'all') {
  const container = $('users-table-wrap');
  if (!container) return;

  window._usersRoleFilter = roleFilter;
  setActiveUserTab(roleFilter);
  showLoading(container, 'Cargando usuarios...');

  try {
    let users = await authService.listAllUsers();
    if (users && typeof users === 'object') {
      users = Array.isArray(users.data) ? users.data : Array.isArray(users.users) ? users.users : users;
    }
    console.debug('Users list response:', users);
    if (!Array.isArray(users)) {
      users = [];
    }

    if (roleFilter && roleFilter !== 'all') {
      users = users.filter((u) => String(u.role || '').toLowerCase() === String(roleFilter).toLowerCase());
    }

    if (!users.length) {
      container.innerHTML = `<div class="empty">No se encontraron usuarios${roleFilter && roleFilter !== 'all' ? ` de rol ${roleFilter}` : ''}</div>`;
      return;
    }

    const rows = users
      .map(
        (u) => {
          const role = String(u.role || 'desconocido').toLowerCase();
          const isActive = u.isActive === false ? false : true;
          return `
          <tr>
            <td>#${u.id}</td>
            <td>${u.name || '—'}</td>
            <td>${u.email || '—'}</td>
            <td><span class="role-pill role-${role}">${u.role || '—'}</span></td>
            <td>${isActive ? '<span class="pill-active">Activo</span>' : '<span class="pill-cancelled">Inactivo</span>'}</td>
            <td style="white-space:nowrap">
              <button class="users-action-btn btn-secondary" data-action="toggle" data-id="${u.id}" data-active="${isActive}">${isActive ? 'Desactivar' : 'Activar'}</button>
              <button class="users-action-btn btn-secondary" data-action="delete" data-id="${u.id}" style="margin-left:8px">Eliminar</button>
            </td>
          </tr>
        `;
        },
      )
      .join('');

    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;

    // Attach action handlers for each user row (activar/desactivar, eliminar)
    setTimeout(() => {
      try {
        document.querySelectorAll('.users-action-btn').forEach((btn) => {
          btn.addEventListener('click', async (e) => {
            const action = btn.getAttribute('data-action');
            const id = btn.getAttribute('data-id');
            const active = btn.getAttribute('data-active') === 'true';
            if (action === 'toggle') {
              await toggleUserActive(Number(id), active);
            } else if (action === 'delete') {
              await removeUser(Number(id));
            }
          });
        });
      } catch (err) {
        console.error('Error attaching user action handlers', err);
      }
    }, 10);

  } catch (error) {
    console.error('Error loading users:', error);
    container.innerHTML = '<div class="empty">Error cargando usuarios</div>';
  }
}

/**
 * Abrir modal para crear un nuevo conductor
 */
function openNewDriverModal() {
  const modalTitle = $('modal-title');
  const modalBody = $('modal-body');

  if (modalTitle) modalTitle.textContent = 'Nuevo conductor';
  if (modalBody) {
    modalBody.innerHTML = `
      <div style="display:grid;gap:14px">
        <div>
          <label class="form-label">Nombre</label>
          <input id="new-driver-name" class="form-input" placeholder="Nombre completo">
        </div>
        <div>
          <label class="form-label">Email</label>
          <input id="new-driver-email" type="email" class="form-input" placeholder="conductor@dominio.com">
        </div>
        <div>
          <label class="form-label">Contraseña</label>
          <input id="new-driver-pass" type="password" class="form-input" placeholder="Mínimo 8 caracteres">
        </div>
        <div style="padding:10px;border:1px solid var(--border);border-radius:var(--r-md)">
          <div style="font-weight:700;margin-bottom:10px">Vehículo del conductor</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <input id="new-driver-brand" class="form-input" placeholder="Marca (ej. Toyota)">
            <input id="new-driver-model" class="form-input" placeholder="Modelo (ej. Yaris)">
            <input id="new-driver-plate" class="form-input" placeholder="Placa (ej. ABC-123)">
            <input id="new-driver-capacity" type="number" min="1" class="form-input" placeholder="Capacidad (pasajeros)">
            <input id="new-driver-color" class="form-input" placeholder="Color (opcional)">
            <input id="new-driver-year" type="number" min="2000" class="form-input" placeholder="Año (opcional)">
            <select id="new-driver-fuelType" class="form-input">
              <option value="">Combustible</option>
              <option value="gasoline">gasoline</option>
              <option value="diesel">diesel</option>
              <option value="gas">gas</option>
              <option value="electric">electric</option>
              <option value="hybrid">hybrid</option>
            </select>
          </div>
        </div>
        <button class="btn-primary" onclick="window.createDriver()">Crear conductor</button>
      </div>
    `;
  }
  openModal();
}

/**
 * Abrir modal para crear un nuevo usuario (selección de rol)
 */
function openNewUserModal(defaultRole = '') {
  const modalTitle = $('modal-title');
  const modalBody = $('modal-body');

  if (modalTitle) modalTitle.textContent = 'Nuevo usuario';
  if (modalBody) {
    modalBody.innerHTML = `
      <div style="display:grid;gap:14px">
        <div>
          <label class="form-label">Nombre</label>
          <input id="new-user-name" class="form-input" placeholder="Nombre completo">
        </div>
        <div>
          <label class="form-label">Email</label>
          <input id="new-user-email" type="email" class="form-input" placeholder="usuario@dominio.com">
          <div id="new-user-email-hint" style="font-size:12px;color:var(--t3);margin-top:6px"></div>
        </div>
        <div>
          <label class="form-label">Contraseña</label>
          <input id="new-user-pass" type="password" class="form-input" placeholder="Mínimo 8 caracteres">
        </div>
        <div>
          <label class="form-label">Rol</label>
          <div style="display:flex;gap:8px;align-items:center">
            <select id="new-user-role" class="form-input">
              <option value="">-- Seleccionar rol --</option>
              <option value="admin">Admin</option>
              <option value="driver" data-driver-option style="display:none">Conductor</option>
              <option value="passenger">Pasajero</option>
              <option value="auditor">Auditor</option>
            </select>
            <button id="toggle-driver-option" class="btn-secondary" style="padding:6px 10px;font-size:12px">Mostrar Conductor</button>
          </div>
        </div>
        <div id="new-user-driver-fields" style="display:none;padding:10px;border:1px solid var(--border);border-radius:var(--r-md)">
          <div style="font-weight:700;margin-bottom:10px">Vehículo del conductor</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <input id="new-user-brand" class="form-input" placeholder="Marca">
            <input id="new-user-model" class="form-input" placeholder="Modelo">
            <input id="new-user-plate" class="form-input" placeholder="Placa">
            <input id="new-user-capacity" type="number" min="1" class="form-input" placeholder="Capacidad">
            <input id="new-user-color" class="form-input" placeholder="Color (opcional)">
            <input id="new-user-year" type="number" min="2000" class="form-input" placeholder="Año (opcional)">
            <select id="new-user-fuelType" class="form-input">
              <option value="">Combustible</option>
              <option value="gasoline">gasoline</option>
              <option value="diesel">diesel</option>
              <option value="gas">gas</option>
              <option value="electric">electric</option>
              <option value="hybrid">hybrid</option>
            </select>
          </div>
        </div>
        <button id="create-user-btn" class="btn-primary" onclick="window.createUser()">Crear usuario</button>
      </div>
    `;
    if (defaultRole) {
      setTimeout(() => {
        const sel = $('new-user-role');
        if (sel) sel.value = defaultRole;
      }, 10);
    }
  }
  openModal();

  // Attach email check + toggle driver option handlers
  const emailInput = $('new-user-email');
  const hint = $('new-user-email-hint');
  const createBtn = $('create-user-btn');
  const toggleDriverBtn = $('toggle-driver-option');
  const roleSelect = $('new-user-role');
  const driverFields = $('new-user-driver-fields');

  function syncDriverFieldsVisibility() {
    if (!driverFields || !roleSelect) return;
    driverFields.style.display = roleSelect.value === USER_ROLES.DRIVER ? 'block' : 'none';
  }

  async function checkEmail(value) {
    if (!value || value.indexOf('@') === -1) {
      if (hint) hint.textContent = '';
      if (createBtn) createBtn.disabled = false;
      return;
    }
    try {
      const users = await authService.listAllUsers();
      let list = users;
      if (list && typeof list === 'object') {
        list = Array.isArray(list.data) ? list.data : Array.isArray(list.users) ? list.users : list;
      }
      const exists = (list || []).some(u => String(u.email || '').toLowerCase() === String(value).toLowerCase());
      if (exists) {
        if (hint) hint.textContent = 'Ya existe un usuario con ese email';
        if (createBtn) createBtn.disabled = true;
      } else {
        if (hint) hint.textContent = '';
        if (createBtn) createBtn.disabled = false;
      }
    } catch (err) {
      console.error('Error checking email', err);
      if (hint) hint.textContent = '';
      if (createBtn) createBtn.disabled = false;
    }
  }

  if (emailInput) {
    const debounced = debounce((e) => checkEmail(e.target.value), 400);
    emailInput.addEventListener('input', debounced);
    emailInput.addEventListener('blur', (e) => checkEmail(e.target.value));
  }

  if (toggleDriverBtn && roleSelect) {
    toggleDriverBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const opt = roleSelect.querySelector('option[data-driver-option]');
      if (!opt) return;
      if (opt.style.display === 'none') {
        opt.style.display = '';
        toggleDriverBtn.textContent = 'Ocultar Conductor';
      } else {
        opt.style.display = 'none';
        if (roleSelect.value === 'driver') roleSelect.value = '';
        toggleDriverBtn.textContent = 'Mostrar Conductor';
      }
    });
  }

  if (roleSelect) {
    roleSelect.addEventListener('change', syncDriverFieldsVisibility);
  }
  syncDriverFieldsVisibility();
}

function collectVehicleProfile(prefix) {
  const brand = $(`${prefix}-brand`)?.value.trim();
  const model = $(`${prefix}-model`)?.value.trim();
  const plate = $(`${prefix}-plate`)?.value.trim();
  const capacity = Number($(`${prefix}-capacity`)?.value);
  const color = $(`${prefix}-color`)?.value.trim();
  const yearRaw = $(`${prefix}-year`)?.value;
  const year = yearRaw ? Number(yearRaw) : undefined;
  const fuelType = $(`${prefix}-fuelType`)?.value.trim();

  if (!brand || !model || !plate || !capacity) {
    return { error: 'Para conductor debes completar marca, modelo, placa y capacidad' };
  }

  const profile = {
    brand,
    model,
    plate,
    capacity,
  };

  if (color) profile.color = color;
  if (year && !Number.isNaN(year)) profile.year = year;
  if (fuelType) profile.fuelType = fuelType;

  return { profile };
}

async function createUserWithAudit(name, email, password, role, vehicleProfile) {
  const userPayload = { name, email, password, role };
  const created =
    typeof authService.adminCreateUser === 'function'
      ? await authService.adminCreateUser(userPayload)
      : await apiService.post(API_ENDPOINTS.USERS.LIST_ALL, userPayload);

  if (role === USER_ROLES.DRIVER && vehicleProfile) {
    const driverId = created?.id;
    if (!driverId) {
      throw new Error('No se pudo obtener el ID del conductor creado');
    }
    await vehiclesService.upsertByDriver(driverId, vehicleProfile);
  }

  return created;
}

/**
 * Crear un usuario nuevo (rol configurable)
 */
async function createUser() {
  const name = $('new-user-name')?.value.trim();
  const email = $('new-user-email')?.value.trim();
  const password = $('new-user-pass')?.value;
  const role = ($('new-user-role')?.value || '').toLowerCase();

  if (!name || !email || !password || !role) {
    showToast('Completa nombre, email, contraseña y rol', false);
    return;
  }
  if (password.length < 8) {
    showToast('La contraseña debe tener al menos 8 caracteres', false);
    return;
  }

  try {
    let vehicleProfile;
    if (role === USER_ROLES.DRIVER) {
      const { profile, error } = collectVehicleProfile('new-user');
      if (error) {
        showToast(error, false);
        return;
      }
      vehicleProfile = profile;
    }

    await createUserWithAudit(name, email, password, role, vehicleProfile);
    showToast(`Usuario ${email} creado`);
    closeModal();
    if (role === USER_ROLES.DRIVER) {
      await loadFleet();
    }
    if ($('view-users')?.classList.contains('active')) {
      await loadUsers();
    }
  } catch (error) {
    showToast(error.message || 'No se pudo crear el usuario', false);
  }
}

/**
 * Activar / Desactivar usuario
 */
async function toggleUserActive(userId, currentlyActive) {
  const action = currentlyActive ? 'desactivar' : 'activar';
  if (!confirm(`¿Seguro que deseas ${action} al usuario #${userId}?`)) return;
  try {
    if (typeof authService.adminUpdateUser === 'function') {
      await authService.adminUpdateUser(userId, { isActive: !currentlyActive });
    } else {
      await apiService.patch(API_ENDPOINTS.USERS.GET_ONE(userId), { isActive: !currentlyActive });
    }
    showToast(`Usuario #${userId} ${currentlyActive ? 'desactivado' : 'activado'}`);
    // Refrescar vistas relevantes
    await loadUsers(window._usersRoleFilter || 'all');
    await loadFleet();
  } catch (err) {
    console.error('Error toggling user active:', err);
    showToast(err.message || 'No se pudo actualizar el usuario', false);
  }
}

/**
 * Eliminar usuario
 */
async function removeUser(userId) {
  if (!confirm(`¿Eliminar permanentemente al usuario #${userId}? Esta acción es irreversible.`)) return;
  try {
    if (typeof authService.deleteUser === 'function') {
      await authService.deleteUser(userId);
    } else {
      await apiService.delete(API_ENDPOINTS.USERS.GET_ONE(userId));
    }
    showToast(`Usuario #${userId} eliminado`);
    await loadUsers(window._usersRoleFilter || 'all');
    await loadFleet();
  } catch (err) {
    console.error('Error deleting user:', err);
    showToast(err.message || 'No se pudo eliminar el usuario', false);
  }
}

/**
 * Crear un conductor nuevo
 */
async function createDriver() {
  const name = $('new-driver-name')?.value.trim();
  const email = $('new-driver-email')?.value.trim();
  const password = $('new-driver-pass')?.value;

  if (!name || !email || !password) {
    showToast('Completa nombre, email y contraseña', false);
    return;
  }
  if (password.length < 8) {
    showToast('La contraseña debe tener al menos 8 caracteres', false);
    return;
  }

  try {
    const { profile, error } = collectVehicleProfile('new-driver');
    if (error) {
      showToast(error, false);
      return;
    }

    await createUserWithAudit(name, email, password, USER_ROLES.DRIVER, profile);
    showToast(`Conductor ${email} creado`);
    closeModal();
    await loadFleet();
    if ($('view-users')?.classList.contains('active')) {
      await loadUsers();
    }
  } catch (error) {
    showToast(error.message || 'No se pudo crear el conductor', false);
  }
}

/**
 * Cargar registros de auditoría
 */
async function loadAuditLogs() {
  const container = $('audit-table-wrap');
  if (!container) return;

  container.innerHTML = 'Cargando auditoría...';
  try {
    const adminData = await apiService.get('/audit/logs?limit=100');
    const adminLogs = adminData.logs || [];

    let anomalies = [];
    try {
      anomalies = await pricingService.getAnomalies({ limit: 50 });
    } catch (err) {
      console.warn('Could not fetch pricing anomalies:', err);
    }

    const rows = [];

    // Procesar logs de admin (usuarios y configuración)
    if (adminLogs && adminLogs.length > 0) {
      adminLogs.forEach((log) => {
        let type = '';
        let detail = '';
        let severity = 'INFO';

        switch (log.action) {
          case 'CREATE_USER':
            type = 'CREAR USUARIO';
            detail = log.entityName || 'Usuario creado';
            break;
          case 'UPDATE_USER':
            type = 'ACTUALIZAR USUARIO';
            detail = log.entityName || 'Usuario actualizado';
            break;
          case 'DELETE_USER':
            type = 'ELIMINAR USUARIO';
            detail = log.entityName || 'Usuario eliminado';
            break;
          case 'UPDATE_CONFIG':
            type = 'CONFIG';
            detail = log.details || 'Configuración actualizada';
            break;
          case 'UPDATE_WEIGHTS':
            type = 'PESOS';
            detail = log.details || 'Pesos actualizados';
            break;
          default:
            type = log.action;
            detail = log.details || '—';
        }

        rows.push({
          type,
          admin: log.admin ? log.admin.name : 'Sistema',
          detail,
          severity,
          timestampMs: new Date(log.createdAt).getTime(),
          timestamp: new Date(log.createdAt).toLocaleString('es-PE'),
        });
      });
    }

    // Procesar anomalías auditadas desde pricing
    if (anomalies && anomalies.length > 0) {
      anomalies.forEach((log) => {
        rows.push({
          type: 'ANOMALÍA',
          admin: 'Sistema',
          detail: `Viaje #${log.tripId || '—'} | ${log.anomalyType || 'Pricing'} | Δ ${Number(log.deviation || 0).toFixed(2)}`,
          severity: String(log.severity || 'INFO').toUpperCase(),
          timestampMs: new Date(log.detectedAt || log.createdAt || log.updatedAt || Date.now()).getTime(),
          timestamp: new Date(log.detectedAt || log.createdAt || log.updatedAt || Date.now()).toLocaleString('es-PE'),
        });
      });
    }

    // Ordenar por timestamp descendente
    rows.sort((a, b) => b.timestampMs - a.timestampMs);

    if (rows.length === 0) {
      container.innerHTML = '<div class="empty">No hay registros de auditoría</div>';
      return;
    }

    const html = `
      <table>
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Admin</th>
            <th>Detalle</th>
            <th>Fecha/Hora</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
            <tr>
              <td><span class="badge ${row.type === 'ANOMALÍA' ? 'warn' : row.type === 'PRECIO' ? 'info' : 'action'}">${row.type}</span></td>
              <td>${row.admin}</td>
              <td style="max-width:400px;word-break:break-word">${row.detail}</td>
              <td style="font-size:12px;color:var(--t3);white-space:nowrap">${row.timestamp}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
      <div style="margin-top:16px;padding:12px;background:var(--surface2);border-radius:var(--r-md);font-size:12px;color:var(--t3)">
        <strong>Totales:</strong> ${adminLogs.length} cambios de admin, ${anomalies.length} anomalías auditadas
      </div>
    `;

    container.innerHTML = html;
  } catch (error) {
    console.error('Error loading audit logs:', error);
    container.innerHTML = `
      <div class="empty">
        <div style="color:var(--err);font-weight:700">Error cargando auditoría</div>
        <div style="color:var(--t3);font-size:12px;margin-top:8px">${error.message}</div>
      </div>
    `;
  }
}

/**
 * Cargar resumen de seguridad y métricas agregadas
 */
async function loadSafetySummary() {
  const totalQuotesEl = $('report-total-quotes');
  const completedTripsEl = $('report-completed-trips');
  const revenueEl = $('report-total-revenue');
  const averageDistanceEl = $('report-average-distance');
  const anomalyBreakdownEl = $('report-anomaly-breakdown');
  const safetyAnomaliesEl = $('safety-anomalies');
  const safetyCancelledEl = $('safety-cancelled');

  try {
    const [summary, trips] = await Promise.all([
      reportsService.getSummary(),
      tripsService.getAllTrips()
    ]);

    AppState.summary = summary;

    const totalAnomalies = totalBySeverity(summary.anomaliesBySeverity);
    const cancelledTrips = trips.filter((trip) => trip.status === 'CANCELLED').length;

    if (totalQuotesEl) totalQuotesEl.textContent = Number(summary.totalQuotes || 0).toLocaleString();
    if (completedTripsEl) completedTripsEl.textContent = Number(summary.completedTrips || 0).toLocaleString();
    if (revenueEl) revenueEl.textContent = `S/ ${Number(summary.totalRevenue || 0).toFixed(2)}`;
    if (averageDistanceEl) averageDistanceEl.textContent = `${Number(summary.averageDistanceKm || 0).toFixed(2)} km`;
    if (safetyAnomaliesEl) safetyAnomaliesEl.textContent = totalAnomalies.toLocaleString();
    if (safetyCancelledEl) safetyCancelledEl.textContent = cancelledTrips.toLocaleString();

    if (anomalyBreakdownEl) {
      const severities = summary.anomaliesBySeverity || {};
      anomalyBreakdownEl.innerHTML = `
        <span class="badge up">LOW ${Number(severities.LOW || severities.low || 0).toLocaleString()}</span>
        <span class="badge warn">MEDIUM ${Number(severities.MEDIUM || severities.medium || 0).toLocaleString()}</span>
        <span class="badge err">HIGH ${Number(severities.HIGH || severities.high || 0).toLocaleString()}</span>
      `;
    }
  } catch (error) {
    console.error('Error loading safety summary:', error);
    [totalQuotesEl, completedTripsEl, revenueEl, averageDistanceEl, safetyAnomaliesEl, safetyCancelledEl].forEach((el) => {
      if (el) el.textContent = '—';
    });
    if (anomalyBreakdownEl) {
      anomalyBreakdownEl.innerHTML = '<span class="badge">Sin datos</span>';
    }
  }
}


/**
 * Cargar KPIs
 */
async function loadKPIs() {
  try {
    const [summaryResult, tripsResult, usersResult] = await Promise.allSettled([
      reportsService.getSummary(),
      tripsService.getAllTrips(),
      authService.listAllUsers()
    ]);

    const summary = summaryResult.status === 'fulfilled' ? summaryResult.value : null;
    const trips = tripsResult.status === 'fulfilled' ? tripsResult.value : [];
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

    if (kpiTrips) {
      const totalDemand = summary ? summary.totalQuotes : stats.total;
      kpiTrips.textContent = Number(totalDemand || 0).toLocaleString();
    }
    if (kpiGap) kpiGap.textContent = `S/ ${avgGap.toFixed(2)}`;

    // Contar conductores activos reales desde /users (no desde trips)
    let driverCount = 0;
    try {
      let allUsers = usersResult.status === 'fulfilled' ? usersResult.value : null;
      if (allUsers && typeof allUsers === 'object') {
        allUsers = Array.isArray(allUsers.data) ? allUsers.data
          : Array.isArray(allUsers.users) ? allUsers.users
          : allUsers;
      }
      driverCount = (allUsers || []).filter(
        (u) => String(u.role || '').toLowerCase() === USER_ROLES.DRIVER
               && u.isActive !== false
      ).length;
    } catch {
      // fallback: conductores únicos con viaje asignado
      driverCount = new Set(trips.filter((t) => t.driverId).map((t) => t.driverId)).size;
    }
    if (kpiDrivers) kpiDrivers.textContent = driverCount;

    if (kpiAnomalies) {
      const anomaliesBySeverity = summary?.anomaliesBySeverity || {};
      kpiAnomalies.textContent = totalBySeverity(anomaliesBySeverity).toLocaleString();
    }

    AppState.trips = trips;
    AppState.summary = summary;
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
    const trips = await tripsService.getAllTrips();
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
    let vehicleProfile;
    if (role === USER_ROLES.DRIVER) {
      const { profile, error } = collectVehicleProfile('reg-driver');
      if (error) {
        showToast(error, false);
        return;
      }
      vehicleProfile = profile;
    }

    await createUserWithAudit(name, email, password, role, vehicleProfile);
    showToast(`Usuario ${email} registrado (${role})`);
    $('reg-name').value = '';
    $('reg-email').value = '';
    $('reg-pass').value = '';
    if (role === USER_ROLES.DRIVER) loadFleet();
  } catch (error) {
    showToast(error.message || 'No se pudo registrar el usuario', false);
  }
}

function toggleRegisterVehicleFields() {
  const role = $('reg-role')?.value;
  const fields = $('reg-driver-fields');
  if (!fields) return;
  fields.style.display = role === USER_ROLES.DRIVER ? 'block' : 'none';
}

function openVehicleModal(driverId, driverName) {
  const modalTitle = $('modal-title');
  const modalBody = $('modal-body');
  if (modalTitle) modalTitle.textContent = `Vehículo de ${driverName}`;

  if (modalBody) {
    modalBody.innerHTML = `
      <div style="display:grid;gap:14px">
        <div id="vehicle-modal-loading" style="color:var(--t3)">Cargando datos del vehículo...</div>
        <div id="vehicle-modal-form" style="display:none;padding:10px;border:1px solid var(--border);border-radius:var(--r-md)">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <input id="edit-vehicle-brand" class="form-input" placeholder="Marca">
            <input id="edit-vehicle-model" class="form-input" placeholder="Modelo">
            <input id="edit-vehicle-plate" class="form-input" placeholder="Placa">
            <input id="edit-vehicle-capacity" type="number" min="1" class="form-input" placeholder="Capacidad">
            <input id="edit-vehicle-color" class="form-input" placeholder="Color (opcional)">
            <input id="edit-vehicle-year" type="number" min="2000" class="form-input" placeholder="Año (opcional)">
            <select id="edit-vehicle-fuelType" class="form-input">
              <option value="">Combustible</option>
              <option value="gasoline">gasoline</option>
              <option value="diesel">diesel</option>
              <option value="gas">gas</option>
              <option value="electric">electric</option>
              <option value="hybrid">hybrid</option>
            </select>
          </div>
        </div>
        <button class="btn-primary" onclick="window.saveVehicleForDriver(${driverId})">Guardar vehículo</button>
      </div>
    `;
  }

  openModal();
  fillVehicleModal(driverId);
}

async function fillVehicleModal(driverId) {
  try {
    const vehicle = await vehiclesService.getByDriver(driverId);
    $('edit-vehicle-brand').value = vehicle?.brand || '';
    $('edit-vehicle-model').value = vehicle?.model || '';
    $('edit-vehicle-plate').value = vehicle?.plate || '';
    $('edit-vehicle-capacity').value = vehicle?.capacity || '';
    $('edit-vehicle-color').value = vehicle?.color || '';
    $('edit-vehicle-year').value = vehicle?.year || '';
    $('edit-vehicle-fuelType').value = vehicle?.fuelType || '';
  } catch (error) {
    console.warn('Conductor sin vehículo previo o error al cargar:', error);
  } finally {
    const loading = $('vehicle-modal-loading');
    const form = $('vehicle-modal-form');
    if (loading) loading.style.display = 'none';
    if (form) form.style.display = 'block';
  }
}

async function saveVehicleForDriver(driverId) {
  const { profile, error } = collectVehicleProfile('edit-vehicle');
  if (error) {
    showToast(error, false);
    return;
  }

  try {
    const updated = await vehiclesService.upsertByDriver(driverId, profile);
    showToast('Vehículo actualizado');
    closeModal();

    // Asegurar que la vista Fleet es la activa para que el re-render sea visible
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
    const fleetView = document.getElementById('view-fleet');
    if (fleetView) fleetView.classList.add('active');
    document.querySelectorAll('.nav-item').forEach((n) => n.classList.remove('active'));
    const fleetNav = document.querySelector('.nav-item[data-view="fleet"]');
    if (fleetNav) fleetNav.classList.add('active');

    // Pequeña pausa para que el modal termine su animación de cierre
    await new Promise((resolve) => setTimeout(resolve, 80));
    await loadFleet();
  } catch (err) {
    console.error('Error guardando vehículo de conductor:', err);
    showToast(err.message || 'No se pudo guardar el vehículo', false);
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

function syncPricingConfigFields() {
  const config = pricingService.config;
  if (!config) return;

  const anomalyMediumInput = $('anomaly-medium');
  const anomalyHighInput = $('anomaly-high');

  if (anomalyMediumInput) {
    anomalyMediumInput.value = String(Math.round((config.anomalyMediumDeviation ?? 0.15) * 100));
  }

  if (anomalyHighInput) {
    anomalyHighInput.value = String(Math.round((config.anomalyHighDeviation ?? 0.30) * 100));
  }
}

async function saveBaseConfig() {
  const costPerKmBase = parseFloat($('cfg-cost-km')?.value);
  const fuelConsumptionPerKm = parseFloat($('cfg-fuel-consumption')?.value);
  const capacityExtraCost = parseFloat($('cfg-capacity-cost')?.value);
  const historicWeight = parseFloat($('cfg-historic-weight')?.value);
  const msgEl = $('base-config-msg');

  if (!msgEl) return;

  if ([costPerKmBase, fuelConsumptionPerKm, capacityExtraCost, historicWeight].some(isNaN)) {
    msgEl.textContent = 'Valores inválidos';
    msgEl.style.color = '#f87171';
    return;
  }

  try {
    await pricingService.updateConfig({
      costPerKmBase,
      fuelConsumptionPerKm,
      capacityExtraCost,
      historicWeight
    });
    msgEl.textContent = '✓ Variables base guardadas correctamente';
    msgEl.style.color = '#4ade80';
    syncBaseConfigFields();
  } catch (error) {
    msgEl.textContent = `Error: ${error.message}`;
    msgEl.style.color = '#f87171';
  }
}

function syncBaseConfigFields() {
  const config = pricingService.config;
  if (!config) return;

  const costKm = $('cfg-cost-km');
  const fuelCons = $('cfg-fuel-consumption');
  const capCost = $('cfg-capacity-cost');
  const histWeight = $('cfg-historic-weight');

  if (costKm) costKm.value = String(config.costPerKmBase ?? 1.50);
  if (fuelCons) fuelCons.value = String(config.fuelConsumptionPerKm ?? 0.10);
  if (capCost) capCost.value = String(config.capacityExtraCost ?? 0.50);
  if (histWeight) histWeight.value = String(config.historicWeight ?? 0.15);
}

async function saveAnomalyThresholds() {
  const medium = parseFloat($('anomaly-medium').value);
  const high = parseFloat($('anomaly-high').value);
  const msgEl = $('anomaly-thresholds-msg');

  if (isNaN(medium) || isNaN(high)) {
    msgEl.textContent = 'Valores inválidos';
    msgEl.style.color = '#f87171';
    return;
  }
  if (medium >= high) {
    msgEl.textContent = 'La desviación media debe ser menor que la alta';
    msgEl.style.color = '#f87171';
    return;
  }

  try {
    // Convertir porcentaje (UI) a decimal (backend): 15% -> 0.15
    await pricingService.updateConfig({
      anomalyMediumDeviation: medium / 100,
      anomalyHighDeviation: high / 100
    });
    msgEl.textContent = '✓ Umbrales guardados correctamente';
    msgEl.style.color = '#4ade80';
    syncPricingConfigFields();
  } catch (error) {
    msgEl.textContent = `Error: ${error.message}`;
    msgEl.style.color = '#f87171';
  }
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
window.loadUsers = loadUsers;
window.openNewDriverModal = openNewDriverModal;
window.createDriver = createDriver;
window.openVehicleModal = openVehicleModal;
window.saveVehicleForDriver = saveVehicleForDriver;
window.loadAuditLogs = loadAuditLogs;
window.loadSafetySummary = loadSafetySummary;
window.openNewUserModal = openNewUserModal;
window.createUser = createUser;
window.updateWeights = updateWeights;
window.saveBaseConfig = saveBaseConfig;
window.saveAnomalyThresholds = saveAnomalyThresholds;
window.triggerEmergency = triggerEmergency;
window.handleLogout = handleLogout;
window.openTripDetail = openTripDetail;
window.cancelTrip = cancelTrip;
window.assignTrip = assignTrip;
window.completeTrip = completeTrip;
window.setChart = setChart;
window.simulate = simulate;
window.registerUser = registerUser;
window.toggleRegisterVehicleFields = toggleRegisterVehicleFields;
window.loadTrips = loadTrips;
window.saveSettings = saveSettings;
window.testConnection = testConnection;

// ==================== INICIAR ====================

window.addEventListener('DOMContentLoaded', initApp);
