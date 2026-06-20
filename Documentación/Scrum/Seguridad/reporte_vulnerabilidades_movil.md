# 🛡️ Reporte de Vulnerabilidades — Aplicación Móvil (Sprint 2)

**Proyecto:** Motor Tarifario Inteligente para inDrive en Lima Metropolitana  
**Componente:** Aplicación Móvil (`indrive-mobile`)  
**Fecha:** 20 de junio de 2026  
**Herramientas Ejecutadas:** Semgrep SAST + npm audit SCA  

Este reporte detalla los hallazgos de seguridad obtenidos tras la ejecución de las herramientas de análisis estático y auditoría de dependencias sobre la aplicación móvil.

---

## 📊 1. Resumen de Hallazgos

| Herramienta | Tipo de Escaneo | Elementos Analizados | Hallazgos Críticos/Altos | Estado / Acción |
| :--- | :--- | :--- | :---: | :--- |
| **Semgrep** | SAST (Código) | Carpeta `/src` (50 archivos) | **0** | Green (Limpio) |
| **npm audit** | SCA (Dependencias) | `package.json` + `node_modules` | **28** (4 High, 24 Moderate) | 🟡 Requiere Parcha Seguro |

---

## 🔍 2. Análisis del Código Fuente (Semgrep)
*   **Resultado:** **0 vulnerabilidades encontradas.**
*   **Análisis:**  
    El código Javascript/Typescript escrito para la aplicación móvil no presenta malas prácticas críticas detectadas por el motor de reglas estándar de Semgrep. Esto indica que se siguen buenas prácticas de codificación en el frontend, evitando el uso de funciones peligrosas de ejecución, redirecciones desprotegidas o almacenamiento de llaves privadas obvias en texto plano dentro de los archivos del cliente móvil analizados.

---

## 📦 3. Detalle de Vulnerabilidades en Dependencias (npm audit)

El escaneo de composición de software detectó **28 vulnerabilidades** distribuidas en dependencias del entorno de Expo y React Native:

### A. Vulnerabilidades de Severidad Alta (High)
1.  **`undici` (Varios CVEs):**
    *   **Impacto:** Envenenamiento de la cola de respuesta HTTP (Response Queue Poisoning) en conexiones keep-alive y bypass del atributo SameSite en Cookies mediante matching laxo de cadenas.
    *   **Riesgo:** Un atacante podría interceptar o alterar peticiones HTTP realizadas desde la app hacia la API del backend del motor tarifario.
2.  **`ws` (CVE-2024-37890):**
    *   **Impacto:** Denegación de servicio (DoS) por agotamiento de memoria al procesar fragmentos maliciosos WebSocket.
    *   **Riesgo:** Posible congelamiento o caída forzosa de la app móvil del conductor o pasajero durante el viaje activo si recibe mensajes de sockets corruptos.

### B. Vulnerabilidades de Severidad Moderada (Moderate)
*   **`postcss`:** Vulnerabilidad de Cross-Site Scripting (XSS) al sanitizar incorrectamente etiquetas de estilo HTML en componentes web embebidos.
*   **`uuid`:** Falta de verificación de límites en buffers.

---

## 🛠️ 4. Plan de Acción y Recomendaciones

Para solucionar estas vulnerabilidades de dependencias en la app móvil sin desestabilizar el entorno de desarrollo:

### 1. Aplicar la actualización segura de dependencias (Recomendado)
Ejecutar el comando de auditoría estándar dentro de la carpeta móvil:
```bash
cd indrive-mobile
npm audit fix
```
*Este comando actualizará las librerías compatibles que tengan parches directos lanzados por la comunidad sin modificar dependencias mayores.*

### 2. Evitar el uso de `npm audit fix --force`
> [!WARNING]
> **No utilizar la bandera `--force`.**  
> Hacerlo obligará a npm a actualizar dependencias principales como `react-native` y `expo` a versiones superiores (de Expo SDK 54 a Expo SDK 56). Esto representa un *breaking change* de alto riesgo que romperá la compatibilidad nativa de geolocalización y renderizado de mapas, requiriendo una migración completa y costosa del proyecto móvil.
