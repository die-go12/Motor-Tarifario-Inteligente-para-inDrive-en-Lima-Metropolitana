# 🛡️ Reporte de Vulnerabilidades — Panel Administrativo (Sprint 2)

**Proyecto:** Motor Tarifario Inteligente para inDrive en Lima Metropolitana  
**Componente:** Panel Administrativo (`admin-panel`)  
**Fecha:** 20 de junio de 2026  
**Herramientas Ejecutadas:** Semgrep SAST + Retire.js SCA  

Este reporte contiene los hallazgos reales obtenidos al ejecutar las herramientas de escaneo estático y análisis de dependencias sobre los archivos locales del Panel Administrativo.

---

## 📊 1. Resumen de Hallazgos

| Herramienta | Tipo de Escaneo | Elementos Analizados | Hallazgos Críticos/Altos | Estado / Acción |
| :--- | :--- | :--- | :---: | :--- |
| **Semgrep** | SAST (Código) | `index.html` + `/js` (19 archivos) | **2** | 🔴 Requiere Corrección |
| **Retire.js** | SCA (Dependencias) | `/js` (Archivos JS locales) | **0** | Green (Limpio) |

---

## 🔍 2. Detalle de Vulnerabilidades Detectadas

### ❌ Recursos Externos Sin Validar (Falta de SRI)
*   **Herramienta:** Semgrep
*   **Regla:** `html.security.audit.missing-integrity.missing-integrity`
*   **Criticidad:** Alta (Blocking)
*   **Ubicación:** [admin-panel/index.html](file:///home/matias/Github/Motor-Tarifario-Inteligente-para-inDrive-en-Lima-Metropolitana/admin-panel/index.html#L843-L844) (Líneas 843 y 844)
*   **Código Afectado:**
    ```html
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <script src="https://cdn.socket.io/4.7.1/socket.io.min.js"></script>
    ```

*   **Descripción del Riesgo:**  
    Las etiquetas `<script>` cargan código dinámico directo desde CDNs de terceros sin validar el hash criptográfico del contenido. Si un atacante compromete los servidores de jsDelivr o Socket.io (Ataque de Cadena de Suministro), podría modificar las bibliotecas cargadas en caliente e inyectar scripts maliciosos (XSS) con los privilegios del Administrador. Esto facilitaría el secuestro de sesiones administrativas, alteración de la visualización de la tarifa final e interceptación de solicitudes.

---

## 📦 3. Análisis de Dependencias (SCA)
*   **Herramienta:** Retire.js v5.4.3
*   **Resultado:** **0 vulnerabilidades encontradas.**
*   **Análisis:**  
    El Panel Administrativo es una aplicación estática y minimalista que no utiliza dependencias de servidor (Node.js) para renderizarse. No se encontraron dependencias vulnerables en los archivos JS locales de comportamiento (`app.js`, `config.js` y `ui-utils.js`).  
    Esto resalta la importancia de solucionar el hallazgo de Semgrep, ya que la seguridad de las dependencias externas del panel descansa exclusivamente sobre las librerías dinámicas de terceros invocadas en `index.html`.

---

## 🛠️ 4. Plan de Remediación e Integridad SRI

Para corregir los dos hallazgos del panel de administración, se calcularon los hashes criptográficos SHA-384 oficiales correspondientes a las versiones exactas importadas:

*   **Chart.js (v4.4.0):** `sha384-e6nUZLBkQ86NJ6TVVKAeSaK8jWa3NhkYWZFomE39AvDbQWeie9PlQqM3pmYW5d1g`
*   **Socket.io (v4.7.1):** `sha384-aLDVTBgAxTWlDizeP12DGB2aUiRNc+gmLk756oobTbxrudEyn0GKgUA5BvKbFnOy`

### Modificación Recomendada en [index.html](file:///home/matias/Github/Motor-Tarifario-Inteligente-para-inDrive-en-Lima-Metropolitana/admin-panel/index.html)
Reemplazar las líneas 843 y 844 por el siguiente bloque seguro con protección SRI:

```html
<!-- CDN de Gráficos (Chart.js) con Integridad Verificada -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"
        integrity="sha384-e6nUZLBkQ86NJ6TVVKAeSaK8jWa3NhkYWZFomE39AvDbQWeie9PlQqM3pmYW5d1g"
        crossorigin="anonymous"></script>

<!-- CDN de WebSockets (Socket.io) con Integridad Verificada -->
<script src="https://cdn.socket.io/4.7.1/socket.io.min.js"
        integrity="sha384-aLDVTBgAxTWlDizeP12DGB2aUiRNc+gmLk756oobTbxrudEyn0GKgUA5BvKbFnOy"
        crossorigin="anonymous"></script>
```
Una vez aplicados estos cambios, el navegador del administrador validará el hash del archivo descargado y abortará la carga del script si el CDN llega a ser vulnerado.
