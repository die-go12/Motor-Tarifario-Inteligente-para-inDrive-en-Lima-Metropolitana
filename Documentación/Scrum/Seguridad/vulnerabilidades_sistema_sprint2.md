# 🛡️ Reporte de Vulnerabilidades del Sistema — Sprint 2

**Proyecto:** Motor Tarifario Inteligente para inDrive en Lima Metropolitana  
**Sprint:** Sprint 2  
**Fecha:** 20 de junio de 2026  
**Auditoría Realizada:** Análisis Estático de Código (SAST con Semgrep) y Escaneo de Dependencias (SCA con npm audit).

---

## 📊 1. Resumen Ejecutivo (Sprint 2)

Durante este sprint, se realizó un escaneo automatizado para evaluar la postura de seguridad del proyecto en tres frentes: el código fuente (Semgrep), las dependencias del backend (`indrive-plus`) y las dependencias de la aplicación móvil (`indrive-mobile`).

| Componente / Herramienta | Vulnerabilidades Totales | Prioridad Alta (🔴) | Prioridad Media (🟠) | Prioridad Baja (🟡) |
|---|:---:|:---:|:---:|:---:|
| **Semgrep** (Análisis de código) | **6** | 3 | 3 | 0 |
| **npm audit** (Dependencias Backend) | **36** | 18 | 18 | 0 |
| **npm audit** (Dependencias Mobile) | **28** | 4 | 24 | 0 |
| **Total General** | **70** | **25** | **45** | **0** |

---

## 🔍 2. Vulnerabilidades Críticas y Altas Detectadas (Código Fuente)

A través de **Semgrep**, se identificaron las siguientes vulnerabilidades de severidad **Alta** (Clasificadas como *Blocking* en el pipeline):

### A. CORS Abierto a Cualquier Origen (Wildcard CORS)
*   **Archivos Afectados:**
    *   [api-gateway/main.ts](file:///home/matias/Github/Motor-Tarifario-Inteligente-para-inDrive-en-Lima-Metropolitana/indrive-plus/apps/api-gateway/src/main.ts#L17)
    *   [ms-base/main.ts](file:///home/matias/Github/Motor-Tarifario-Inteligente-para-inDrive-en-Lima-Metropolitana/indrive-plus/apps/ms-base/src/main.ts#L11)
*   **Problema:** Se utiliza `app.enableCors()` sin argumentos, lo que expone los endpoints de la API del motor tarifario a peticiones cruzadas desde cualquier sitio web malicioso.
*   **Impacto:** Permite ataques de Cross-Origin Sharing bypass, donde un atacante puede extraer datos del flujo de viajes si el usuario tiene una sesión activa.

### B. Contenedor Docker Corre como Root
*   **Archivo Afectado:** [Dockerfile](file:///home/matias/Github/Motor-Tarifario-Inteligente-para-inDrive-en-Lima-Metropolitana/indrive-plus/Dockerfile#L7)
*   **Problema:** No se define la instrucción `USER` al final del archivo de construcción de la imagen de producción. El proceso de Node.js corre como superusuario (`root`).
*   **Impacto:** Si un atacante logra explotar una vulnerabilidad de ejecución remota de código (RCE) en NestJS, obtendrá control total sobre el contenedor y podría realizar un escape al sistema operativo anfitrión (*container breakout*).

### C. Scripts Externos sin Validación de Integridad (SRI)
*   **Archivo Afectado:** `admin-panel/index.html` (Líneas 843 y 844)
*   **Problema:** Se cargan los scripts externos de `chart.js` y `socket.io` desde un CDN sin el atributo `integrity`.
*   **Impacto:** Si el CDN es comprometido (*Supply Chain Attack*), un atacante podría inyectar JavaScript malicioso directamente en el Panel de Administración de tarifas sin que el navegador lo bloquee.

---

## 📦 3. Vulnerabilidades en Dependencias de Terceros (SCA)

### A. Backend (`indrive-plus`)
Se encontraron **36 vulnerabilidades** (18 High, 18 Moderate):
*   **`tar` y `@mapbox/node-pre-gyp` (High):** Múltiples CVEs de Path Traversal que permiten sobreescribir o leer archivos arbitrarios del sistema durante la descompresión.
*   **`multer` / `@nestjs/platform-express` (High):** Vulnerable a Denegación de Servicio (DoS) por el procesamiento ineficiente de payloads Multipart con nombres de campos muy anidados.
*   **`ws` / `socket.io-adapter` (High):** Agotamiento de recursos y caída del servidor WebSocket por envío malicioso de paquetes pequeños fragmentados.
*   **`http-proxy-middleware` (High):** Bypass de enrutamiento basado en cabeceras `Host` que permite el redireccionamiento de peticiones internas hacia servidores externos no deseados.

### B. Aplicación Móvil (`indrive-mobile`)
Se encontraron **28 vulnerabilidades** (4 High, 24 Moderate):
*   **`undici` (High):** Vulnerable a inyección de cabeceras HTTP mediante codificación de caracteres en cookies, y envenenamiento de la cola de peticiones HTTP en conexiones reutilizadas (Keep-Alive).
*   **`ws` (High):** Agotamiento de memoria del cliente por procesamiento incorrecto de fragmentos WebSocket.
*   **`postcss` / `uuid` (Moderate):** Inyección de CSS en WebViews (XSS) y falta de validación de límites en buffers.

---

## 🛠️ 4. Plan de Acción y Remedación

Para mitigar los riesgos más graves en este Sprint 2 sin comprometer la estabilidad del sistema móvil ni el motor tarifario, se propone el siguiente orden de prioridad:

### Fase 1: Inmediata (Prioridad Alta - Mitigación en el Backend)

1.  **Limitar CORS en API Gateway y MS Base:**
    Reemplazar la configuración por defecto por un listado explícito de dominios permitidos (como el puerto del Admin Panel local e IPs de desarrollo).
    ```typescript
    app.enableCors({
      origin: [
        'http://localhost:8080',
        'http://localhost:3000',
        /^http:\/\/192\.168\.\d+\.\d+:\d+$/, // Soporte para red local en testing móvil
      ],
      credentials: true,
    });
    ```
2.  **Mitigar el uso de Root en Docker:**
    Crear un usuario del sistema sin privilegios antes del comando de arranque del servidor Node.
    ```dockerfile
    # Dentro de Dockerfile
    RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
    USER appuser
    CMD ["node", "dist/apps/ms-base/main"]
    ```
3.  **Ejecutar actualizaciones seguras de dependencias en el backend:**
    ```bash
    cd indrive-plus && npm audit fix
    ```

### Fase 2: Corto Plazo (Prioridad Media - Integridad y Seguridad Móvil)

1.  **Agregar SRI a scripts en el Admin Panel:**
    Agregar los atributos de hashing criptográfico `integrity` y `crossorigin` a las etiquetas `<script>` en `admin-panel/index.html`.
2.  **Actualizar dependencias de la app móvil de forma segura:**
    Ejecutar `npm audit fix` sin la bandera `--force` para corregir las vulnerabilidades menores.
    > [!WARNING]
    > **Evitar `npm audit fix --force` en la aplicación móvil.** Esto actualizaría forzosamente el SDK de Expo (v54 a v56), lo cual constituye un cambio disruptivo (*breaking change*) que requiere extensas pruebas de regresión.

---

## 📥 5. Comandos para Reproducir los Escaneos

Puedes ejecutar y contrastar este reporte en cualquier momento con los siguientes comandos:

```bash
# 1. Escaneo estático de código fuente (Semgrep por Docker)
docker run --rm -v "$(pwd):/src" semgrep/semgrep semgrep scan --config auto /src

# 2. Análisis de dependencias del Backend
cd indrive-plus && npm audit

# 3. Análisis de dependencias del Móvil
cd indrive-mobile && npm audit
```
