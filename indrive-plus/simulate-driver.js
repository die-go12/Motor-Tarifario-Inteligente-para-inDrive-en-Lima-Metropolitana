const io = require('socket.io-client');

const BASE_URL = 'http://localhost:3001';

async function requestJson(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const res = await fetch(url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP error ${res.status}: ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

async function registerOrLogin(name, email, password, role) {
  try {
    console.log(`[Driver Daemon] Registrando ${name} (${role})...`);
    await requestJson(`${BASE_URL}/auth/register`, {
      method: 'POST',
      body: { name, email, password, role },
    });
  } catch (err) {
    // Ignorar si ya existe
  }

  console.log(`[Driver Daemon] Iniciando sesión para ${email}...`);
  const data = await requestJson(`${BASE_URL}/auth/login`, {
    method: 'POST',
    body: { email, password },
  });
  return data.accessToken;
}

async function ensureVehicle(driverToken) {
  try {
    await requestJson(`${BASE_URL}/vehicles/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${driverToken}` },
    });
  } catch (err) {
    console.log('[Driver Daemon] Registrando vehículo...');
    await requestJson(`${BASE_URL}/vehicles`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${driverToken}` },
      body: {
        brand: 'Nissan',
        model: 'Sentra XL',
        plate: 'QA-9876',
        color: 'Negro',
        year: 2021,
        capacity: 4,
        fuelType: 'gasoline',
      },
    });
  }
}

async function run() {
  const driverToken = await registerOrLogin(
    'Driver Auto-QA',
    'driver_demo@indrive.pe',
    'password123',
    'driver'
  );

  await ensureVehicle(driverToken);

  console.log('[Driver Daemon] Conectando socket...');
  const driverSocket = io(BASE_URL, { auth: { token: driverToken } });

  driverSocket.on('connect', () => {
    console.log('[Driver Daemon] Socket conectado con éxito.');
  });

  driverSocket.on('trip_created', async (data) => {
    console.log('[Driver Daemon] Nuevo viaje detectado! ID:', data.id);
    console.log('[Driver Daemon] Esperando 2s antes de enviar oferta...');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const offerAmount = data.minimumPrice;
    console.log(`[Driver Daemon] Enviando oferta de S/. ${offerAmount} para viaje ID: ${data.id}`);
    driverSocket.emit('driver_offer', { tripId: data.id, amount: offerAmount });
  });

  driverSocket.on('trip_assigned', async (data) => {
    console.log('[Driver Daemon] Viaje asignado! Estado:', data.status);
    console.log('[Driver Daemon] Esperando 3s antes de iniciar el viaje...');
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    console.log('[Driver Daemon] Iniciando viaje...');
    driverSocket.emit('start_trip', { tripId: data.id });
  });

  driverSocket.on('trip_started', async (data) => {
    console.log('[Driver Daemon] Viaje en curso. Iniciando transmisión de GPS...');
    const tripId = data.id;
    
    // Simular 3 actualizaciones de GPS cada 3 segundos
    const coordinates = [
      { latitude: -12.0463, longitude: -77.0427 },
      { latitude: -12.0483, longitude: -77.0437 },
      { latitude: -12.0503, longitude: -77.0447 }
    ];

    for (let i = 0; i < coordinates.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      console.log(`[Driver Daemon] GPS actualización ${i + 1}/3:`, coordinates[i]);
      driverSocket.emit('driver_location', {
        tripId,
        latitude: coordinates[i].latitude,
        longitude: coordinates[i].longitude
      });
    }

    // Esperar 4s y completar viaje con precio real
    await new Promise((resolve) => setTimeout(resolve, 4000));
    console.log('[Driver Daemon] Completando viaje. Ingresando precio real: S/. 28.50');
    driverSocket.emit('complete_trip', { tripId, realPrice: 28.50 });
  });

  driverSocket.on('trip_completed', (data) => {
    console.log('[Driver Daemon] Viaje finalizado con tarifa final:', data.tarifaFinal);
    console.log('[Driver Daemon] Saliendo...');
    driverSocket.disconnect();
    process.exit(0);
  });

  driverSocket.on('error', (err) => {
    console.error('[Driver Daemon Error]:', err);
  });
}

run().catch((err) => {
  console.error('[Driver Daemon] ERROR:', err);
  process.exit(1);
});
