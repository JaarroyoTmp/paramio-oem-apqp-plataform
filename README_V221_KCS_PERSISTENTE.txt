V221 KCS PERSISTENTE

Objetivo:
- No tocar motor de medicion ni validaciones.
- Corregir flujo KCS.

Cambios:
- La seleccion KCS se guarda en project.kcsSelection por numero de globo.
- Dimensional es el unico sitio donde se marca/desmarca KCS.
- KCS lee solo project.kcsSelection y muestra solo esas cotas.
- ISIR mantiene solo la marca visual KCS.
- Se evita depender de seleccion antigua/inestable solo en c.kcs.

No tocado:
- Parser PC-DMIS.
- Strategies POSITION/PROFILE/DEPTH/DIMENSION.
- Motor de validacion.
