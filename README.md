# 🚀 Motor Tarifario Inteligente

## 1. Introducción
[cite_start]El proyecto **Motor Tarifario Inteligente** es una solución de software diseñada bajo una arquitectura de microservicios orientada a eventos[cite: 42, 183]. [cite_start]El objetivo es optimizar la transparencia, equidad y eficiencia en el cálculo y la negociación de tarifas de transporte urbano dentro de Lima Metropolitana[cite: 45, 46, 47].

[cite_start]Para cumplir con los requerimientos prácticos de evaluación, el sistema está estructurado para ser ejecutado y controlado **de manera 100% local en una sola computadora**[cite: 6, 36, 37]. [cite_start]Utilizando la orquestación de contenedores en la laptop, se simula el ecosistema transaccional y el comportamiento de una app de transporte genérica, omitiendo dependencias directas en la nube para facilitar la demostración ante el docente[cite: 5, 6, 37, 38].

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
[cite_start]El sistema plantea la integración de un motor de cálculo algorítmico que interviene en dos fases clave del servicio sin eliminar el modelo de negociación libre, sino acotándolo sobre límites objetivos[cite: 45, 53, 90, 187]:

* [cite_start]**Fase Pre-viaje:** El motor pondera internamente **7 variables críticas** (distancia por GPS, precio del combustible de OSINERGMIN, capacidad del vehículo, tráfico en tiempo real, hora del día, tiempo estimado e histórico interno) en menos de 5 segundos[cite: 33, 91, 96, 97, 113, 203, 215]. [cite_start]Con esto, genera un rango cerrado denominado bajo los términos oficiales `[mínimo, máximo]`[cite: 89, 186, 205].
* [cite_start]**Visualización Asimétrica:** A través de componentes de frontend controlados por el rol del usuario, el sistema oculta el rango completo a los clientes móviles[cite: 30, 190, 193, 207]. [cite_start]El pasajero únicamente visualiza el límite máximo o "techo" ("Este viaje no te costará más de S/ X") [cite: 191][cite_start], mientras que el conductor solo ve el límite mínimo o "piso" ("Este viaje te pagará al menos S/ Y")[cite: 192].
* [cite_start]**Fase Post-viaje:** Al finalizar el trayecto, el motor recibe los datos reales del GPS y recalcula el precio exacto aplicando una regla matemática de negocio invariable[cite: 93, 144, 145, 196, 197, 210]:

$$\text{pago} = \max(\text{mínimo}, \min(\text{precio\_real}, \text{máximo}))$$

### ¿Por qué esta solución?
1. [cite_start]**Eliminación del efecto de anclaje:** Si ambas partes vieran el rango completo desde el inicio, el pasajero ofertaría siempre el mínimo y el conductor exigiría el máximo, polarizando y trabando la negociación asistida[cite: 194, 219]. [cite_start]La asimetría visual distribuye la información estratégicamente para permitir acuerdos rápidos[cite: 194, 195].
2. [cite_start]**Protección económica bilateral:** El conductor cuenta con la seguridad de que nunca cobrará menos del costo operativo mínimo garantizado (incluso ante imprevistos en la ruta) [cite: 99, 100, 199][cite_start], y el pasajero tiene la certeza de que jamás pagará más del techo acordado inicialmente[cite: 101, 201].

---

## 4. Pasos Mapeados para la Ejecución
Para asegurar un desarrollo modular, el proyecto se divide en las siguientes etapas de trabajo:

### Paso 1: Infraestructura y Orquestación Local (DevOps & Git)
* [cite_start]Configurar el repositorio en GitHub y definir las políticas de ramificación e integración para los *Pull Requests*[cite: 21].
* [cite_start]Diseñar el archivo `docker-compose.yml` para levantar e intercomunicar simultáneamente 5 contenedores locales en la laptop: NestJS Base, NestJS Motor Tarifario, PostgreSQL, MongoDB y Redis[cite: 38].

### Paso 2: Desarrollo de la Plataforma Base (Backend Transaccional)
* [cite_start]Construir en Node.js + NestJS el microservicio encargado de la lógica transaccional común: gestión de perfiles, autenticación y la máquina de estados del trayecto (*Buscando, Asignado, En Curso, Finalizado*)[cite: 15, 16].
* [cite_start]Diseñar el esquema relacional en PostgreSQL para usuarios y vehículos [cite: 17][cite_start], y configurar Redis para la persistencia intermedia de baja latencia en la asignación de viajes[cite: 18, 19].

### Paso 3: Core Algorítmico y Trawabilidad (Backend Motor Tarifario)
* [cite_start]Desarrollar el microservicio independiente en NestJS especializado en la lógica matemática core (procesamiento de las 7 variables pre-viaje y regla de pago post-viaje)[cite: 32, 33].
* [cite_start]Configurar MongoDB local para almacenar el payload completo de auditoría y el histórico de viajes validados por el filtro de anomalías[cite: 34, 35, 222, 225].

### Paso 4: Construcción de Interfaces y Control Asimétrico (Frontend)
* [cite_start]Desarrollar la app móvil única en React Native + TypeScript [cite: 11][cite_start], integrando `react-native-maps` o Mapbox SDK para trazar rutas y renderizar el vehículo en movimiento[cite: 8, 9].
* [cite_start]Implementar el Módulo Asimétrico en la app móvil para segmentar la visualización según el rol del usuario autenticado (pasajero ve techo / conductor ve piso)[cite: 29, 30].
* [cite_start]Construir el Panel Administrativo independiente en React + TypeScript para la consola del administrador, permitiendo configurar pesos, topes del multiplicador de tráfico (tope inicial x2.0 para Lima) y visualizar el rango completo[cite: 27, 28, 208].

### Paso 5: Ecosistema de Pruebas e Inyección Local (QA)
* [cite_start]Diseñar las colecciones de peticiones HTTP en **Thunder Client** directamente en VS Code para simular la inyección de datos de tráfico y combustible de las APIs externas hacia los microservicios locales[cite: 39].
* [cite_start]Escribir y ejecutar las pruebas unitarias automatizadas a través de GitHub Actions para validar que los cambios en las reglas algorítmicas no rompan la regla de pago antes de actualizar los contenedores locales[cite: 40].