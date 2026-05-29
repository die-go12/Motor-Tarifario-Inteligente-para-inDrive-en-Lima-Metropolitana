# Motor Tarifario Inteligente

<p align="center">
  <strong>Pricing Engine inteligente para una negociación justa y transparente en movilidad urbana</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Estado-En%20desarrollo-yellow" />
  <img src="https://img.shields.io/badge/Metodología-Scrum-blue" />
  <img src="https://img.shields.io/badge/Arquitectura-Microservicios-purple" />
  <img src="https://img.shields.io/badge/Backend-NestJS-red" />
  <img src="https://img.shields.io/badge/Frontend-React%20Native%20%7C%20React-orange" />
  <img src="https://img.shields.io/badge/Base%20de%20datos-PostgreSQL%20%7C%20MongoDB%20%7C%20Redis-green" />
  <img src="https://img.shields.io/badge/Infraestructura-Docker-brightgreen" />
</p>

---

## Descripción

<p align="justify">
<strong>Motor Tarifario Inteligente</strong> es una solución diseñada para optimizar el cálculo y la negociación de tarifas dentro de plataformas de movilidad urbana como inDrive. El sistema permite estimar un rango tarifario antes del inicio del viaje considerando múltiples variables operativas y contextuales, facilitando una negociación más equilibrada entre pasajero y conductor dentro de límites establecidos a partir de datos reales.
</p>

<p align="justify">
Además, incorpora una lógica de visualización diferenciada según el rol del usuario. Mientras el pasajero visualiza el precio máximo estimado del trayecto, el conductor accede al ingreso mínimo garantizado. Una vez finalizado el viaje, el sistema recalcula el precio final utilizando la información real del recorrido y aplica una regla de protección económica bilateral orientada a brindar mayor transparencia y equilibrio para ambas partes.
</p>

<p align="justify">
Este repositorio corresponde al desarrollo del proyecto académico del curso de <strong>Ingeniería de Software</strong>, elaborado bajo la metodología <strong>Scrum</strong> e iniciado con <strong>Sprint 0</strong> como etapa de preparación, organización y planificación técnica. Durante esta fase se definieron los objetivos del producto, el alcance inicial del MVP, la estructura del equipo y la base técnica necesaria para el desarrollo del sistema.
</p>

---

## Tabla de contenidos

* [Objetivo del producto](#objetivo-del-producto)
* [Funcionalidades principales](#funcionalidades-principales)
* [Alcance MVP](#alcance-mvp)
* [Tecnologías utilizadas](#tecnologías-utilizadas)
* [Arquitectura general](#arquitectura-general)
* [Estructura del proyecto](#estructura-del-proyecto)
* [Documentación Scrum](#documentación-scrum)
* [Planificación Scrum](#planificación-scrum)
* [Equipo](#equipo)

---

## Objetivo del producto

<p align="justify">
Desarrollar un motor tarifario inteligente capaz de calcular tarifas más justas, dinámicas y transparentes dentro de una plataforma de transporte urbano, mejorando la experiencia de negociación entre pasajero y conductor sin eliminar el modelo actual de oferta libre.
</p>

---

## Funcionalidades principales

* Cálculo de rango tarifario pre-viaje `[mínimo, máximo]`
* Procesamiento de variables tarifarias
* Visualización asimétrica según rol
* Negociación asistida entre pasajero y conductor
* Recalculo tarifario post-viaje
* Regla automática de pago protegido
* Registro histórico y trazabilidad de cálculos
* Validación de anomalías
* Panel administrativo configurable
* Integración con APIs externas para mapas, tráfico y contexto operativo

---

## Alcance MVP

### Incluye

* Plataforma base simulada de transporte
* Motor tarifario independiente
* Cálculo pre-viaje
* Cálculo post-viaje
* Regla automática de pago
* Visualización diferenciada pasajero / conductor
* Panel administrativo web
* Persistencia local en base de datos
* Simulación local de APIs externas
* Despliegue mediante Docker

### No incluye

* Despliegue real en producción
* Integración oficial con inDrive
* Pagos reales dentro de la aplicación
* Geolocalización productiva en tiempo real
* Consumo de APIs comerciales externas en entorno real

---

## Tecnologías utilizadas

| Área          |                 Tecnología | Uso                           |
| ------------- | -------------------------: | ----------------------------- |
| App móvil     |  React Native + TypeScript | Interfaz pasajero y conductor |
| Panel Web     |         React + TypeScript | Configuración administrativa  |
| Backend       |           Node.js + NestJS | Microservicios                |
| Base de datos |                 PostgreSQL | Usuarios, viajes y vehículos  |
| Base de datos |                    MongoDB | Auditoría e histórico         |
| Cache         |                      Redis | Estado temporal del viaje     |
| Mapas         | Mapbox / react-native-maps | Visualización de rutas        |
| Contenedores  |             Docker Compose | Orquestación local            |
| Testing API   |   Postman / Thunder Client | Validación y pruebas          |
| Versionado    |               Git + GitHub | Gestión del proyecto          |
| CI/CD         |             GitHub Actions | Automatización                |

---

## Arquitectura general

<p align="justify">
El sistema se divide en dos componentes principales: una plataforma base encargada de simular el ecosistema general de transporte y un motor tarifario inteligente responsable del procesamiento, cálculo y validación del rango tarifario antes y después del viaje.
</p>

### Plataforma Base

* Autenticación
* Gestión de perfiles
* Solicitud del viaje
* Estados del trayecto
* Asignación de conductor

### Motor Tarifario Inteligente

* Evaluación de variables
* Generación del rango `[mínimo, máximo]`
* Lógica de visualización diferenciada
* Cálculo del precio final
* Auditoría y trazabilidad histórica

---

## Estructura del proyecto

```bash
motor-tarifario-inteligente/
│
├── Documentación/
│   │
│   ├── Arquitectura/
│   │   ├── Arquitectura_general.md
│   │   ├── Stack_Tecnologico.md
│   │   └── decisiones_arquitectonicas.md
│   │
│   ├── Negocio/
│   │   ├── flujo_calculo_tarifa.md
│   │   ├── reglas_tarifarias.md
│   │   └── variables_tarifa.md
│   │
│   ├── Requerimientos/
│   │   ├── Criterios_aceptacion.md
│   │   ├── Historias_usuario.md
│   │   ├── Product_backlog.md
│   │   └── sprint_backlog.md
│   │
│   └── Scrum/
│       ├── daily_scrum/
│       │   ├── registro_sprint_1.md
│       │   └── registro_sprint_2.md
│       │
│       ├── retrospective.md
│       ├── sprint_0.md
│       ├── sprint_1.md
│       ├── sprint_2.md
│       ├── sprint_review.md
│       └── README.md
│
├── indrive-plus/
│   │
│   ├── database/
│   │   ├── mongodb/
│   │   │   └── collections.md
│   │   ├── postgresql/
│   │   │   ├── listado_funciones.txt
│   │   │   └── schema.sql
│   │   ├── redis/
│   │   │   └── redis_structure.md
│   │   └── README.md
│   │
│   ├── mobile-app/
│   ├── admin-panel/
│   ├── services/
│   │   ├── platform-base/
│   │   └── pricing-engine/
│   │
│   ├── tests/
│   ├── docker-compose.yml
│   └── README.md
│
└── README.md
```

---

## Documentación Scrum

* [Sprint 0](Documentación/Scrum/sprint_0.md)
* [Sprint 1](Documentación/Scrum/sprint_1.md)
* [Sprint 2](Documentación/Scrum/sprint_2.md)
* [Historias de Usuario](Documentación/Requerimientos/Historias_usuario.md)
* [Product Backlog](Documentación/Requerimientos/Product_backlog.md)
* [Sprint Backlog](Documentación/Requerimientos/sprint_backlog.md)
* [Arquitectura Base](Documentación/Arquitectura/Arquitectura_general.md)
* [Stack Tecnológico](Documentación/Aquitectura/Stack_Tecnologico.md)

---
## Planificación Scrum

<p align="justify">
El desarrollo del proyecto se organiza bajo la metodología <strong>Scrum</strong>, mediante iteraciones cortas llamadas <strong>Sprints</strong>. Cada sprint tiene objetivos definidos, entregables concretos y actividades orientadas al desarrollo incremental del producto.
</p>

| Sprint       | Objetivo                                         | Actividades principales                                                                                                                                                             | Entregables                                                                                      |
| ------------ | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Sprint 0** | Preparación y planificación inicial del proyecto | Definición del problema, visión del producto, alcance del MVP, organización del equipo, creación del repositorio, definición de arquitectura base y elaboración del Product Backlog | Product Backlog, documentación inicial, estructura del repositorio y planificación general       |
| **Sprint 1** | Desarrollo inicial del sistema                   | Configuración técnica del entorno, implementación de estructura base del proyecto, desarrollo de funcionalidades principales y avance de componentes iniciales                      | Primer avance funcional del sistema y estructura técnica operativa                               |
| **Sprint 2** | Integración y consolidación funcional            | Integración de componentes desarrollados, validación funcional, ajustes técnicos, revisión del avance y documentación complementaria                                                | Integración funcional del sistema, evidencias del sprint y consolidación del avance del producto |

---

## Equipo

| Integrante                       |                               Rol |
| -------------------------------- | --------------------------------: |
| Nardy Liz Condori Mamani         | Scrum Master / Product Owner / QA |
| Enrique Alejandro Orosco Mendoza |                         Developer |
| Matias Dario Huerta Cruz         |                         Developer |
| Luis Martin Valenzuela Valer     |                         Developer |
| Juan Diego Lopez Vega            |                         Developer |

---

## Licencia

<p align="justify">
Proyecto académico desarrollado para el curso de Ingeniería de Software.
</p>
