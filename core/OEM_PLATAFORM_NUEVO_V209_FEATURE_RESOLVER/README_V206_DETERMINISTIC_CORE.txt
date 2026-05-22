OEM PLATFORM V206 - MOTOR DETERMINISTA

OBJETIVO
- Cortar la cadena de parches V204/V205.
- Mantener la interfaz actual.
- Sustituir el nucleo por una arquitectura modular y estable.

REGLA PRINCIPAL
Inspection manda el tipo.
PC-DMIS solo aporta filas RAW.
El engine aplica una strategy por tipo.
La validation decide OK/NOK.
La UI solo muestra.

ESTRUCTURA NUEVA
/core/type-normalizer.js
/core/parser-inspection.js
/core/parser-pcdmis.js
/core/validation-engine.js
/core/result-engine.js
/core/strategies/*.js

CAMBIO IMPORTANTE
Se han eliminado los duplicados raiz:
- /parser-pcdmis.js
- /result-engine.js

Solo se debe tocar /core.

COMO ANADIR UNA REGLA NUEVA
1. Crear un archivo en /core/strategies/nuevo-tipo.js
2. Registrar:
   window.ParamioStrategies.NUEVO_TIPO=function(c,items){...}
3. Anadir el script en los HTML antes de result-engine.js
4. No tocar parser-pcdmis.js salvo que el formato RAW cambie.
5. No tocar validation-engine.js salvo que cambie la forma de validar.

VALIDACION
Dimensionales:
- nominal +/- tolerancia

Geometricas:
- 0 <= valor <= tolerancia positiva

NO VOLVER A HACER
- parches globales sobre result-engine.js
- parser que decide matching
- detectar POSITION por X/Y/Z
- mezclar DIAMETER con POSITION
- validar PROFILE/POSITION contra nominal
