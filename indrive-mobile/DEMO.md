# Guía de Demo — inDrive+ (Sprint 1)

Flujo que muestra la demo: **registro → pasajero pide viaje y ve el techo → conductor ve el piso y oferta → aceptación bilateral → asignado → ubicación GPS en vivo → inicio del viaje.**
(El pago/liquidación final es Sprint 2 y no entra en esta demo.)

---

## 1. Levantar el backend

Necesitas Docker y Node 18+. Desde `indrive-plus/`:

```bash
# a) Infraestructura (Postgres + Redis + Mongo) con el schema cargado
docker run -d --name pg -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=admin123 -e POSTGRES_DB=indrive \
  -p 5432:5432 -v "$PWD/database/postgresql/schema.sql:/docker-entrypoint-initdb.d/schema.sql" postgres:16
docker run -d --name redis -p 6379:6379 redis:7
docker run -d --name mongo -p 27017:27017 mongo:7

# b) Dependencias y build
cp .env.example .env
npm install
npm run build

# c) Arrancar los 3 servicios que usa el móvil (cada uno en una terminal)
node dist/apps/ms-integration/main.js   # :3003  (stubs de mapas/combustible/tráfico)
node dist/apps/ms-pricing/main.js       # :3002  (motor tarifario)
node dist/apps/ms-base/main.js          # :3001  (API REST + WebSocket)  <- la app habla con este
```

> La app móvil se conecta **directo a `ms-base` (:3001)** para REST y WebSocket.
> El API Gateway (:3000) es para el panel web admin, no para el móvil.

---

## 2. Configurar la app móvil

Desde `indrive-mobile/`:

1. **Configurar el archivo `.env`**:
   Copia el archivo `.env.example` como `.env`:
   ```bash
   cp .env.example .env
   ```
   Abre `.env` y configura las variables:
   * Si usas un **emulador local** o **conexión USB por cable** con redirección de puertos, puedes mantener `localhost`:
     ```env
     EXPO_PUBLIC_API_URL=http://localhost:3001
     EXPO_PUBLIC_WS_URL=http://localhost:3001
     ```
   * Si usas un **dispositivo físico vía Wi-Fi**, reemplaza `localhost` con la IP local de tu PC (ej. `http://192.168.18.202:3001`).
   * Configura tu API Key de Google Maps en `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`.

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Compilar y Arrancar con Expo Dev Client**:
   * **Para Emulador o Dispositivo Android (Recomendado)**:
     Asegúrate de tener el SDK de Android configurado. Si usas un dispositivo físico por USB, activa la depuración USB y ejecuta:
     ```bash
     # Redirigir puertos de Metro y el backend al celular por USB
     adb reverse tcp:8081 tcp:8081
     adb reverse tcp:3001 tcp:3001
     
     # Compilar e instalar el cliente de desarrollo e iniciar Metro
     npx expo run:android
     ```
     *(La primera vez compilará el APK de desarrollo y lo instalará en tu dispositivo/emulador. Para arranques diarios subsiguientes, puedes usar `npx expo start --dev-client`).*

   * **Para Simulador iOS (macOS)**:
     ```bash
     npx expo run:ios
     ```

   * **Para compilación en la nube (EAS Build)**:
     Si prefieres no compilar localmente, puedes usar EAS en la nube (requiere cuenta de Expo):
     ```bash
     npx eas build --profile development --platform android
     ```
     Descarga e instala el APK de desarrollo generado en tu dispositivo, y luego inicia Metro con:
     ```bash
     npx expo start --dev-client
     ```

---

## 3. Cuentas para la demo (rol fijo)

El rol es **fijo por cuenta** (no se cambia en caliente). Crea **dos cuentas** desde la pantalla de registro, usando el selector de rol:

- **Cuenta Pasajero** → registra eligiendo "🧑 Pasajero".
- **Cuenta Conductor** → registra eligiendo "🚗 Conductor". Luego el conductor debe registrar su vehículo (placa única) para poder ser asignado.

Ideal: dos dispositivos (o un emulador + un celular), uno con cada cuenta.

---

## 4. Guion de la demo

1. **Conductor** entra (queda escuchando viajes en tiempo real).
2. **Pasajero** toca "Solicitar viaje", busca un destino y ve **"Tu precio máximo garantizado"** (el techo).
3. Pasajero confirma → se crea el viaje.
4. En el **conductor** aparece la solicitud automáticamente (evento `trip_created`), mostrando **"Ganancia mínima garantizada"** (el piso).
5. Conductor escribe una oferta **dentro del rango** y la envía.
6. **Pasajero** ve la oferta llegar en vivo y la **acepta** (aceptación bilateral) → el viaje pasa a **ASIGNADO**.
7. El conductor entra al viaje, comparte su **ubicación GPS** (el pasajero la ve moverse en el mapa) y toca **"Iniciar viaje"** → estado **EN CURSO**.

---

## 5. Notas y límites conocidos (Sprint 1)

- El **mapa/ruta** del conductor usa coordenadas aproximadas (el backend del Sprint 1 guarda el viaje por nombre de lugar, no por coordenadas). La negociación y los precios sí son reales.
- El **nombre/vehículo del conductor** en la tarjeta de oferta es un placeholder (el evento de oferta aún no incluye esos datos). El **monto** sí es real.
- **Finalizar viaje / pago final**: es Sprint 2; el botón existe pero el cierre con liquidación no está implementado todavía.
- Si una oferta sale **fuera del rango** `[mín, máx]`, el backend la rechaza (negociación acotada).
