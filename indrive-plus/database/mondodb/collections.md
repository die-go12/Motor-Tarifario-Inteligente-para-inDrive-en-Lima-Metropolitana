# MongoDB Collections
# inDrive+ - Motor Tarifario Inteligente

MongoDB será utilizado para almacenar:
- auditorías tarifarias
- logs del sistema
- trazabilidad de cálculos
- histórico de anomalías

--------------------------------------------------

COLLECTION: pricing_logs

Descripción:
Almacena el detalle completo de los cálculos generados por el motor tarifario.

Ejemplo de documento JSON:

{
  tripId: 1,
  trafficFactor: 1.3,
  fuelFactor: 1.1,
  demandFactor: 1.2,
  minimumPrice: 14.50,
  maximumPrice: 19.00,
  generatedAt: ISODate()
}

--------------------------------------------------

COLLECTION: anomaly_logs

Descripción:
Registra anomalías detectadas por el sistema.

Ejemplo de documento JSON:

{
  tripId: 1,
  anomalyType: "PRICE_OUTLIER",
  severity: "MEDIUM",
  detectedAt: ISODate()
}

--------------------------------------------------

COLLECTION: pricing_history

Descripción:
Almacena el histórico de cálculos tarifarios utilizados para análisis y futuras mejoras del sistema.

Ejemplo de documento JSON:

{
  tripId: 1,
  route: "Miraflores - San Isidro",
  calculatedPrice: 18.00,
  realPrice: 16.50,
  timestamp: ISODate()
}
