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
    console.log(`Intentando registrar a ${name} (${role}) con email ${email}...`);
    await requestJson(`${BASE_URL}/auth/register`, {
      method: 'POST',
      body: { name, email, password, role },
    });
    console.log(`Registro exitoso para ${email}`);
  } catch (err) {
    if (err.message.includes('already exists') || err.message.includes('409') || err.message.includes('400')) {
      console.log(`El usuario ${email} ya existe. Iniciando sesión directamente.`);
    } else {
      throw err;
    }
  }

  console.log(`Iniciando sesión para ${email}...`);
  const data = await requestJson(`${BASE_URL}/auth/login`, {
    method: 'POST',
    body: { email, password },
  });
  console.log(`Sesión iniciada para ${email}. User info:`, JSON.stringify(data.user));
  return data.accessToken;
}

async function ensureVehicle(driverToken) {
  try {
    console.log('Verificando si el conductor tiene vehículo...');
    await requestJson(`${BASE_URL}/vehicles/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${driverToken}` },
    });
    console.log('El conductor ya tiene un vehículo registrado.');
  } catch (err) {
    console.log('Registrando vehículo para el conductor...');
    await requestJson(`${BASE_URL}/vehicles`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${driverToken}` },
      body: {
        brand: 'Toyota',
        model: 'Corolla',
        plate: 'LIMA-XYZ-' + Math.floor(Math.random() * 10000),
        color: 'Negro',
        year: 2022,
        capacity: 4,
        fuelType: 'gasoline',
      },
    });
    console.log('Vehículo registrado con éxito.');
  }
}

async function run() {
  const uniqueId = Date.now();
  const passengerToken = await registerOrLogin(
    'Pasajero QA',
    `passenger_qa_${uniqueId}@indrive.pe`,
    'password123',
    'passenger'
  );

  const driverToken = await registerOrLogin(
    'Conductor QA',
    `driver_qa_${uniqueId}@indrive.pe`,
    'password123',
    'driver'
  );

  await ensureVehicle(driverToken);

  // Conectar WebSockets primero
  console.log('Conectando sockets...');
  const passengerSocket = io(BASE_URL, { auth: { token: passengerToken } });
  const driverSocket = io(BASE_URL, { auth: { token: driverToken } });

  passengerSocket.on('connect', () => {
    console.log('[Passenger Socket] Conectado! ID:', passengerSocket.id);
  });
  passengerSocket.on('disconnect', (reason) => {
    console.log('[Passenger Socket] Desconectado! Razón:', reason);
  });
  passengerSocket.on('connect_error', (err) => {
    console.error('[Passenger Socket] Error de conexión:', err.message);
  });

  driverSocket.on('connect', () => {
    console.log('[Driver Socket] Conectado! ID:', driverSocket.id);
  });
  driverSocket.on('disconnect', (reason) => {
    console.log('[Driver Socket] Desconectado! Razón:', reason);
  });
  driverSocket.on('connect_error', (err) => {
    console.error('[Driver Socket] Error de conexión:', err.message);
  });

  const connections = [
    new Promise((resolve) => passengerSocket.on('connect', resolve)),
    new Promise((resolve) => driverSocket.on('connect', resolve)),
  ];
  await Promise.all(connections);
  console.log('Sockets conectados exitosamente.');

  let tripId = null;
  let acceptedOfferId = null;

  // Configurar timeouts y limpieza
  let timeoutId = setTimeout(() => {
    console.error('TIMEOUT: La simulación tardó demasiado.');
    cleanup();
    process.exit(1);
  }, 15000);

  function cleanup() {
    clearTimeout(timeoutId);
    passengerSocket.disconnect();
    driverSocket.disconnect();
  }

  // Flujo de eventos
  driverSocket.on('trip_created', (data) => {
    if (data.id === tripId) {
      console.log('[Driver Event] trip_created recibido para tripId:', tripId);
      console.log('[Driver Event] Precios en el evento del conductor -> Mínimo (Piso):', data.minimumPrice);
      const offerAmount = data.minimumPrice;
      console.log(`[Driver Action] Enviando oferta de S/. ${offerAmount}...`);
      driverSocket.emit('driver_offer', { tripId, amount: offerAmount });
    }
  });

  passengerSocket.on('offer_received', (data) => {
    console.log('[Passenger Event] offer_received:', data);
    if (data.status === 'pending') {
      acceptedOfferId = data.id;
      console.log(`[Passenger Action] Aceptando oferta ID: ${acceptedOfferId}...`);
      passengerSocket.emit('accept_offer', { tripId, offerId: acceptedOfferId });
    }
  });

  passengerSocket.on('trip_assigned', (data) => {
    console.log('[Passenger Event] trip_assigned:', data.status);
  });

  driverSocket.on('trip_assigned', (data) => {
    console.log('[Driver Event] trip_assigned:', data.status);
    console.log('[Driver Action] Iniciando viaje...');
    driverSocket.emit('start_trip', { tripId });
  });

  passengerSocket.on('trip_started', (data) => {
    console.log('[Passenger Event] trip_started:', data.status);
  });

  driverSocket.on('trip_started', (data) => {
    console.log('[Driver Event] trip_started:', data.status);
    console.log('[Driver Action] Enviando actualización de GPS...');
    driverSocket.emit('driver_location', {
      tripId,
      latitude: -12.115,
      longitude: -77.032,
    });
  });

  passengerSocket.on('driver_location_update', (data) => {
    console.log('[Passenger Event] driver_location_update:', data);
    
    // Una vez que el pasajero recibe la ubicación del conductor, el conductor completa el viaje
    console.log('[Driver Action] Finalizando viaje con precio real de S/. 28.50...');
    driverSocket.emit('complete_trip', { tripId, realPrice: 28.50 });
  });

  passengerSocket.on('trip_completed', (data) => {
    console.log('[Passenger Event] trip_completed! Tarifa final calculada por motor:', data);
    console.log('SIMULACIÓN COMPLETADA CON ÉXITO.');
    cleanup();
    process.exit(0);
  });

  driverSocket.on('trip_completed', (data) => {
    console.log('[Driver Event] trip_completed! Tarifa final:', data);
  });

  driverSocket.on('error', (err) => {
    console.error('[Driver Error]:', err);
  });

  passengerSocket.on('error', (err) => {
    console.error('[Passenger Error]:', err);
  });

  // Ahora sí, solicitar el viaje una vez que los sockets están conectados
  console.log('Creando solicitud de viaje...');
  const trip = await requestJson(`${BASE_URL}/trips`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${passengerToken}` },
    body: {
      origin: 'Miraflores, Lima',
      destination: 'San Isidro, Lima',
    },
  });
  tripId = trip.id;
  console.log(`Viaje solicitado con ID: ${tripId}`);
  console.log(`Precios de referencia -> Máximo (Techo): ${trip.maximumPrice}`);
}

run().catch((err) => {
  console.error('ERROR EN SIMULACIÓN:', err);
  process.exit(1);
});
