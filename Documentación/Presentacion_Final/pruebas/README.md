# Pruebas — evidencias de ejecución (capturas de flujos)

> Capturas de pantalla que evidencian los flujos del sistema **funcionando**, para la demo/defensa.
> La **estrategia** de pruebas (cómo se prueba) está en [`../../Scrum/Pruebas/pruebas_sistema.md`](../../Scrum/Pruebas/pruebas_sistema.md); aquí van las **evidencias** por componente.

## Documentos por componente
- **[Panel Admin](Pruebas_Panel_Admin.md)** — sesiones admin/auditor, pricing, viajes, seguridad y gestión de usuarios.
- **[App Móvil](Pruebas_App_Movil.md)** — *(en preparación)* flujos de pasajero y conductor.

## Checklist transversal de flujos a evidenciar
- [ ] Registro de usuario (pasajero / conductor / admin / auditor)
- [ ] Login por rol
- [ ] Solicitud de viaje + cotización **asimétrica** (pasajero ve techo / conductor ve piso)
- [ ] Negociación + aceptación bilateral
- [ ] Inicio y fin de viaje + **regla de pago** (liquidación)
- [ ] Detección de anomalía (precio fuera de rango)
- [ ] Panel admin: configuración, simulador oferta/demanda, auditoría de anomalías, reportes
- [ ] Auditor en modo solo lectura

> Cada componente documenta sus capturas en su propio archivo `Pruebas_<Componente>.md` (una sección por pantalla/flujo).
