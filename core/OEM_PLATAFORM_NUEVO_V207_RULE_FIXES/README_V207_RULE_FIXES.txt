OEM PLATFORM V207 - RULE FIXES SOBRE CORE DETERMINISTA

Correccion directa del caso de los 13 pendientes en PANEL DE CONECTORES.

Cambios clave:
- nominal Inspection extraido del valor, no de la media de limites cuando hay valor explicito
- DIMENSION acepta LOCATION X/Y/Z nominal 0 como desviacion si procede
- DIAMETER tiene prioridad sobre ANGULARITY si aparece Ø / DIAM
- PC-DMIS respeta columna C para eje: X/Y/Z/D/DF/D1/TP
- orientaciones aceptan fila unica M nominal 0 como error geometrico

Resultado validado sobre los ejemplos:
- PANEL DE CONECTORES: de 13 pendientes a 10 pendientes reales sin bloque PC-DMIS
- HOUSING KNUCKLE: se reducen los rechazos de regla; queda cota 100 porque el bloque PC-DMIS no contiene una medida compatible con Inspection 11 ± 0,5
