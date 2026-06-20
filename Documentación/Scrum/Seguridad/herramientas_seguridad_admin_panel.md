# 🛡️ Guía de Herramientas de Seguridad y Escaneo de Vulnerabilidades — Panel Administrativo

**Proyecto:** Motor Tarifario Inteligente para inDrive en Lima Metropolitana  
**Componente:** Panel Administrativo (`admin-panel`)  
**Tecnología:** Aplicación Web Estática (HTML5 / Vanilla JavaScript / Chart.js / Socket.io)  

Este documento detalla las herramientas óptimas para la auditoría de seguridad del Panel Administrativo, enfatizando en su **función específica**, el **análisis que realizan** y la estructura y contenido de los **reportes y alertas** que genera cada una.

---

## 🔍 1. Semgrep (SAST - Análisis Estático de Código)

### ⚙️ Función
Analiza el código fuente del panel sin necesidad de ejecutarlo (`index.html` y todos los scripts dentro de `js/`). Identifica vulnerabilidades y malas prácticas de codificación en tiempo de desarrollo.

*   **¿Qué escanea?:**
    *   Uso de propiedades inseguras de manipulación del DOM como `innerHTML` o `document.write()` que puedan dar pie a ataques XSS basados en el DOM.
    *   Uso de funciones peligrosas como `eval()`.
    *   Conexiones de comunicación inseguras (Sockets de WebSocket que usan `ws://` en lugar de `wss://`).
    *   Llaves de API o credenciales quemadas en duro (*hardcoded secrets*) en variables globales de configuración.

### 📋 Estructura del Reporte
Semgrep genera un reporte estructurado en terminal (o archivo JSON/SARIF) que agrupa los hallazgos según su nivel de criticidad.

*   **Campos clave del reporte:**
    *   **Severity / Severidad:** Clasificación del hallazgo (ej. `Blocking` para fallas críticas, `Warning` para sugerencias).
    *   **Rule / Regla violada:** Nombre técnico de la regla (ej. `nestjs-header-cors-any` o `missing-integrity`).
    *   **File & Line:** Archivo físico y la línea de código exacta donde se encuentra el problema.
    *   **Snippet:** Línea de código exacta resaltada para rápida localización.
    *   **Description & Link:** Explicación técnica del porqué es un riesgo de seguridad y un enlace a la documentación de Semgrep para aplicar la solución.

*   *Ejemplo de salida:*
    ```text
    /src/admin-panel/index.html
    ❯❱ html.security.audit.missing-integrity.missing-integrity
          ❰❰ Blocking ❱❱ This tag is missing an 'integrity' subresource integrity attribute.
          843┆ <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    ```

---

## 🌐 2. OWASP ZAP (DAST - Análisis Dinámico de Aplicación)

### ⚙️ Función
Realiza un escaneo activo y pasivo sobre el Panel Administrativo en tiempo de ejecución. Actúa como un atacante simulado enviando peticiones malformadas a la interfaz web y analizando las respuestas HTTP del panel y del backend.

*   **¿Qué escanea?:**
    *   **XSS Reflejado e Inyectado:** Intenta ingresar scripts maliciosos en los inputs del panel de control para ver si el navegador del administrador los ejecuta.
    *   **CSRF (Cross-Site Request Forgery):** Verifica la presencia de tokens anti-CSRF en formularios que realizan mutaciones de datos.
    *   **Vulnerabilidades de Sesión:** Cookies sin atributos de seguridad (falta de directivas `Secure`, `HttpOnly` y `SameSite`).
    *   **Cabeceras de Seguridad Faltantes:** Ausencia de cabeceras de protección en las respuestas del servidor que aloja el panel (ej: `X-Frame-Options`, `Content-Security-Policy`).

### 📋 Estructura del Reporte
OWASP ZAP genera un reporte ejecutivo interactivo en formato HTML o JSON clasificado por alertas.

*   **Categorías del reporte:**
    *   🔴 **Alertas Rojas (Alta Severidad):** Vulnerabilidades críticas explotables de inmediato (ej. XSS persistente).
    *   🟠 **Alertas Naranjas (Severidad Media):** Problemas de diseño o falta de protecciones del lado del servidor.
    *   🟡 **Alertas Amarillas (Severidad Baja):** Cabeceras mal configuradas o debilidades menores.
    *   🔵 **Alertas Azules (Informativas):** Información general sobre la infraestructura del servidor.
*   **Detalles por alerta:** Cada alerta incluye la URL afectada, el parámetro o input comprometido, la petición y respuesta HTTP completas utilizadas para confirmar el ataque, la descripción teórica del fallo y los pasos de mitigación sugeridos.

---

## 📦 3. Retire.js (SCA - Software Composition Analysis)

### ⚙️ Función
Escanea los archivos de bibliotecas JavaScript de terceros que utiliza el Panel de Administración (como `chart.js` o `socket.io.js`) para comprobar si corresponden a versiones que tienen vulnerabilidades conocidas reportadas públicamente.

*   **¿Qué escanea?:**
    *   La base de datos local de versiones de bibliotecas de JavaScript contra bases de datos públicas de vulnerabilidades (NVD / CVEs).
    *   Verifica tanto librerías instaladas por NPM en el entorno de desarrollo como scripts locales copiados en la carpeta `js/`.

### 📋 Estructura del Reporte
Retire.js emite un reporte en formato texto plano en consola o en archivo JSON.

*   **Campos clave del reporte:**
    *   **File Path:** Ruta del archivo de la librería analizada.
    *   **Dependency Name & Version:** Nombre del componente y versión actual detectada.
    *   **Vulnerabilidades Encontradas:**
        *   **Severidad:** Clasificación del riesgo (High, Medium, Low).
        *   **Summary:** Resumen breve del fallo de seguridad (ej. "Prototype Pollution" o "DoS via Regex").
        *   **CVE / Ady Link:** Identificador oficial del fallo (Código CVE) y enlaces a los avisos de seguridad que detallan la falla.
        *   **Fix recommendation:** La versión mínima del paquete a la que se debe actualizar para eliminar la vulnerabilidad.

---

## 📊 4. Lighthouse / Chrome DevTools (Auditoría en Caliente)

### ⚙️ Función
Herramienta de diagnóstico integrada directamente en la suite de desarrollador de Google Chrome. Realiza un análisis dinámico rápido del rendimiento, accesibilidad y buenas prácticas de seguridad sobre el estado cargado de la aplicación.

*   **¿Qué escanea?:**
    *   Si la página web utiliza HTTPS en todas sus transferencias.
    *   Uso de librerías JavaScript obsoletas con fallas de seguridad conocidas.
    *   Uso seguro de enlaces externos (revisa si las etiquetas `<a>` externas usan `rel="noopener"` o `rel="noreferrer"` para prevenir ataques de secuestro de pestañas).
    *   Presencia y validez de la directiva `Content Security Policy` (CSP) del documento.

### 📋 Estructura del Reporte
Lighthouse genera un reporte interactivo en una pestaña del navegador con puntajes de 0 a 100.

*   **Métricas del reporte:**
    *   **Puntaje Global:** Círculo coloreado en base a la calificación obtenida (Verde: 90-100, Naranja: 50-89, Rojo: 0-49).
    *   **Diagnostics (Diagnósticos):** Lista ordenada de las auditorías fallidas en materia de seguridad.
    *   **Passed Audits (Auditorías aprobadas):** Lista de las directivas y controles que sí cumple correctamente el sitio.
    *   **Enlaces de Ayuda:** Cada advertencia viene con un hipervínculo que apunta a *web.dev* de Google, detallando el método técnico recomendado para subsanar el fallo indicado.
