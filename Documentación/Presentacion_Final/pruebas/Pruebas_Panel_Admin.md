# QA — Panel Administrativo (Motor Tarifario inDrive+)

**Fecha:** 20 de junio, 2026
**Responsable:** Nardy

---

## Índice

1. [Sesión Admin](#1-sesión-admin)
2. [Pricing — Variables Base](#2-pricing--variables-base)
3. [Pricing — Umbrales de Anomalías](#3-pricing--umbrales-de-anomalías)
4. [Pricing — Simulador de Oferta/Demanda](#4-pricing--simulador-de-ofertademanda)
5. [Gestión de Viajes — Filtros por estado](#5-gestión-de-viajes--filtros-por-estado)
6. [Seguridad (Safety Dashboard)](#6-seguridad-safety-dashboard)
7. [Sesión Auditor (solo lectura)](#7-sesión-auditor-solo-lectura)
8. [Creación de Usuarios (conductores, pasajeros, admin y auditores)](#8-creación-de-usuarios-conductores-pasajeros-admin-y-auditores)

---

## 1. Sesión Admin

### 1.1 Login y Dashboard

Login exitoso con credenciales de administrador. El Dashboard carga los KPIs principales (Total Trips, Active Drivers, Avg Negotiation Gap, Pricing Anomalies) con datos reales desde el backend.

<table>
<tr>
<td>
<img src="https://github.com/user-attachments/assets/b64bbae7-7925-405c-b8ec-819ca4f2b024" width="450">
</td>
<td>
<img src="https://github.com/user-attachments/assets/5359a2c1-135b-4548-a89f-6d5630f34a0c" width="450">
</td>
</tr>
</table>

### 1.2 Live Transaction Audit

La tabla de auditoría en vivo del Dashboard muestra los viajes registrados con su ruta, monto ofertado por el pasajero y por el conductor.

<p align="center">
<img src="https://github.com/user-attachments/assets/c8f89288-dc99-4665-adac-fb858073e26f" width="700">
</p>


### 1.3 Gestión de Viajes

La vista de Viajes muestra el listado completo de viajes registrados en el sistema, con distancia recorrida y los montos negociados.

<p align="center">
<img src="https://github.com/user-attachments/assets/6a5170ec-0be6-46b7-8eba-f0ae37c8ee4e" width="700">
</p>


### 1.4 Gestión de Usuarios

Lista completa de usuarios registrados, segmentados por rol (Admin, Passenger, Driver, Auditor), con datos reales provenientes de la base de datos.

<p align="center">
<img src="https://github.com/user-attachments/assets/f876fff2-9c60-47e8-8c9a-701a2f2e5bb4" width="700">
</p>

---

## 2. Pricing — Variables Base

Se reemplazaron los antiguos sliders de porcentaje (que no representaban correctamente el modelo de negocio) por inputs numéricos con el **valor real** que usa el motor tarifario:

- **Costo por km (S/)** → `costPerKmBase`
- **Consumo combustible (L/km)** → `fuelConsumptionPerKm`
- **Costo extra por capacidad (S/)** → `capacityExtraCost`
- **Peso histórico zona** → `historicWeight`

<p align="center">
<img src="https://github.com/user-attachments/assets/663446fe-1b29-44b8-939b-b4a6c87d1a48" width="700">
</p>


**Prueba de persistencia:** se modificó el costo por km de `1.50` a `1.80`, se guardó, y al recargar la página el valor se mantuvo correctamente (sin corromperse ni revertirse).

<p align="center">
<img src="https://github.com/user-attachments/assets/c1788bfa-d467-401f-9bb4-baa3dac2f85b" width="700">
</p>


---

## 3. Pricing — Umbrales de Anomalías

Se agregó un nuevo formulario para configurar los umbrales que determinan cuándo una desviación de precio se marca como anomalía de severidad **media** o **alta**.

La UI muestra los valores en **porcentaje** (más intuitivo para el usuario), mientras que internamente se convierten a **decimal** antes de enviarse al backend (`anomalyMediumDeviation`, `anomalyHighDeviation`), que es el formato que espera la API.

<p align="center">
<img src="https://github.com/user-attachments/assets/f6be2e16-8aa3-4bfa-a132-0becff396f76" width="700">
</p>

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

<table>
<tr>
<td>
<img src="https://github.com/user-attachments/assets/b5aa1e0c-e691-419f-894b-6f0d28071401" width="450">
</td>
<td>
<img src="https://github.com/user-attachments/assets/82575121-25a4-43d8-96ec-25978f7b57cf" width="450">
</td>
</tr>
</table>


### Prueba 2: Demanda 80% / Oferta 50%

- Factor hora calculado automáticamente: **1.15** (con distancia y tráfico distintos para verificar variabilidad)
- Resultado del motor — rango calculado **S/ 22.76 — S/ 41.31**:

<table>
<tr>
<td>
<img src="https://github.com/user-attachments/assets/814dacfc-8bf8-4627-a7cd-03de6bda2c9d" width="450">
</td>
<td>
<img src="https://github.com/user-attachments/assets/52b850e7-bf7f-4f17-b0c9-be880813c6dc" width="450">
</td>
</tr>
</table>


**Conclusión:** el factor dinámico responde correctamente a los cambios de oferta/demanda y el rango se recalcula en vivo, respetando los límites del motor (tope ×2.0, rango máximo ×3.5).

---

## 5. Gestión de Viajes — Filtros por estado

Se verificó que el filtro de estados en la vista de Viajes funcione correctamente.

**Filtro "Completado":**

<p align="center">
<img src="https://github.com/user-attachments/assets/b2deb25d-a2cc-44fa-9e33-387911a435ec" width="700">
</p>


**Filtro "Buscando":**

<p align="center">
<img src="https://github.com/user-attachments/assets/fec8c5ec-99d8-40b5-a383-e5358eb0ddba" width="700">
</p>

---

## 6. Seguridad (Safety Dashboard)

La sección de Seguridad muestra métricas operativas agregadas: demanda total, viajes completados, ingresos totales, distancia media, anomalías por severidad, anomalías activas y viajes cancelados.

<p align="center">
<img src="https://github.com/user-attachments/assets/58a113f5-3970-4f66-be2e-3fe264b1c71b" width="700">
</p>


---

## 7. Sesión Auditor (solo lectura)

Se implementó un nuevo flujo de acceso para el rol **Auditor**: puede iniciar sesión y navegar por todas las secciones del panel, pero **no puede ejecutar ninguna acción de escritura** (crear, editar, activar/desactivar, eliminar, guardar configuración).

La protección se implementó en **dos capas**:
- **Frontend:** clase CSS `role-readonly` que deshabilita visualmente los botones de acción y muestra un banner naranja de aviso.
- **Backend:** los endpoints de escritura (`POST`, `PATCH`, `DELETE`) siguen exigiendo rol `ADMIN`; los de lectura (`GET /users`, `GET /trips/all`) ahora aceptan también `AUDITOR`.

### 7.1 Login y banner de modo lectura

Al iniciar sesión como auditor, aparece el banner naranja **"👁 Modo solo lectura (Auditor)"** en la parte superior del panel.

<table>
<tr>
<td>
<img src="https://github.com/user-attachments/assets/8143ed53-d27a-4b77-ad11-ad92e532443d" width="450">
</td>
<td>
<img src="https://github.com/user-attachments/assets/be551252-901f-440e-8abe-e3bffb66d85c" width="450">
</td>
</tr>
</table>



### 7.2 Usuarios — lectura permitida, escritura bloqueada

El auditor puede ver la lista completa de usuarios, pero al intentar usar "Desactivar" o "Eliminar" recibe el mensaje **"No tienes permisos para esta acción"**, validado tanto en frontend como por respuesta 403 del backend.

<p align="center">
<img src="https://github.com/user-attachments/assets/51b3b73c-da41-4a8c-8197-b9ee59b1fa94" width="700">
</p>



### 7.3 Viajes — acceso de lectura completo

El auditor puede consultar el listado completo de viajes con todos sus datos (ruta, montos, distancia).

<p align="center">
<img src="https://github.com/user-attachments/assets/2c6a4e25-3676-4941-bd37-d1533164c330" width="700">
</p>

### 7.4 Seguridad — mismos datos que Admin

La sección de Seguridad muestra exactamente la misma información agregada que ve el administrador.

<p align="center">
<img src="https://github.com/user-attachments/assets/ecf75840-a8a3-4c50-a76c-f8523557d667" width="700">
</p>


### 7.5 Configuración — botones bloqueados

En la sección de Configuración del Sistema, los botones "Guardar configuración" y el formulario de "Registrar nuevo usuario" aparecen deshabilitados para el rol auditor.

<p align="center">
<img src="https://github.com/user-attachments/assets/77c6ed84-2051-4e2d-8f78-a04638fe6b66" width="700">
</p>


---
## 8. Creación de Usuarios (conductores, pasajeros, admin y auditores)
- En la sección de usuarios se puede crear a los usuarios dependiendo a su rol si van a ser administradores, auditores o pasajeros, de modo que cuando se hace la confirmación de registro este muestra con un ID, para ello, se le pide que coloque si nombre, correo y contraseña con la que pueda ingresar a la plataforma 

<p align="center">
<img src="https://github.com/user-attachments/assets/fcdf52ba-ebb0-4024-9097-cbe08afa29d2" width="700">
</p>

- En la sección de Fleet se puede realizar el registro de los datos del conductor y al igual que los otros roles se le piden que ingrese su nombre completo, correo y contraseña, pero para el caso del condcutor le pide que añada como datos adicionales los datos del perfil de auto, tales como la marca, el modelo, número de placa, capacidad, color, año y el tipo de combustible que utiliza.

<p align="center">
<img src="https://github.com/user-attachments/assets/bc91b8eb-e65b-4f5d-afa4-eb3f5de67a19" width="700">
</p>

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

