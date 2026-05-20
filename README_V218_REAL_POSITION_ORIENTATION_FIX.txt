V218 REAL POSITION + ORIENTATION FIX

Corrección verificada sobre V217:

1) POSITION
- Solo acepta TP real.
- Descarta X/Y/Z/D/DF/D1/D2/2D/3D aunque la descripción diga POSITION/POSICIÓN.
- El parser ya no convierte una fila a TP por contener la palabra POSICIÓN.

2) ORIENTATION
- ANGULARITY/PARALLELISM/PERPENDICULARITY muestran solo el error geométrico dentro de tolerancia.
- Descarta valores auxiliares como 8.99 grados/ubicaciones.

3) ZIP
- Esta versión incluye README_V218 y diagnostico/isir con título V218.
