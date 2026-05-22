# Score Engine V210

## Problema que corrige

El motor anterior dependia demasiado de:

- bloque COTA exacto
- nominal exacto
- fila exacta dentro del bloque

Eso dejaba pendientes falsos cuando PC-DMIS tenia la medicion pero no con la identidad esperada.

## Solucion

Cada fila PC-DMIS recibe puntuacion segun:

| Factor | Peso aproximado |
|---|---:|
| Tipo compatible | alto |
| Bloque exacto | medio |
| Medida E dentro de Inspection | muy alto |
| Nominal PC-DMIS cercano | alto |
| Tolerancia compatible | medio |
| Eje/rol correcto | medio |

## Decision

El motor compara:

1. bloque exacto
2. mejor candidato semantico global

Si el semantico es claramente mejor, lo usa.

## Trazabilidad

Cada candidato puede mostrar:

- semanticScore
- semanticBlock
- adjustmentReason

Esto permite saber por que se eligio una fila.
