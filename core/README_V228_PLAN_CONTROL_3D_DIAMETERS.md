# V228 Plan de Control - 3D + diametros por tolerancia

Cambios aplicados solo en `control-plan.html`:

- Eliminadas del plan cliente las columnas `Criterio motor`, `Origen` y `Accion`.
- Toda caracteristica procedente de Inspection / PC-DMIS se asigna a medicion 3D obligatoria.
- Los diametros mantienen verificacion 3D de Calidad y anaden autocontrol de Operario.
- El equipo de diametros se asigna segun rango de tolerancia:
  - <= 0.05: alexometro o micrometro de 3 contactos + CMM.
  - <= 0.10: alexometro / micrometro + CMM.
  - <= 0.30: micrometro / alexometro / calibre especifico + CMM.
  - tolerancia amplia: pie de rey / micrometro segun acceso + CMM.
- KCS refuerza frecuencia y plan de reaccion.

No se ha tocado ISIR, KCS, Dimensional, diagnostico, parser ni motor dimensional.
