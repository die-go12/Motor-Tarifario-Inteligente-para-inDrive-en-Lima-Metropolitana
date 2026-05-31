# Sprint Planning – Sprint 1: Fase Pre-Viaje

## Información General

| Elemento | Descripción |
|----------|-------------|
| Proyecto | Motor Tarifario Inteligente para inDrive en Lima Metropolitana |
| Sprint | Sprint 1 |
| Duración | 2 semanas |
| Metodología | Scrum |

---

## Sprint Goal

Implementar la fase Pre-Viaje del sistema permitiendo que el pasajero solicite un viaje, el Motor Tarifario calcule un rango de precio inteligente basado en variables externas, se visualice de forma asimétrica para pasajero y conductor, se permita la negociación dentro de límites controlados y se habilite la aceptación bilateral para iniciar el viaje.

---

## 📋 Historias de Usuario del Sprint

| ID | Historia | Prioridad |
|----|----------|-----------|
| US-001 | Solicitud de viaje con cálculo de rango | Alta |
| US-002 | Visualización asimétrica del precio | Alta |
| US-003 | Negociación acotada dentro del rango | Alta |
| US-004 | Aceptación bilateral e inicio de viaje | Alta |

---

## Sprint Backlog (Resumen Planificado)

### US-001 – Solicitud de viaje con cálculo de rango
**Objetivo:** Generar un rango tarifario en menos de 5 segundos.

**Tareas:**
- Endpoint de solicitud de viaje
- Integración Google Maps (distancia y tiempo estimado)
- Integración OSINERGMIN (precio de combustible)
- Integración API de tráfico en tiempo real
- Implementación del algoritmo de cálculo de rango
- Manejo de fallos en servicios externos (degradación elegante)
- Pruebas unitarias e integración

---

### US-002 – Visualización asimétrica del precio
**Objetivo:** Mostrar información distinta según el rol del usuario.

**Tareas:**
- Vista pasajero (solo muestra el valor máximo)
- Vista conductor (solo muestra el valor mínimo)
- Vista administrador (visualiza rango completo)
- Control de acceso por roles
- Pruebas de seguridad y autorización

---

### US-003 – Negociación acotada dentro del rango
**Objetivo:** Permitir negociación controlada dentro del rango tarifario.

**Tareas:**
- Endpoint de ofertas y contraofertas
- Validación de ofertas dentro del rango permitido
- Interfaz de negociación en tiempo real
- Registro de ofertas (trazabilidad)
- Gestión de contraofertas
- Pruebas de validación de límites

---

### US-004 – Aceptación bilateral e inicio de viaje
**Objetivo:** Formalizar el inicio del viaje mediante aceptación de ambas partes.

**Tareas:**
- Endpoint de aceptación bilateral
- Máquina de estados del viaje
- Registro de aceptación con timestamp
- Sistema de notificaciones
- Cambio de estado a “En curso”
- Activación de captura GPS
- Pruebas de flujo completo end-to-end

---

## Definition of Done (DoD)

Una historia se considera terminada cuando:

- Código implementado y funcional
- Pull Request aprobado
- Pruebas unitarias ejecutadas
- Pruebas de integración ejecutadas
- Criterios de aceptación cumplidos
- Documentación técnica actualizada
- Desplegado en entorno de desarrollo

---

## Resultado Esperado

Al finalizar el Sprint 1 el sistema permitirá:

- Solicitar un viaje
- Calcular un rango tarifario inteligente
- Mostrar precios de forma asimétrica según rol
- Negociar dentro de límites controlados
- Formalizar aceptación bilateral del viaje
- Iniciar el viaje en estado “En curso”
