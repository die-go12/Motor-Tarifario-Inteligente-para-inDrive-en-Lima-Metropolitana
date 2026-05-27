# 🚀 Motor Tarifario Inteligente

## 1. Introducción
El proyecto **Motor Tarifario Inteligente** es una solución de software diseñada bajo una arquitectura de microservicios orientada a eventos. El objetivo es optimizar la transparencia, equidad y eficiencia en el cálculo y la negociación de tarifas de transporte urbano dentro de Lima Metropolitana.

Para cumplir con los requerimientos prácticos de evaluación, el sistema está estructurado para ser ejecutado y controlado **de manera 100% local en una sola computadora**. Utilizando la orquestación de contenedores en la laptop, se simula el ecosistema transaccional y el comportamiento de una app de transporte genérica, omitiendo dependencias directas en la nube para facilitar la demostración ante el docente.

---

## 2. Participantes
* Nardy Liz Condori Mamani *(Scrum Master / Product Owner / QA Git Manager)*
* Enrique Alejandro Orosco Mendoza *(Developer)*
* Matias Dario Huerta Cruz *(Developer)*
* Luis Martin Valenzuela Valer *(Developer)*
* Juan Diego Lopez Vega *(Developer)*

---

## 3. ¿De qué trata el proyecto y por qué la solución?

### ¿De qué trata el proyecto?
El sistema plantea la integración de un motor de cálculo algorítmico que interviene en dos fases clave del servicio sin eliminar el modelo de negociación libre, sino acotándolo sobre límites objetivos:

* **Fase Pre-viaje:** El motor pondera internamente **7 variables críticas** (distancia por GPS, precio del combustible de OSINERGMIN, capacidad del vehículo, tráfico en tiempo real, hora del día, tiempo estimado e histórico interno) en menos de 5 segundos. Con esto, genera un rango cerrado denominado bajo los términos oficiales `[mínimo, máximo]`.
* **Visualización Asimétrica:** A través de componentes de frontend controlados por el rol del usuario, el sistema oculta el rango completo a los clientes móviles. El pasajero únicamente visualiza el límite máximo o "techo" ("Este viaje no te costará más de S/ X"), mientras que el conductor solo ve el límite mínimo o "piso" ("Este viaje te pagará al menos S/ Y").
* **Fase Post-viaje:** Al finalizar el trayecto, el motor recibe los datos reales del GPS y recalcula el precio exacto aplicando una regla matemática de negocio invariable:

$$\text{pago} = \max(\text{mínimo}, \min(\text{precio}_{real}, \text{máximo}))$$

### ¿Por qué esta solución?
1. **Eliminación del efecto de anclaje:** Si ambas partes vieran el rango completo desde el inicio, el pasajero ofertaría siempre el mínimo y el conductor exigiría el máximo, polarizando y trabando la negociación asistida. La asimetría visual distribuye la información estratégicamente para permitir acuerdos rápidos.
2. **Protección económica bilateral:** El conductor cuenta con la seguridad de que nunca cobrará menos del costo operativo mínimo garantizado (incluso ante imprevistos en la ruta), y el pasajero tiene la certeza de que jamás pagará más del techo acordado inicialmente.

---

## 4. Pasos Mapeados para la Ejecución
Para asegurar un desarrollo modular, el proyecto se divide en las siguientes etapas de trabajo:

### Paso 1: Infraestructura y Orquestación Local (DevOps & Git)
* Configurar el repositorio en GitHub y definir las políticas de ramificación e integración para los *Pull Requests*.
* Diseñar el archivo `docker-compose.yml` para levantar e intercomunicar simultáneamente 5 contenedores locales en la laptop: NestJS Base, NestJS Motor Tarifario, PostgreSQL, MongoDB y Redis.

### Paso 2: Desarrollo de la Plataforma Base (Backend Transaccional)
* Construir en Node.js + NestJS el microservicio encargado de la lógica transaccional común: gestión de perfiles, autenticación y la máquina de estados del trayecto (*Buscando, Asignado, En Curso, Finalizado*).
* Diseñar el esquema relacional en PostgreSQL para usuarios y vehículos, y configurar Redis para la persistencia intermedia de baja latencia en la asignación de viajes.

### Paso 3: Core Algorítmico y Trazabilidad (Backend Motor Tarifario)
* Desarrollar el microservicio independiente en NestJS especializado en la lógica matemática core (procesamiento de las 7 variables pre-viaje y regla de pago post-viaje).
* Configurar MongoDB local para almacenar el payload completo de auditoría y el histórico de viajes validados por el filtro de anomalías.

### Paso 4: Construcción de Interfaces y Control Asimétrico (Frontend)
* Desarrollar la app móvil única en React Native + TypeScript, integrando `react-native-maps` o Mapbox SDK para trazar rutas y renderizar el vehículo en movimiento.
* Implementar el Módulo Asimétrico en la app móvil para segmentar la visualización según el rol del usuario autenticado (pasajero ve techo / conductor ve piso).
* Construir el Panel Administrativo independiente en React + TypeScript para la consola del administrador, permitiendo configurar pesos, topes del multiplicador de tráfico (tope inicial x2.0 para Lima) y visualizar el rango completo.

### Paso 5: Ecosistema de Pruebas e Inyección Local (QA)
* Diseñar las colecciones de peticiones HTTP en **Thunder Client** directamente en VS Code para simular la inyección de datos de tráfico y combustible de las APIs externas hacia los microservicios locales.
* Escribir y ejecutar las pruebas unitarias automatizadas a través de GitHub Actions para validar que los cambios en las reglas algorítmicas no rompan la regla de pago antes de actualizar los contenedores locales.