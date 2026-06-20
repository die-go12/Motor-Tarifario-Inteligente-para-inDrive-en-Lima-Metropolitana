# Retroespective – Sprint 2

## Aspectos positivos

- Se logró avanzar en la implementación del MVP según la planificación establecida.
- La arquitectura basada en microservicios facilitó la distribución de tareas.
- El uso de Docker simplificó la configuración del entorno de desarrollo.
- Se mantuvo una comunicación constante entre los integrantes del equipo.

---

## Dificultades encontradas

- La integración entre la aplicación móvil y los microservicios presentó ajustes adicionales.
- La configuración de variables de entorno generó diferencias entre equipos de desarrollo.
- Se identificaron desafíos relacionados con la simulación de servicios externos.

---

## Lecciones aprendidas

- Documentar la configuración inicial reduce errores de integración.
- Definir contratos de API desde etapas tempranas agiliza el desarrollo.
- Mantener reuniones cortas y frecuentes mejora la coordinación del equipo.

---

## Acciones a mejorar

- Incrementar la cobertura de pruebas.
- Automatizar validaciones en el flujo de integración continua.
- Estandarizar la configuración de los entornos de desarrollo.

---

## Variables consideradas en el motor tarifario

| Variable                     | Fuente                                       | Justificación                                                                    |
| ---------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------- |
| Distancia del trayecto       | Google Maps                                  | Permite calcular el costo base del viaje.                                        |
| Precio del combustible       | Dataset de OSINERGMIN                        | Refleja las variaciones del costo operativo del conductor.                       |
| Capacidad del vehículo       | Perfil del vehículo                          | Ajusta la tarifa según el tipo y tamaño del vehículo.                            |
| Condición del tráfico        | Simulación inicial                           | Permite estimar retrasos y costos adicionales.                                   |
| Hora del día y demanda zonal | Reloj del sistema y factor dinámico por zona | Modela el comportamiento de la oferta y demanda.                                 |
| Tiempo estimado del viaje    | Google Maps                                  | Complementa el cálculo considerando la duración del servicio.                    |
| Histórico de la zona         | Base de datos                                | Permite identificar patrones de comportamiento y optimizar estimaciones futuras. |

## Observaciones 

### Métricas Scrum obligatorias

Para el Sprint 2 se deben presentar las siguientes métricas:

* Product Backlog actualizado.
* Sprint Backlog.
* Velocity del equipo.
* Historias de usuario completadas.
* Historias de usuario pendientes.

### Justificación de decisiones técnicas

Durante la exposición se deben responder las siguientes preguntas:

* ¿Por qué se eligió una arquitectura basada en microservicios?
* ¿Por qué se seleccionó la base de datos actual?
* ¿Qué patrones de diseño se implementaron?
* ¿Qué alternativas se evaluaron y descartaron?

### Retrospectiva del Sprint

#### ¿Qué funcionó?

* La distribución de tareas entre los integrantes del equipo.
* La implementación inicial del motor tarifario.
* La comunicación continua mediante reuniones periódicas.

#### ¿Qué falló?

* La integración entre algunos componentes del sistema.
* La configuración de entornos de desarrollo.
* La definición inicial de contratos entre servicios.

#### ¿Qué mejoraremos?

* Incrementar la cobertura de pruebas.
* Documentar las APIs desde etapas tempranas.
* Estandarizar los entornos mediante contenedores.
* Implementar métricas automáticas de seguimiento.


Conclusiones

El Sprint 2 permitió consolidar la base funcional del motor tarifario inteligente y evidenció la importancia de fortalecer la integración entre los distintos componentes del sistema.

