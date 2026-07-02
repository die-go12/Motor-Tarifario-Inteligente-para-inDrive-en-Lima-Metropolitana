# Remediación de dependencias — indrive-mobile

Estado tras la auditoría de seguridad (SCA). Objetivo: reducir vulnerabilidades **sin romper el funcionamiento** (Expo SDK 54 / RN 0.81).

## Resultado

| Momento | Total | Altas | Moderadas |
|---------|-------|-------|-----------|
| Antes | 23 | 4 | 19 |
| Después | **16** | **0** | 16 |

- **Las 4 de severidad ALTA quedaron eliminadas** (`ws`, `undici`, `form-data` y cadena asociada) vía `npm audit fix` (parches compatibles, sin `--force`).
- `postcss` fijado a `^8.5.10` (quedó `8.5.16`) mediante `overrides` en `package.json` — salto menor, compatible con `@expo/metro-config`.

## Qué se hizo (reproducible)

```bash
npm audit fix            # parches compatibles (NO --force)
# override de postcss agregado en package.json:
#   "overrides": { "postcss": "^8.5.10" }
npm install
npx tsc --noEmit         # OK, sin errores de tipos
npx expo-doctor          # 17/18 (el fallo restante es de config, ver abajo)
```

## Las 16 restantes: por qué se aceptan (no se fuerzan)

Todas son **moderadas** y cuelgan de un único paquete raíz: **`uuid`** (vía `xcode` → toolchain de Expo, y `@expo/ngrok`).

- Son dependencias del **toolchain de build/desarrollo de Expo** (`@expo/cli`, Metro, prebuild, dev-client, túnel ngrok). **No se importan desde el código de la app, por lo tanto NO viajan en el APK** — el riesgo para el usuario final es nulo.
- La única corrección que ofrece npm es subir a **Expo SDK 57 (cambio MAYOR)** = `npm audit fix --force`, que rompe el proyecto.
- Forzar `uuid` con `overrides` rompe `@expo/ngrok` (usa uuid v3) y arriesga el prebuild de `xcode` (APIs incompatibles entre versiones mayores).

**Decisión:** se aceptan como deuda de tooling. Se resolverán de raíz al subir de Expo SDK (54 → 57), que es un trabajo aparte y posterior a la demo.

Opcional: si NO se usa `expo start --tunnel`, quitar `@expo/ngrok` de `devDependencies` elimina 2 de las 16 (la cadena de `uuid@3.4.0`), sin afectar el modo LAN.

## Pendiente de config (preexistente, para el build de producción)

`npx expo-doctor` reporta que `app.json` tiene `android.usesCleartextTraffic` como propiedad inválida de schema. En Expo moderno el tráfico en claro se configura con el plugin `expo-build-properties` (ya instalado):

```jsonc
// app.json -> expo.plugins
["expo-build-properties", { "android": { "usesCleartextTraffic": true } }]
```

Para el **build de producción** debe quedar en `false` y usar `https://` / `wss://` (las URLs ya son variables de entorno: `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_WS_URL`). No se cambió aquí para no afectar las pruebas locales por HTTP; lo valida quien corre el móvil.

## Verificación pendiente (entorno del móvil)

- `npx expo start` + humo: login, mapa, cotización, viaje.
- La Google Maps API key va en el `.env` local (`EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`); la key filtrada debe rotarse en Google Cloud Console y restringirse por bundle id.
