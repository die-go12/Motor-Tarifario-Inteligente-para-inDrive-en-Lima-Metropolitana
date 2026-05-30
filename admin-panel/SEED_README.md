# Seed de datos para la demo (Sprint 1)

Genera datos reales vía API (no toca la BD directamente): registra un admin, un
passenger y un driver, un vehículo, y 3 viajes — uno con ciclo completo
(oferta → aceptación → inicio → completado), uno con oferta pendiente y uno en
búsqueda.

## Pasos

1. **Sincronizar `main`** en esta rama (trae el backend con WebSocket y ofertas):
   ```
   git pull origin main
   ```
2. **Levantar el backend** (Docker) con el `schema.sql` cargado. ms-base debe
   responder en `http://localhost:3001`.
3. **Correr el seed** (requiere Node 18+):
   ```
   node admin-panel/seed.js
   ```

Si el backend no está en `localhost:3001`, define la URL antes de correr:
```
MS_BASE_URL=http://192.168.x.x:3001 node admin-panel/seed.js
```

## Resultado

Imprime las credenciales creadas (contraseña: `Secret123`) y los IDs de viaje.
Es re-ejecutable: si los usuarios ya existen, inicia sesión en vez de fallar.

## Para la demo

Loguéate en el panel como **passenger** o **driver** para ver viajes, rango
asimétrico y eventos en vivo. Como **admin** usa el motor tarifario (config y
simulador); la tabla de viajes del admin sale vacía por diseño del backend de
Sprint 1.
