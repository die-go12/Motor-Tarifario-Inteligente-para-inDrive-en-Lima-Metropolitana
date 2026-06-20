const MS_BASE = process.env.MS_BASE_URL || 'http://localhost:3001';

const PASSWORD = 'Secret123';

const USERS = {
  admin: { name: 'Admin Demo', email: 'admin.demo@indrive.pe', role: 'admin' },
  passenger: {
    name: 'Pasajero Demo',
    email: 'pasajero.demo@indrive.pe',
    role: 'passenger',
  },
  driver: {
    name: 'Conductor Demo',
    email: 'conductor.demo@indrive.pe',
    role: 'driver',
  },
};

const VEHICLE = {
  brand: 'Toyota',
  model: 'Yaris',
  plate: 'DEMO-001',
  color: 'Plateado',
  year: 2021,
  capacity: 4,
  fuelType: 'gasoline',
};

const ROUTES = [
  { origin: 'Miraflores', destination: 'San Isidro' },
  { origin: 'Barranco', destination: 'Surco' },
  { origin: 'San Borja', destination: 'La Molina' },
];

async function api(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(MS_BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  return { ok: response.ok, status: response.status, data };
}

async function ensureUser(profile) {
  const registered = await api('POST', '/auth/register', {
    ...profile,
    password: PASSWORD,
  });
  if (registered.ok) {
    return registered.data;
  }
  const loggedIn = await api('POST', '/auth/login', {
    email: profile.email,
    password: PASSWORD,
  });
  if (loggedIn.ok) {
    return loggedIn.data;
  }
  throw new Error(
    `No se pudo crear ni iniciar sesión con ${profile.email}: ${loggedIn.status} ${JSON.stringify(loggedIn.data)}`,
  );
}

async function ensureVehicle(driverToken) {
  const created = await api('POST', '/vehicles', VEHICLE, driverToken);
  if (created.ok) return created.data;
  const existing = await api('GET', '/vehicles/me', null, driverToken);
  if (existing.ok) return existing.data;
  console.warn(
    `Aviso: no se pudo registrar vehículo (${created.status}). Continuando.`,
  );
  return null;
}

function midpoint(min, max) {
  return Math.round(((min + max) / 2) * 100) / 100;
}

async function createTrip(passengerToken, route) {
  const created = await api('POST', '/trips', route, passengerToken);
  if (!created.ok) {
    throw new Error(
      `No se pudo crear viaje ${route.origin}→${route.destination}: ${created.status} ${JSON.stringify(created.data)}`,
    );
  }
  return created.data;
}

async function findAvailableTrip(driverToken, tripId) {
  const available = await api('GET', '/trips/available', null, driverToken);
  if (!available.ok || !Array.isArray(available.data)) return null;
  return available.data.find((trip) => trip.id === tripId) || null;
}

async function negotiateFullLifecycle(tokens, trip) {
  const driverView = await findAvailableTrip(tokens.driver, trip.id);
  const min = driverView?.minimumPrice ?? trip.minimumPrice;
  const max = trip.maximumPrice ?? driverView?.minimumPrice;
  const amount = min && max ? midpoint(min, max) : min || 15;

  const offer = await api(
    'POST',
    `/trips/${trip.id}/offers`,
    { amount },
    tokens.driver,
  );
  if (!offer.ok) {
    throw new Error(
      `Oferta fallida en viaje ${trip.id}: ${offer.status} ${JSON.stringify(offer.data)}`,
    );
  }

  const accepted = await api(
    'POST',
    `/trips/${trip.id}/offers/${offer.data.id}/accept`,
    {},
    tokens.passenger,
  );
  if (!accepted.ok) {
    throw new Error(
      `Aceptación fallida en viaje ${trip.id}: ${accepted.status} ${JSON.stringify(accepted.data)}`,
    );
  }

  await api('PATCH', `/trips/${trip.id}/start`, {}, tokens.driver);
  await api(
    'PATCH',
    `/trips/${trip.id}/complete`,
    { realPrice: amount },
    tokens.driver,
  );

  return { tripId: trip.id, amount, status: 'COMPLETED' };
}

async function offerOnly(tokens, trip) {
  const driverView = await findAvailableTrip(tokens.driver, trip.id);
  const min = driverView?.minimumPrice ?? trip.minimumPrice;
  const max = trip.maximumPrice ?? min;
  const amount = min && max ? midpoint(min, max) : min || 15;
  const offer = await api(
    'POST',
    `/trips/${trip.id}/offers`,
    { amount },
    tokens.driver,
  );
  return {
    tripId: trip.id,
    amount,
    status: offer.ok ? 'SEARCHING (oferta pendiente)' : 'SEARCHING',
  };
}

async function main() {
  console.log(`Seed inDrive+ → ${MS_BASE}\n`);

  const admin = await ensureUser(USERS.admin);
  const passenger = await ensureUser(USERS.passenger);
  const driver = await ensureUser(USERS.driver);

  const tokens = {
    admin: admin.accessToken,
    passenger: passenger.accessToken,
    driver: driver.accessToken,
  };

  await ensureVehicle(tokens.driver);

  const trips = [];
  for (const route of ROUTES) {
    trips.push(await createTrip(tokens.passenger, route));
  }

  const results = [];
  results.push(await negotiateFullLifecycle(tokens, trips[0]));
  results.push(await offerOnly(tokens, trips[1]));
  results.push({ tripId: trips[2].id, status: 'SEARCHING' });

  console.log('=== Usuarios (contraseña para todos: ' + PASSWORD + ') ===');
  console.log(`  admin     → ${USERS.admin.email}`);
  console.log(`  passenger → ${USERS.passenger.email}   (úsalo para ver viajes en el panel)`);
  console.log(`  driver    → ${USERS.driver.email}`);
  console.log('\n=== Viajes creados ===');
  results.forEach((r) =>
    console.log(`  #${r.tripId} → ${r.status}${r.amount ? ` (S/${r.amount})` : ''}`),
  );
  console.log('\nListo. Loguéate en el panel como passenger o driver para ver datos.');
}

main().catch((error) => {
  console.error('\nSeed falló:', error.message);
  process.exit(1);
});
