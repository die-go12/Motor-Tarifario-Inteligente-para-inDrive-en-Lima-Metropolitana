# 🛡️ Guía de Herramientas de Seguridad y Escaneo de Vulnerabilidades — Aplicación Móvil

**Proyecto:** Motor Tarifario Inteligente para inDrive en Lima Metropolitana  
**Componente:** Aplicación Móvil (`indrive-mobile`)  
**Tecnología:** React Native / Expo SDK 54 / TypeScript / WebSockets (Socket.io)

Este documento detalla las herramientas óptimas para auditar la seguridad de la aplicación móvil, describiendo su **función específica**, el **análisis que realizan** y la estructura y formato de los **reportes y alertas** que genera cada una.

---

## 🔍 1. MobSF (Mobile Security Framework - SAST / DAST Automatizado)

### ⚙️ Función
Es un entorno de pruebas de penetración automatizado todo en uno para plataformas móviles (Android e iOS) que realiza análisis estáticos y dinámicos directamente sobre el binario compilado (archivo `.apk` o `.ipa`).

*   **¿Qué escanea?:**
    *   **Análisis del Manifiesto:** Permisos excesivos o innecesarios en `AndroidManifest.xml` (ej: lectura de contactos, llamadas, almacenamiento externo).
    *   **Configuración de Red:** Conexiones HTTP sin cifrar permitidas o configuraciones mal estructuradas de seguridad de red.
    *   **Criptografía Débil:** Uso de algoritmos obsoletos (MD5, SHA1) o llaves criptográficas de tamaño insuficiente.
    *   **Secretos en el binario:** Cadenas de texto en duro que revelen llaves de Firebase, claves de mapas o URLs de servidores privados.
    *   **Opciones de depuración:** Si el APK se compiló con la bandera `debuggable=true` activada, lo que permitiría adjuntar un debugger en producción.

### 📋 Estructura del Reporte
MobSF genera un panel de control interactivo vía web y reportes PDF detallados.

*   **Campos clave del reporte:**
    *   **Security Score (Puntuación):** Una calificación de 0 a 100 basada en la cantidad de fallas graves encontradas.
    *   **App Information:** Detalles de firma del APK, hashes criptográficos (SHA256) y tamaño.
    *   **Sección de Permisos:** Listado de permisos solicitados indicando su nivel de peligro (High, Medium, Normal) y justificación.
    *   **Security Analysis:** Tabla que clasifica las vulnerabilidades detectadas en código Java/Kotlin descompilado en severidades (Alta, Advertencia, Info) con referencia al archivo físico de la clase compilada.

---

## 📦 2. npm audit (SCA - Software Composition Analysis)

### ⚙️ Función
Realiza un escaneo estático sobre el archivo de manifiesto de dependencias `package.json` y `package-lock.json` de la app móvil para detectar dependencias en JavaScript o TypeScript con fallas de seguridad conocidas.

*   **¿Qué escanea?:**
    *   Dependencias vulnerables directas o transitivas del framework de React Native o bibliotecas de Expo (como `undici`, `ws`, `postcss`, `uuid`).

### 📋 Estructura del Reporte
npm audit imprime directamente en la consola o exporta en formato JSON una lista detallada de dependencias vulnerables.

*   **Campos clave del reporte:**
    *   **Package Name & Version:** El nombre de la dependencia comprometida y el rango de versiones vulnerables instaladas.
    *   **Severity / Severidad:** Gravedad del fallo (Critical, High, Moderate, Low).
    *   **Dependency Tree:** Muestra la cadena de llamadas, identificando qué paquete de tu proyecto arrastró la versión vulnerable.
    *   **Advisory URL / CVE:** Enlace directo a la base de datos de seguridad de GitHub o npm que describe detalladamente el vector de ataque y su impacto.
    *   **Fix Command:** El comando o versión específica recomendada para parchar la vulnerabilidad de manera automática.

---

## 💻 3. Semgrep (SAST - Escaneo de Código Fuente JS/TS)

### ⚙️ Función
Analiza el código fuente del proyecto (`src/...`) buscando malas prácticas y patrones de código no seguros antes de que la aplicación sea compilada en un APK.

*   **¿Qué escanea?:**
    *   Uso de almacenamiento no seguro (`AsyncStorage` en lugar de `SecureStore` para guardar tokens JWT o datos confidenciales).
    *   Uso de endpoints HTTP (`http://`) que no utilicen TLS/SSL.
    *   Bypasses manuales de validación de certificados SSL de red en Axios o librerías de conexión.
    *   Configuraciones de desarrollo expuestas o llaves de API quemadas directamente en el código de las pantallas.

### 📋 Estructura del Reporte
Semgrep genera reportes tabulares en consola o estructurados en formato JSON.

*   **Campos clave del reporte:**
    *   **Severity:** Nivel de importancia (ej. `Blocking` o `Warning`).
    *   **Rule ID:** Identificador único de la regla rota (ej. `react-native-insecure-storage`).
    *   **File Path & Line Number:** Ruta relativa del archivo y número de línea física de código.
    *   **Snippet:** Bloque de código detectado.
    *   **Remediation:** Texto instructivo de cómo cambiar el código inseguro por una alternativa segura.

---

## 🧪 4. Frida (Dynamic Instrumentation - Pentesting Dinámico)

### ⚙️ Función
Es una herramienta avanzada de instrumentación dinámica que permite inyectar fragmentos de código JavaScript en el proceso en ejecución de la app en un emulador o dispositivo real con permisos Root / Jailbreak.

*   **¿Qué analiza?:**
    *   **Resistencia al Root:** Evalúa si la aplicación móvil detecta que el dispositivo está modificado y bloquea su ejecución.
    *   **SSL Pinning Bypass:** Intenta anular el anclaje de certificados SSL inyectando código en las clases de red nativas de Android/iOS para poder interceptar el tráfico.
    *   **Inspección de memoria:** Busca si es posible leer variables de estado en vivo de la aplicación en tiempo de ejecución (como tokens de autenticación o coordenadas de ubicación GPS).

### 📋 Estructura del Reporte
Frida no genera reportes estáticos estructurados por defecto; su salida es una interfaz de línea de comandos (CLI) interactiva.

*   **Contenido de la consola de Frida:**
    *   **Log de Hooks:** Muestra los nombres de las funciones nativas interceptadas con éxito.
    *   **Dump de Argumentos:** Imprime en tiempo real los valores de los argumentos pasados a funciones críticas (ej. contraseñas enviadas en el login).
    *   **Status Scripts:** Mensajes definidos por el especialista de seguridad indicando si una protección nativa (como el chequeo de root) fue evadida o no.
