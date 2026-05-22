# V226 CONTROL RULE ENGINE

Versión basada en V225.

## Alcance

Solo se modifica `control-plan.html`.

No se toca:

- motor dimensional
- parser PC-DMIS
- ISIR
- Dimensional
- KCS
- diagnósticos

## Cambios principales

- Motor de decisión para Plan de Control.
- Reglas por tipo Inspection.
- Reglas por tolerancia.
- Prioridad KCS.
- Reglas por texto técnico: rosca, profundidad, radio, rugosidad, etc.
- Asignación automática de:
  - método de control
  - equipo / medio de control
  - muestra
  - frecuencia
  - responsable
  - reacción
- Nueva columna `Criterio motor` para explicar por qué se asigna una regla.
- Biblioteca de reglas exportable/importable en JSON.
- Restauración de reglas base.

## Filosofía

El Plan de Control nace del proceso y las operaciones.
Inspection no crea la ruta; Inspection añade controles dentro de operaciones existentes.

