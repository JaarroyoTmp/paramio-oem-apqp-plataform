# V225 — Plan de Control OEM V2

Base: V223 KCS profesional estable.

## Cambios realizados

- Sustituido únicamente `control-plan.html`.
- No se ha tocado el motor de medición, parser, ISIR, Dimensional ni KCS.
- El Plan de Control ya no muestra resultados de medición; esos pertenecen a ISIR/Dimensional.
- Estructura basada en proceso/ruta de fabricación:
  - Recepción de materia prima
  - Preparación de máquina, herramientas y utillajes
  - Mecanizado / proceso principal
  - Rebarbado, limpieza y soplado
  - Embalaje, identificación y expedición
  - Auditorías y verificación documental
- Las características de Inspection se insertan como controles asignables a operación, por defecto OP 020.
- Cada fila permite editar operación, proceso, máquina, característica, especificación, método, equipo, muestra, frecuencia, responsable y reacción.
- KCS se integran visualmente en el plan sin romper el formato.
- Biblioteca de operaciones reutilizable con plantillas y operación manual.
- Exportación CSV e impresión/PDF.

## Filosofía

El plan nace de las operaciones de la pieza. Inspection no crea la ruta; aporta controles que se asignan a operaciones existentes.

