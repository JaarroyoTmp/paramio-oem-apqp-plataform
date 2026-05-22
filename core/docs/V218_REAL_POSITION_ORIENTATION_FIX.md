# V218 REAL POSITION + ORIENTATION FIX

## POSITION

Regla cerrada:

- válido: columna C = TP, fila empieza por TP, TRUE POSITION literal
- descartado: X, Y, Z, D, DF, D1, D2, 2D, 3D, PA, PR, M

Esto evita que PC-DMIS describa una fila como posición y el motor la use como TP.

## ANGULARITY / ORIENTATION

Solo se muestra el error geométrico dentro de tolerancia.
No se muestran valores auxiliares de ángulo/ubicación.
