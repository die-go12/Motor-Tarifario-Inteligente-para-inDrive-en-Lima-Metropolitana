# Database Architecture
# inDrive+ - Motor Tarifario Inteligente

El sistema implementa una arquitectura híbrida de persistencia utilizando múltiples tecnologías especializadas.

## PostgreSQL
Base de datos relacional encargada de:
- usuarios
- vehículos
- viajes
- relaciones transaccionales

## MongoDB
Base de datos NoSQL orientada a documentos utilizada para:
- auditorías tarifarias
- logs
- trazabilidad del motor tarifario

## Redis
Sistema en memoria utilizado para:
- cache
- estados temporales
- sesiones activas
- optimización de latencia
