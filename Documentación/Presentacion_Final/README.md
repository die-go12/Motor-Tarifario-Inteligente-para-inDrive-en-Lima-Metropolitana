# Presentación Final — Motor Tarifario Inteligente inDrive+

> Índice y **guion de la defensa**. Reúne el material de la presentación y enlaza a la documentación existente (no la duplica).

## 🏗️ Arquitectura
- **[Vista de arquitectura (defensa)](arquitectura/Arquitectura.md)** — documento **oficial que se expone**: las 4 vistas del sistema (general, backend + BD, panel admin, app móvil) + decisiones de diseño y patrones (§5).
- [Referencia técnica completa](../Aquitectura/Arquitectura_general.md) — **canon** técnico: diagramas fuente (componentes, secuencia, clases), 7 variables, manejo de errores y entidades.

## 🧪 Pruebas (evidencias de ejecución)
> Capturas de las pantallas/flujos **funcionando**. La **estrategia** (cómo se prueba) está en [`pruebas_sistema.md`](../Scrum/Pruebas/pruebas_sistema.md); aquí van las **evidencias** por componente.
- **[Panel Admin](pruebas/Pruebas_Panel_Admin.md)** — sesiones admin/auditor, pricing, viajes, seguridad y gestión de usuarios.
- **[App Móvil](pruebas/Pruebas_App_Movil.md)** — *(en preparación)* flujos de pasajero y conductor.
- Índice completo de pruebas → [`pruebas/`](pruebas/README.md)

## 🔄 Gestión de cambio
- [`gestion_de_cambio.md`](gestion_de_cambio.md) — cambios gestionados durante el proyecto (proceso de 5 pasos).

## 🎤 Guion sugerido de la defensa
1. **Visión general del sistema** → [Vista de arquitectura](arquitectura/Arquitectura.md)
2. **Decisiones de diseño** (por qué) → [Decisiones y patrones](arquitectura/Arquitectura.md) (§5) · [ADRs](../Aquitectura/decisiones_arquitectonicas.md) · [Stack](../Aquitectura/Stack_Tecnologico.md)
3. **Negocio / diferencial** → [Flujo de cálculo de tarifa](../Negocio/flujo_calculo_tarifa.md)
4. **Incremento del sprint** → [Sprint 2](../Scrum/Sprints/sprint_2.md) *(tiene su índice interno)*
5. **Requerimientos** → [Historias de Usuario](../Requerimientos/Historias_usuario.md)
6. **Pruebas** → [estrategia](../Scrum/Pruebas/pruebas_sistema.md) + [evidencias](pruebas/README.md)
7. **Gestión de cambio** → [`gestion_de_cambio.md`](gestion_de_cambio.md)
8. **Cierre** → métricas (Sprint 2 §10), [retrospectiva](../Scrum/Retrospectivas/retrospective2.md), resultados, lecciones y conclusiones

## Contenido de este apartado
| Carpeta / archivo | Qué contiene |
|---|---|
| `arquitectura/` | Vista de arquitectura para la defensa (las 4 vistas + decisiones y patrones) |
| `pruebas/` | Evidencias de pruebas (capturas de pantallas/flujos, por componente) |
| `gestion_de_cambio.md` | Cambios gestionados durante el proyecto (proceso de 5 pasos) |

> Nota: el **Sprint 2** mantiene su propio índice; este apartado **engloba la presentación** y lo que escapa al sprint (arquitectura para exponer, evidencias de demo, gestión de cambio).
