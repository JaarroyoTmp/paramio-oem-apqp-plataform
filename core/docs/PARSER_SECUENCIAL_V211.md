# V211 - Parser secuencial PC-DMIS

## Cambio crítico

El parser ya no abre un bloque COTA cuando encuentra la palabra `COTA` dentro de una descripción de medición.

Ejemplo real que antes rompía el enlace:

```txt
******COTA 1******
UBIC1 | Ubicación de la dimensión (PLANO COTA 114) | Z | 114 | 113.989
```

Antes, la segunda línea se interpretaba erróneamente como una nueva cabecera `COTA 114`, por eso la COTA 1 quedaba `SIN_BLOQUE_PCDMIS`.

## Regla V211

Solo se considera cabecera si la columna A es una cabecera real:

```txt
******COTA N******
COTA N
```

y la fila no contiene una medición numérica en columnas D/E.

## Resultado esperado

Las cotas con descripciones como `PLANO COTA 114`, `PLANO COTA 105`, `PLANO COTA 178`, etc. ya permanecen dentro de su bloque real.
