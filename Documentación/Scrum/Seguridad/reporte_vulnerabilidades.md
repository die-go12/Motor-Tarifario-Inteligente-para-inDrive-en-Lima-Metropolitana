# 🛡️ Reporte de Vulnerabilidades — Motor Tarifario Inteligente

**Fecha:** 30 de mayo de 2026  
**Herramientas:** Semgrep (análisis estático de código) + npm audit (dependencias)  
**Alcance:** Todo el repositorio (`indrive-plus`, `indrive-mobile`, `admin-panel`)

---

## Resumen Ejecutivo

| Herramienta | Hallazgos | Críticos | Altos | Moderados |
|---|---|---|---|---|
| **Semgrep** (código) | 5 | 0 | 5 (blocking) | 0 |
| **npm audit** — Backend | 2 | 0 | 2 | 0 |
| **npm audit** — Mobile | 16 | 0 | 0 | 16 |
| **Total** | **23** | **0** | **7** | **16** |

> [!NOTE]
> **Snyk** requiere autenticación (cuenta gratuita en snyk.io). Para usarlo, ejecutar `npx snyk auth` y seguir las instrucciones del navegador. Luego: `npx snyk test`.

---

## 🔍 Semgrep — Hallazgos de Código (5 findings)

### 1. ❌ CORS abierto a todos los orígenes (×2)

| Campo | Valor |
|---|---|
| **Severidad** | 🔴 Alta (Blocking) |
| **Archivos** | `indrive-plus/apps/api-gateway/src/main.ts` (línea 16) |
|  | `indrive-plus/apps/ms-base/src/main.ts` (línea 11) |
| **Regla** | `nestjs-header-cors-any` |
| **Problema** | `app.enableCors()` sin restricciones permite peticiones desde cualquier origen |

**Recomendación:**
```typescript
// Reemplazar app.enableCors() por:
app.enableCors({
  origin: [
    'http://localhost:8080',    // admin panel
    'http://localhost:3000',    // API gateway
    /^http:\/\/192\.168\.\d+\.\d+:\d+$/,  // red local
  ],
  credentials: true,
});
```

> [!TIP]
> Para el proyecto académico, esto es aceptable en desarrollo local. En producción sería una vulnerabilidad crítica.

---

### 2. ❌ Recursos externos sin integridad (SRI) (×2)

| Campo | Valor |
|---|---|
| **Severidad** | 🔴 Alta (Blocking) |
| **Archivo** | `admin-panel/index.html` (líneas 654-655) |
| **Regla** | `missing-integrity` |
| **Problema** | Scripts de CDN sin atributo `integrity`, vulnerables a ataques de supply-chain |

**Archivos afectados:**
```html
<!-- Línea 654 -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<!-- Línea 655 -->
<script src="https://cdn.socket.io/4.7.1/socket.io.min.js"></script>
```

**Recomendación:** Agregar atributos `integrity` y `crossorigin`:
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"
        integrity="sha384-<HASH>"
        crossorigin="anonymous"></script>
```

---

### 3. ❌ Dockerfile ejecuta como root

| Campo | Valor |
|---|---|
| **Severidad** | 🔴 Alta (Blocking) |
| **Archivo** | `indrive-plus/Dockerfile` (línea 14) |
| **Regla** | `missing-user` |
| **Problema** | El contenedor corre como `root`, dando acceso total si se compromete |

**Recomendación:** Agregar un usuario no-root al Dockerfile:
```dockerfile
# Antes de CMD, agregar:
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

CMD ["node", "dist/apps/ms-base/main"]
```

---

## 📦 npm audit — Vulnerabilidades en Dependencias

### Backend (`indrive-plus`) — 2 vulnerabilidades High

| Paquete | Severidad | Descripción | Fix |
|---|---|---|---|
| `tar` (≤7.5.10) | 🔴 High | Path traversal vía hardlinks/symlinks (6 CVEs acumulados) | `npm audit fix` |
| `@mapbox/node-pre-gyp` (≤1.0.11) | 🔴 High | Depende de `tar` vulnerable | `npm audit fix` |

**Comando para corregir:**
```bash
cd indrive-plus
npm audit fix
```

### Mobile (`indrive-mobile`) — 16 vulnerabilidades Moderate

| Paquete | Severidad | Descripción | Fix |
|---|---|---|---|
| `postcss` (<8.5.10) | 🟠 Moderate | XSS vía `</style>` en CSS stringify | Requiere actualizar Expo |
| `uuid` (<11.1.1) | 🟠 Moderate | Buffer bounds check faltante en v3/v5/v6 | Requiere actualizar Expo |

> [!WARNING]
> Las 16 vulnerabilidades del mobile están en dependencias transitivas de **Expo SDK 54**. Corregirlas con `npm audit fix --force` actualizaría Expo a v56, lo que es un **breaking change**. No se recomienda hacerlo antes de una demo.

**Comando seguro (corrige lo que no rompe):**
```bash
cd indrive-mobile
npm audit fix
```

---

## 📋 Plan de Acción Recomendado

| # | Acción | Herramienta | Esfuerzo | Prioridad |
|---|---|---|---|---|
| 1 | Ejecutar `npm audit fix` en `indrive-plus` | npm | 1 min | 🔴 Alta |
| 2 | Agregar usuario no-root al Dockerfile | Semgrep | 5 min | 🔴 Alta |
| 3 | Restringir CORS a orígenes permitidos | Semgrep | 10 min | 🟠 Media |
| 4 | Agregar `integrity` a scripts CDN del admin panel | Semgrep | 10 min | 🟠 Media |
| 5 | Ejecutar `npm audit fix` en `indrive-mobile` (sin `--force`) | npm | 1 min | 🟡 Baja |
| 6 | Crear cuenta en Snyk y correr `npx snyk test` | Snyk | 15 min | 🟡 Baja |

---

## Comandos Rápidos

```bash
# Semgrep (via Docker) — Escaneo completo
docker run --rm -v "$(pwd):/src" semgrep/semgrep semgrep scan --config auto /src

# npm audit — Backend
cd indrive-plus && npm audit

# npm audit — Mobile
cd indrive-mobile && npm audit

# Snyk (requiere autenticación previa con `npx snyk auth`)
cd indrive-plus && npx snyk test
```
