# QA — Panel Administrativo (Motor Tarifario inDrive+)

**Fecha:** 20 de junio, 2026
**Responsable:** Nardy

---

## Índice

1. [Sesión Admin](#1-sesión-admin)
2. [Pricing — Variables Base](#2-pricing--variables-base)
3. [Pricing — Umbrales de Anomalías](#3-pricing--umbrales-de-anomalías)
4. [Pricing — Simulador de Oferta/Demanda](#4-pricing--simulador-de-ofertademanda)
5. [Gestión de Viajes](#5-gestión-de-viajes)
6. [Seguridad (Safety Dashboard)](#6-seguridad-safety-dashboard)
7. [Sesión Auditor (solo lectura)](#7-sesión-auditor-solo-lectura)
8. [Merge a main](#8-merge-a-main)

---

## 1. Sesión Admin

### 1.1 Login y Dashboard

Login exitoso con credenciales de administrador. El Dashboard carga los KPIs principales (Total Trips, Active Drivers, Avg Negotiation Gap, Pricing Anomalies) con datos reales desde el backend.

|                             |                                         |
|-----------------------------|-----------------------------------------|
|<img width="1256" height="862" alt="image" src="https://github.com/user-attachments/assets/b64bbae7-7925-405c-b8ec-819ca4f2b024" />|<img width="1919" height="864" alt="image" src="https://github.com/user-attachments/assets/5359a2c1-135b-4548-a89f-6d5630f34a0c" />|

### 1.2 Live Transaction Audit

La tabla de auditoría en vivo del Dashboard muestra los viajes registrados con su ruta, monto ofertado por el pasajero y por el conductor.

<img width="1292" height="873" alt="image" src="https://github.com/user-attachments/assets/c8f89288-dc99-4665-adac-fb858073e26f" />


### 1.3 Gestión de Viajes

La vista de Viajes muestra el listado completo de viajes registrados en el sistema, con distancia recorrida y los montos negociados.

<img width="1292" height="859" alt="image" src="https://github.com/user-attachments/assets/6a5170ec-0be6-46b7-8eba-f0ae37c8ee4e" />


### 1.4 Gestión de Usuarios

Lista completa de usuarios registrados, segmentados por rol (Admin, Passenger, Driver, Auditor), con datos reales provenientes de la base de datos.

<img width="1919" height="866" alt="image" src="https://github.com/user-attachments/assets/f876fff2-9c60-47e8-8c9a-701a2f2e5bb4" />

---

## 2. Pricing — Variables Base

Se reemplazaron los antiguos sliders de porcentaje (que no representaban correctamente el modelo de negocio) por inputs numéricos con el **valor real** que usa el motor tarifario:

- **Costo por km (S/)** → `costPerKmBase`
- **Consumo combustible (L/km)** → `fuelConsumptionPerKm`
- **Costo extra por capacidad (S/)** → `capacityExtraCost`
- **Peso histórico zona** → `historicWeight`

<img width="1291" height="873" alt="image" src="https://github.com/user-attachments/assets/663446fe-1b29-44b8-939b-b4a6c87d1a48" />


**Prueba de persistencia:** se modificó el costo por km de `1.50` a `1.80`, se guardó, y al recargar la página el valor se mantuvo correctamente (sin corromperse ni revertirse).

<img width="1300" height="871" alt="image" src="https://github.com/user-attachments/assets/c1788bfa-d467-401f-9bb4-baa3dac2f85b" />


---

## 3. Pricing — Umbrales de Anomalías

Se agregó un nuevo formulario para configurar los umbrales que determinan cuándo una desviación de precio se marca como anomalía de severidad **media** o **alta**.

La UI muestra los valores en **porcentaje** (más intuitivo para el usuario), mientras que internamente se convierten a **decimal** antes de enviarse al backend (`anomalyMediumDeviation`, `anomalyHighDeviation`), que es el formato que espera la API.

<img width="1293" height="874" alt="image" src="https://github.com/user-attachments/assets/f6be2e16-8aa3-4bfa-a132-0becff396f76" />


**Prueba de persistencia:** se modificaron los valores y se confirmó que, tras refrescar, los datos cargados coinciden con lo guardado en el backend (conversión %↔decimal verificada).

---

## 4. Pricing — Simulador de Oferta/Demanda

Implementación de la **HU-08**: se agregaron sliders de "Demanda (viajes solicitados)" y "Oferta (conductores disponibles)" que ajustan automáticamente el factor hora/demanda existente en el motor (rango 1.0–1.5), sin crear variables nuevas.

**Fórmula aplicada:**
```
hourFactor = 1.0 + (demanda/100 - oferta/100) * 0.5
```

### Prueba 1: Demanda 80% / Oferta 40%

- Factor hora calculado automáticamente: **1.20**
- Resultado del motor con ese factor — rango calculado **S/ 17.67 — S/ 24.38**:

|               |              |
|------------------|----------------|
|<img width="920" height="862" alt="image" src="https://github.com/user-attachments/assets/b5aa1e0c-e691-419f-894b-6f0d28071401" />|<img width="1293" height="879" alt="image" src="https://github.com/user-attachments/assets/82575121-25a4-43d8-96ec-25978f7b57cf" />|


### Prueba 2: Demanda 80% / Oferta 50%

Factor hora calculado automáticamente: **1.15** (con distancia y tráfico distintos para verificar variabilidad)

![Simulador oferta/demanda - prueba 2](imgs/11-simulador-oferta-demanda-2.png)

Resultado del motor — rango calculado **S/ 22.76 — S/ 41.31**:

![Resultado simulador - prueba 2](imgs/12-simulador-resultado-2.png)

**Conclusión:** el factor dinámico responde correctamente a los cambios de oferta/demanda y el rango se recalcula en vivo, respetando los límites del motor (tope ×2.0, rango máximo ×3.5).

---

## 5. Gestión de Viajes — Filtros por estado

Se verificó que el filtro de estados en la vista de Viajes funcione correctamente.

**Filtro "Completado":**

![Viajes filtrados - Completado](imgs/17-viajes-filtro-completado.png)

**Filtro "Buscando":**

![Viajes filtrados - Buscando](imgs/18-viajes-filtro-buscando.png)

---

## 6. Seguridad (Safety Dashboard)

La sección de Seguridad muestra métricas operativas agregadas: demanda total, viajes completados, ingresos totales, distancia media, anomalías por severidad, anomalías activas y viajes cancelados.

![Safety Dashboard](imgs/19-seguridad-dashboard.png)

---

## 7. Sesión Auditor (solo lectura)

Se implementó un nuevo flujo de acceso para el rol **Auditor**: puede iniciar sesión y navegar por todas las secciones del panel, pero **no puede ejecutar ninguna acción de escritura** (crear, editar, activar/desactivar, eliminar, guardar configuración).

La protección se implementó en **dos capas**:
- **Frontend:** clase CSS `role-readonly` que deshabilita visualmente los botones de acción y muestra un banner naranja de aviso.
- **Backend:** los endpoints de escritura (`POST`, `PATCH`, `DELETE`) siguen exigiendo rol `ADMIN`; los de lectura (`GET /users`, `GET /trips/all`) ahora aceptan también `AUDITOR`.

### 7.1 Login y banner de modo lectura

Al iniciar sesión como auditor, aparece el banner naranja **"👁 Modo solo lectura (Auditor)"** en la parte superior del panel.

![Login auditor - modo lectura](imgs/13-login-auditor-modo-lectura.png)

### 7.2 Usuarios — lectura permitida, escritura bloqueada

El auditor puede ver la lista completa de usuarios, pero al intentar usar "Desactivar" o "Eliminar" recibe el mensaje **"No tienes permisos para esta acción"**, validado tanto en frontend como por respuesta 403 del backend.

![Auditor - usuarios bloqueado](imgs/14-auditor-usuarios-bloqueado.png)

### 7.3 Viajes — acceso de lectura completo

El auditor puede consultar el listado completo de viajes con todos sus datos (ruta, montos, distancia).

![Auditor - viajes en modo lectura](imgs/15-auditor-viajes-lectura.png)

### 7.4 Seguridad — mismos datos que Admin

La sección de Seguridad muestra exactamente la misma información agregada que ve el administrador.

![Auditor - Seguridad](imgs/21-auditor-seguridad.png)

### 7.5 Configuración — botones bloqueados

En la sección de Configuración del Sistema, los botones "Guardar configuración" y el formulario de "Registrar nuevo usuario" aparecen deshabilitados para el rol auditor.

![Auditor - configuración bloqueada](imgs/20-auditor-configuracion-bloqueada.png)

---

## 8. Merge a main

Tras sincronizar la rama `Panel_Admin` con los últimos cambios de `main` (incluyendo resolución de un conflicto por duplicado de `ms-reports` en `docker-compose.yml`), se abrió el Pull Request hacia `main`.

GitHub confirmó que las ramas podían fusionarse automáticamente sin conflictos:

![Pull Request - Comparing changes](imgs/23-github-comparing-changes.png)

El repositorio confirmó que la rama estaba lista para fusionar:

![Pull Request creado](imgs/22-github-pull-request.png)

**Resultado del merge:** `Fast-forward`, 48 archivos modificados, 2688 inserciones, sin conflictos. Todo el trabajo (editor de Pricing, sistema de Auditoría, simulador de oferta/demanda, rol Auditor) quedó incorporado oficialmente a `main`.

---

## Resumen de observaciones resueltas

| # | Observación | Estado |
|---|---|---|
| 1 | Conectar `GET /pricing/anomalies` (antes calculado en cliente) | ✅ |
| 2 | Conectar `GET /reports/summary` (antes calculado en cliente) | ✅ |
| 3 | Corregir bug de `GET /trips` vacío para admin → usar `GET /trips/all` | ✅ |
| 4 | Editor de Variables Base con valores reales (no porcentajes) | ✅ |
| 5 | Umbrales de anomalías configurables desde el panel | ✅ |
| 6 | Simulador con controles de Oferta/Demanda (HU-08) | ✅ |
| 7 | Acceso de solo lectura para rol Auditor | ✅ |
| 8 | Sincronización de rama y merge a `main` sin conflictos | ✅ |

