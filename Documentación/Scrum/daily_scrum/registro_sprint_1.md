
# Daily Scrum 01 – Sprint 1

## Proyecto
**Motor Tarifario Inteligente para inDrive en Lima Metropolitana**

**Sprint:** Sprint 1 
**Fecha:** 25/05/2026
**Duración:** 15 minutos  
**Modalidad:** Reunión virtual/presencial  

---

# Objetivo del Daily

Realizar seguimiento al avance del Sprint 1, identificar impedimentos técnicos y coordinar las actividades relacionadas con el desarrollo de la fase pre-viaje del sistema.

---

# Participantes

| Integrante | Rol |
|------------|------|
| Juan Diego| Backend |
| Luis Valenzuela | Data Base|
| Enrique Orozco| DevOps / Docker |
| Matias Dario | QA/ App |
| Nardy Condory| Documentación y Gestión |

---

# Evidencia de la Reunión

> Insertar aquí la fotografía o captura de pantalla de la reunión.

<div align="center">

![Daily Scrum 01](imgs/reuniondaily.jpeg)

*Figura 1. Reunión Daily Scrum del Sprint 1.*

</div>

---

# Avances Reportados

## Backend

### Actividades realizadas
- Definición de la arquitectura de microservicios con NestJS.
- Diseño inicial de endpoints para solicitudes de viaje.
- Inicio de integración con servicios externos.
- Estructuración del modelo de cálculo tarifario.

### Actividades siguientes
- Implementar integración con Google Maps.
- Implementar integración con OSINERGMIN.
- Desarrollar lógica de cálculo de rango tarifario.

### Impedimentos
- Pendiente validación de acceso a APIs externas.

---

## Frontend

### Actividades realizadas
- Diseño preliminar de interfaces móviles.
- Creación de prototipos para visualización de precios.
- Inicio de pruebas con React Native y Expo.

### Actividades siguientes
- Implementar visualización asimétrica.
- Construir flujo de negociación entre pasajero y conductor.
- Integrar mapas interactivos.

### Impedimentos
- Algunas pantallas presentan errores de renderizado y compatibilidad.

---

## DevOps / Docker

### Actividades realizadas
- Instalación y configuración de Docker Desktop.
- Creación del archivo `docker-compose.yml`.
- Configuración de variables de entorno mediante `.env`.
- Creación de una red privada Docker para comunicación entre servicios.
- Levantamiento exitoso de los contenedores:

| Servicio | Estado |
|-----------|---------|
| PostgreSQL | ✅ Activo |
| MongoDB | ✅ Activo |
| Redis | ✅ Activo |



### Actividades siguientes
- Implementar Health Checks.
- Agregar documentación técnica de despliegue.
- Preparar entorno para integración con Backend.

### Impedimentos
- Ninguno actualmente.

---

## QA

### Actividades realizadas
- Revisión inicial de historias de usuario.
- Definición preliminar de escenarios de prueba.

### Actividades siguientes
- Elaborar casos de prueba para Sprint 1.
- Validar flujo de negociación tarifaria.

### Impedimentos
- Esperando disponibilidad de funcionalidades implementadas.

---

# Resumen de Estado del Sprint

| Área | Estado |
|--------|---------|
| Backend | 🟡 En Progreso |
| Frontend | 🟡 En Progreso |
| Docker / Infraestructura | 🟢 Operativo |
| QA | 🟡 En Preparación |
| Documentación | 🟢 Actualizada |

---

# Riesgos Identificados

| Riesgo | Impacto | Acción |
|----------|----------|----------|
| Retraso en integración de APIs externas | Alto | Utilizar datos simulados temporalmente |
| Problemas de compatibilidad en interfaces móviles | Medio | Realizar pruebas tempranas |
| Cambios en requisitos funcionales | Medio | Validación continua con el Product Owner |

---

# Acuerdos de la Reunión

1. Mantener la arquitectura basada en microservicios.
2. Continuar utilizando Docker como entorno local unificado.
3. Backend trabajará inicialmente con datos simulados para acelerar el desarrollo.
4. Frontend continuará desarrollando interfaces mientras se estabilizan los servicios.
5. QA comenzará la construcción de casos de prueba para las historias del Sprint 1.

---

# Próximas Actividades

- Finalizar integración de APIs externas.
- Completar cálculo del rango tarifario.
- Implementar visualización asimétrica.
- Integrar Backend con bases de datos Dockerizadas.
- Continuar documentación técnica y funcional.

---

# Conclusión

Durante el Daily Scrum 01 se verificó que la infraestructura base del proyecto se encuentra operativa. El entorno Docker ya permite la ejecución local de PostgreSQL, MongoDB y Redis, mientras que los equipos de Backend y Frontend continúan desarrollando las funcionalidades asociadas a las historias de usuario del Sprint 1. No se identificaron bloqueos críticos para la continuidad del proyecto.
