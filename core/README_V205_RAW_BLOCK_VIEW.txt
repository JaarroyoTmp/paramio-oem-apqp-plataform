V205_RAW_BLOCK_VIEW

Cambios productivos:
- Solo se toca parser PC-DMIS, index y diagnóstico.
- No se toca ISIR/KCS/Dimensional/Plan/Flowchart.
- parser-pcdmis.js guarda pcdmisRawBlocks[piece][cota] con TODAS las filas del bloque COTA.
- diagnostico.html añade RAW BLOCK VIEW para ver columnas A/B/C/D/E/F/G/H/I, axis y role.

Cómo usar:
1. Abrir index.html.
2. Reprocesar Inspection + PC-DMIS.
3. Abrir diagnostico.html.
4. Seleccionar cota y pieza en RAW BLOCK VIEW.
5. Si la línea existe en RAW pero no sale en ISIR, se corrige core/result-engine.js.
6. Si la línea no existe en RAW, se corrige core/parser-pcdmis.js.
7. Si el tipo Inspection es incorrecto, se corrige core/parser-inspection.js.
