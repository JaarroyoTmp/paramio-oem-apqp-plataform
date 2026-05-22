# V214 - POSITION y PROFILE como grupos reales

## Cambio principal

Se corrige el comportamiento que generaba NOK falsos en características geométricas compuestas.

## POSITION

Antes el motor podía seleccionar:

- X POSITION
- Y POSITION
- Z POSITION
- D POSITION
- TP POSITION

Eso era incorrecto, porque X/Y/Z/D son filas auxiliares de ubicación o referencia. La validación de posición debe usar solo la fila de error geométrico:

- TP
- TRUE POSITION
- DIMENSION DE POSICION

## PROFILE

Antes el motor seleccionaba PROFILE y también LOCATION X/Y/Z asociadas. Eso provocaba NOK falsos porque intentaba validar una coordenada grande contra una tolerancia de perfil pequeña.

Ahora PROFILE valida solo la fila primaria:

- PROFILE
- PERFIL
- M PROFILE

Las LOCATION asociadas siguen apareciendo en trazabilidad como filas del bloque, pero no se usan como resultado primario.

## Objetivo

Reducir NOK falsos sin esconder resultados reales fuera de tolerancia.
