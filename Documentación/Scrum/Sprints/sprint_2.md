# Sprint 2 – Desarrollo del MVP

## Índice del Sprint 2

> Punto de entrada único: desde aquí se navega a todos los documentos del sprint. Se distingue lo que es **Scrum oficial** (Guía 2020) de las **prácticas complementarias**.

### Artefactos de Scrum (Guía 2020)
- [Product Backlog](../../Requerimientos/Product_backlog.md)
- [Sprint Backlog](../../Requerimientos/sprint_backlog.md)
- Incremento: el sistema funcionando + este documento

### Eventos de Scrum
- [Daily Scrum](../DailyScrum/registro_sprint_2.md)
- [Sprint Retrospective](../Retrospectivas/retrospective2.md) (resumen en la sección 12)

### Documentos de Ingeniería de Software (complementarios)
- [Historias de Usuario](../../Requerimientos/Historias_usuario.md)
- [Arquitectura general](../../Aquitectura/Arquitectura_general.md)
- [Decisiones arquitectónicas (ADR)](../../Aquitectura/decisiones_arquitectonicas.md)
- [Stack tecnológico](../../Aquitectura/Stack_Tecnologico.md)
- [Negocio / 7 variables](../../Negocio/flujo_calculo_tarifa.md)
- [Pruebas del sistema](../Pruebas/pruebas_sistema.md)

### Métricas (complementarias)
- Velocity y Burndown: sección 10 de este documento

---

## 1. Información general

- **Proyecto:** Motor Tarifario Inteligente para inDrive en Lima Metropolitana
- **Sprint:** 2
- **Período:** lunes 1 → sábado 20 de junio de 2026 (cierre y retrospectiva: sábado 20)
- **Objetivo del sprint:** consolidar el MVP integrando backend, panel administrativo y aplicación móvil, con el cálculo tarifario, la visualización diferenciada por rol y el registro de los cálculos.

---

## 2. Continuidad con el Sprint 1

El Sprint 1 cerró con su presentación el **sábado 30 de mayo**. El Sprint 2 inició el **lunes 1 de junio**, de forma continua. Durante las primeras fases el avance fue principalmente **local** (cada integrante en su equipo) y se **consolidó en el repositorio de forma progresiva** hacia el cierre del sprint.

---

## 3. Sprint Goal

Entregar una versión funcional e integrada del sistema en la que un pasajero ve la tarifa máxima estimada, un conductor ve el ingreso mínimo garantizado, el administrador puede parametrizar y simular el motor, y cada cálculo queda registrado para auditoría.

---

## 4. Gestión del Product Backlog y priorización

### Product Backlog vs. Sprint Backlog

- **Product Backlog:** lista priorizada de todo lo que el producto necesita (las CAR / historias de usuario US-001…US-008), ordenada por valor. Es vivo y se refina cada sprint.
- **Sprint Backlog:** subconjunto del Product Backlog que el equipo se compromete a entregar en este sprint, más el plan (tareas) para lograrlo. El Sprint 2 toma las historias **US-005 a US-008** (fase post-viaje + administración).

### Criterio de priorización: MoSCoW

Se prioriza con **MoSCoW** (Must / Should / Could / Won't). Para asignar la categoría se consideran tres factores: **valor para el diferencial del producto**, **dependencia técnica** y **riesgo**.

| Ítem del Sprint 2 | SP | MoSCoW | Justificación |
| --- | --- | --- | --- |
| Integración del MVP a `main` (móvil + panel + Docker) | — | Must | Sin integración no hay demo end-to-end; cierra el carryover del Sprint 1 |
| US-006 Regla de pago invariante | 5 | Must | Núcleo del post-viaje; protección bilateral (el diferencial del producto) |
| US-005 Recálculo post-viaje | 5 | Must | Habilita la liquidación con el precio real del servicio |
| US-007 Configuración desde el panel admin | 3 | Should | Operación: ajustar el motor en caliente sin redesplegar |
| US-008 Reportes y métricas | 5 | Could | Control y toma de decisiones; entregado como resumen agregado |
| GPS real, APIs externas en vivo, RabbitMQ, OpenSearch, MFA | — | Won't (este sprint) | Fuera de alcance consciente → roadmap (§13) |

> Las historias **US-001 a US-004** (fase pre-viaje: cálculo del rango, visualización asimétrica, negociación y aceptación bilateral) corresponden al **Sprint 1**; en el Sprint 2 se integraron a `main` (ver §6) y se demuestran como base del flujo end-to-end.

---

## 5. Historias de usuario del Sprint 2

> Cada historia incluye sus **criterios de aceptación** y **dónde se demuestra** en el sistema. Definición completa en [Historias de Usuario](../../Requerimientos/Historias_usuario.md).

### US-005 — Recálculo post-viaje
*Como sistema, quiero capturar la ejecución real del viaje para recalcular el `precio_real` al finalizar.*

| Criterio de aceptación | Dónde se demuestra |
| --- | --- |
| Al finalizar el viaje se obtiene un `precio_real` del servicio | App (fin de viaje) → `ms-pricing /settle` |
| El recálculo alimenta la regla de pago | El `precio_real` entra a la liquidación (US-006) |

> **Alcance ajustado por gestión de cambio:** el recálculo con **GPS real** se reemplazó por el **precio real ingresado** por el conductor (infraestructura GPS no disponible en el MVP). El recálculo con GPS real queda en el roadmap (§13). Ver [Gestión de Cambio — Cambio 3](../../Presentacion_Final/gestion_de_cambio.md).

### US-006 — Regla de pago invariante
*Como sistema, quiero aplicar `pago = max(mínimo, min(precio_real, máximo))` para proteger bilateralmente a pasajero y conductor.*

| Criterio de aceptación | Dónde se demuestra |
| --- | --- |
| Si `precio_real < mínimo` → paga mínimo (protege al conductor) | `ms-pricing /settle` |
| Si `precio_real` en rango → paga el precio real | `ms-pricing /settle` |
| Si `precio_real > máximo` → paga máximo (protege al pasajero) | `ms-pricing /settle` |
| Cada parte ve solo su límite garantizado en la liquidación | Liquidación asimétrica por rol en la app |
| El `precio_real` (no el monto pagado) se envía al filtro de anomalías | Evento → MongoDB (`anomaly_logs`) |

### US-007 — Configuración de parámetros desde el panel admin
*Como administrador, quiero configurar los pesos, el multiplicador de tráfico y los umbrales de anomalías para ajustar el motor sin desplegar código.*

| Criterio de aceptación | Dónde se demuestra |
| --- | --- |
| El admin edita parámetros y se persisten; la siguiente cotización lo refleja | Panel → `GET/PUT /pricing/config` |
| El admin modifica los umbrales del filtro de anomalías (CA-007-03) | Panel → sección Pricing (umbrales) |
| Solo el rol admin puede escribir (otros → 403) | Guard de rol |
| El admin ajusta oferta/demanda en el simulador y ve el rango cambiar | Panel → Simulador (§9) |

### US-008 — Reportes y métricas
*Como administrador, quiero visualizar reportes y métricas para tomar decisiones sobre el motor y el sistema.*

| Criterio de aceptación | Dónde se demuestra |
| --- | --- |
| El sistema genera un resumen de viajes, ingresos y anomalías | Panel → `GET /reports/summary` (admin/auditor) |
| El admin consulta todos los viajes con filtros | Panel → `GET /trips/all` (admin) |
| Cada cálculo y liquidación queda registrado para auditoría | MongoDB `pricing_logs` / `pricing_history` / `anomaly_logs` |

> **Alcance ajustado:** los **reportes avanzados** (desglose por zona y franja horaria, tiempos, filtros por fecha) quedan en el roadmap (§13); en este sprint se entrega el **resumen agregado** vía `ms-reports`.

---

## 6. Carryover desde el Sprint 1

Al cierre del Sprint 1, el panel administrativo y la aplicación móvil estaban en sus ramas (no integrados a `main`). En el Sprint 2 se realizó esa integración:

- Integración del **panel administrativo** a `main`.
- Integración de la **aplicación móvil** a `main`.
- Integración de la **contenerización (Docker)** a `main`.

---

## 7. Tareas del Sprint (por historia)

> Estado: ✅ Hecho · 🟡 En curso · ⚪ Pendiente.

### US-005 / US-006 — Post-viaje y regla de pago
| Tarea | Estado |
| --- | --- |
| Liquidación `pago = max(mínimo, min(precio_real, máximo))` en `ms-pricing` | ✅ |
| Persistencia del pago al completar el viaje | ✅ |
| Liquidación asimétrica por rol (cada uno ve solo su límite garantizado) | ✅ |
| Captura del precio real desde la app | ✅ |

### US-007 — Configuración / simulación
| Tarea | Estado |
| --- | --- |
| Editor de configuración (`/pricing/config`) | ✅ |
| Umbrales de anomalías configurables (CA-007-03) | ✅ |
| Simulador con controles de oferta/demanda | ✅ |
### US-008 — Reportes y auditoría

| Tarea | Estado |
| --- | --- |
| Microservicio `ms-reports` (read-model por eventos Redis Pub/Sub) | ✅ |
| `GET /reports/summary` (admin/auditor) + `GET /trips/all` (admin) | ✅ |
| Persistencia de cálculos y anomalías en MongoDB por eventos | ✅ |
| Acceso de solo lectura para el rol auditor | ✅ |
| Reportes avanzados (zona/franja horaria, tiempos, filtros) | ⚪ (roadmap §13) |

### Soporte al motor (habilitadores)
| Tarea | Estado |
| --- | --- |
| Precios de combustible por tipo (dataset OSINERGMIN local) | ✅ |
| Spread mínimo garantizado del rango (evita rango de ancho cero) | ✅ |
| Pruebas del motor por rol y de la regla de pago | 🟡 |

---

## 8. Fuentes de datos (real vs. simulado)

| Fuente | Modo | Detalle |
| --- | --- | --- |
| Google Maps | En vivo | distancia, ruta, búsqueda de destino |
| OSINERGMIN (combustible) | Dato real local | dataset oficial (Datos Abiertos/Facilito); no hay API pública en tiempo real |
| Tráfico | Simulado | modelo por hora/zona |
| Capacidad, hora/demanda, histórico | Interno | perfil del vehículo y base de datos |

---

## 9. Simulador de oferta/demanda (US-007)

El panel administrativo incorpora un **simulador** con controles de **oferta** y **demanda**. Estos controles ajustan el **factor dinámico** que el motor ya usa (hora/demanda) y permiten visualizar en vivo cómo varía el rango, siempre respetando el tope ×2.0.

- Las 7 variables del motor **no cambian**: oferta/demanda son controles del simulador, no variables nuevas del motor.
- El **surge real en tiempo real** (basado en conductores online vs. viajes en búsqueda) queda como **trabajo futuro**.

---

## 10. Métricas Scrum

### Velocity (puntos de historia por sprint)
| Sprint | Comprometidos (SP) | Completados (SP) |
| --- | --- | --- |
| Sprint 1 (US-001…US-004) | 16 | 16 |
| Sprint 2 (US-005…US-008) | 18 | 18 |

**Velocity promedio: 17 SP/sprint.** Las historias US-005 y US-008 se cerraron con **alcance ajustado** (GPS real y reportes avanzados → roadmap, vía gestión de cambio); su valor central se entregó.

### Puntos por historia (Sprint 2)
| US | Story Points | Estado |
| --- | --- | --- |
| US-005 Recálculo post-viaje | 5 | ✅ (alcance ajustado: precio ingresado) |
| US-006 Regla de pago invariante | 5 | ✅ |
| US-007 Configuración desde panel | 3 | ✅ |
| US-008 Reportes y métricas | 5 | ✅ (resumen agregado; avanzados → roadmap) |

### Burndown (SP restantes por semana)
| Hito del sprint | SP restantes (ideal) | SP restantes (real) |
| --- | --- | --- |
| Inicio (Semana 1) | 18 | 18 |
| Fin Semana 1 | 12 | 16 |
| Fin Semana 2 | 6 | 11 |
| Cierre (Semana 3) | 0 | 0 |

> La línea **real** se mantuvo por encima de la ideal porque el avance fue principalmente local y la integración a `main` se concentró hacia el cierre del sprint (lección registrada en §12).

### Historias pendientes / diferidas a roadmap
| Ítem | Estado | Motivo | Destino |
| --- | --- | --- | --- |
| Recálculo con GPS real (parte de US-005) | Diferido | Infraestructura GPS no disponible en el MVP | Roadmap §13 |
| Reportes avanzados por zona/franja (parte de US-008) | Diferido | Alcance y tiempo del MVP | Roadmap §13 |

---

## 11. Riesgos identificados

| Riesgo | Probabilidad | Impacto | Mitigación | Estado |
| --- | --- | --- | --- | --- |
| Dependencia de APIs externas (combustible/tráfico/Maps) | Media | Alto | Modo simulado + dato real local; circuit breaker (CAR-010) | Mitigado |
| Divergencia entre ramas de larga vida | Alta | Medio | Sincronización frecuente con `main` y PRs revisados | Mitigado |
| Inconsistencia en el cálculo tarifario (rango inválido) | Media | Alto | Topes (×2.0, S/3–150) + spread mínimo del rango + pruebas del motor | Mitigado |
| Diferencias de entorno entre desarrolladores (`.env` / `HOST_IP`) | Alta | Medio | Variables por entorno, guía de configuración y Docker | Mitigado |
| Integración móvil ↔ backend concentrada al cierre | Media | Medio | Contratos de API definidos y pruebas por rol | Controlado |

---

## 12. Retrospectiva y lecciones aprendidas

> Resumen de la sesión de Retrospective del cierre del sprint. Detalle en [retrospective2.md](../Retrospectivas/retrospective2.md).

**Qué salió bien:** la distribución de tareas por microservicio facilitó el avance en paralelo; la comunicación constante mediante reuniones periódicas; Docker simplificó la configuración del entorno; el motor tarifario quedó funcional e integrado.

**Qué se puede mejorar:** la integración entre la app móvil y los microservicios requirió ajustes adicionales; la configuración de variables de entorno generó diferencias entre equipos; los contratos entre servicios se afinaron tarde.

**Acciones de mejora:** incrementar la cobertura de pruebas; documentar los contratos de API desde etapas tempranas; estandarizar los entornos mediante contenedores; automatizar validaciones en el flujo de integración continua.

**Lecciones aprendidas:** documentar la configuración inicial reduce errores de integración; definir contratos de API temprano agiliza el desarrollo; mantener dailies cortos y frecuentes mejora la coordinación; integrar de forma continua (no al cierre) suaviza el burndown.

---

## 13. Trabajo futuro / no entregado (no hay Sprint 3)

Por ser el último sprint del curso, lo no entregado se documenta como roadmap, no como carryover:

- Integración **en vivo** con API real de OSINERGMIN (hoy: dataset local).
- API de **tráfico real** (TomTom/Waze) — de pago.
- **Recálculo con GPS real** post-viaje (hoy: precio real ingresado).
- **Pagos reales**.
- **Surge pricing real** (oferta/demanda en tiempo real).
- **Reportes avanzados** (US-008): desglose por zona y franja horaria, tiempos de viaje y filtros por fecha/zona en `ms-reports` (hoy: resumen agregado vía `GET /reports/summary`).
- Migración del **bus de eventos** de **Redis Pub/Sub** (actual) a **RabbitMQ**; **OpenSearch** para logs; **MFA** del administrador.

---

## 14. Definición de Terminado (Definition of Done)

- Código implementado y versionado en GitHub.
- Funcionalidades probadas en entorno local.
- Documentación actualizada.
- Revisión y aprobación del equipo (PR).

---

## 15. Evidencias

> Capturas de los flujos del sistema funcionando, recopiladas en el apartado de presentación.

- **Panel administrativo** (configuración, simulador, auditoría de anomalías, reportes y modo auditor de solo lectura) → [Pruebas_Panel_Admin.md](../../Presentacion_Final/pruebas/Pruebas_Panel_Admin.md).
- **Aplicación móvil** (flujos de pasajero y conductor) → [Pruebas_App_Movil.md](../../Presentacion_Final/pruebas/Pruebas_App_Movil.md).
- **Reunión del sprint** → ver sección "Reunión de Sprint" más abajo.

---

## 16. Cierre / Sprint Review final

Por ser el último sprint, el cierre consolida:

- **Objetivo de Producto:** flujo end-to-end logrado (pre-viaje, negociación, post-viaje con regla de pago, parametrización y auditoría) con las salvedades de alcance documentadas en §13.
- **Entregado vs. pendiente:** ver secciones 7 y 13.
- **Trabajo futuro:** ver sección 13.
- **Lecciones aprendidas:** ver sección 12.

---

## Reunión de Sprint

> Evidencia fotográfica de la reunión del Sprint 2.

![Evidencia de Reunión](../imgs/evidencia.jpeg)
<img width="1512" height="795" alt="image" src="https://github.com/user-attachments/assets/81dfcae0-2672-42ce-93d2-75568e305fe9" />


### Participantes

- Matias Dario
- Nardy Condori
- Juan Diego Lopez
- Enrique Orozco
- Luis Valenzela

### Acuerdos

- Revisar el avance del motor tarifario al cierre del sprint.
- Priorizar la integración entre la aplicación móvil y el backend.
- Registrar incidencias y bloqueos durante las reuniones diarias.
