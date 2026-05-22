# V217 - POSITION TP real y orientacion limpia

Cambios seguros sobre V216:

- POSITION solo acepta TP real / TRUE POSITION.
- Se descartan X/Y/Z/D/DF/2D/3D POSITION como resultados de posicion.
- Los valores auxiliares siguen en trazabilidad, pero no salen como resultado ISIR.
- ANGULARITY/PARALLELISM/PERPENDICULARITY seleccionan solo el error geometrico dentro de tolerancia.
- Se evita mostrar angulos/distancias auxiliares como 8.99, 67.03, etc.

No se ha tocado parser, DIMENSION, PROFILE ni DEPTH.
