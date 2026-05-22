V214 SAFE DEPTH ROLLBACK

Base: V212, no V213.

Objetivo:
- Recuperar el comportamiento estable de V212.
- Añadir SOLO una regla controlada para DEPTH firmado.

Regla nueva:
- Si Inspection dice DEPTH / PROFUNDIDAD 5, 4 o 5.2
- y PC-DMIS reporta una fila LOCATION / UBICACION / PLANO con nominal -5, -4 o -5.2,
- esa fila se acepta como medicion de profundidad.

No toca:
- DIMENSION
- POSITION
- PROFILE
- DIAMETER
- parser PC-DMIS
- result-engine
- validation-engine

Motivo:
V213 rompió el comportamiento general. Esta versión vuelve a V212 y aplica únicamente la mejora de profundidad de forma aislada.
