OEM PLATAFORM NUEVO V208 - TRACEABLE CORE

Objetivo de esta version:
- No perseguir solo bajar pendientes.
- Convertir cada cota en un diagnostico trazable y accionable.
- Evitar que una regla nueva rompa otra existente.

Cambios principales:
1. Nuevo resultado interno por cota:
   OK
   NOK
   SIN_BLOQUE_PCDMIS
   SIN_MEDIDA_NUMERICA
   SIN_REGLA

2. Nuevo motor de trazabilidad:
   core/result-engine.js
   core/diagnostics-engine.js

3. Cada cota ahora explica:
   - tipo Inspection
   - strategy aplicada
   - regla esperada
   - filas candidatas encontradas
   - filas seleccionadas
   - filas descartadas
   - motivo del descarte
   - modo de validacion
   - confianza del match

4. diagnostico.html actualizado:
   - resumen industrial de estados
   - trazabilidad por cota
   - RAW BLOCK VIEW conservado
   - export CSV trazable

Regla de hierro mantenida:
Inspection decide el tipo.
PC-DMIS solo aporta filas RAW.
La strategy selecciona.
El validador decide OK/NOK.
La UI muestra.

Esta version no pretende ocultar pendientes.
Pretende convertir cada pendiente en una causa exacta para poder llegar a alta fiabilidad en referencias grandes.
