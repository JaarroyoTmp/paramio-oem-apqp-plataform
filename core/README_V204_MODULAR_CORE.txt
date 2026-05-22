V204_MODULAR_CORE

Arquitectura modular real.

HTML:
- index.html: carga y procesa.
- diagnostico.html: diagnostico del motor.
- isir.html: ISIR.
- kcs.html: KCS.
- dimensional.html: informe dimensional.
- control-plan.html: plan de control.
- flowchart.html: flowchart.

Core unico:
- core/storage.js
- core/parser-inspection.js
- core/parser-pcdmis.js
- core/result-engine.js

Regla principal: Inspection manda. PC-DMIS solo aporta valores dentro del bloque COTA exacto.

Matching:
POSITION -> TP
DIAMETER -> D/DF
PROFILE -> perfil + ubicacion
ANGULARITY/PARALLELISM/PERPENDICULARITY -> error + ubicacion
FLATNESS/CIRCULARITY/CYLINDRICITY -> M/tipo correspondiente
DIMENSION -> M/DIST > X/Y/Z > D

Los HTML ya no duplican chooseReportItems/resultValues/pieceStatus.
