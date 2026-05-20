OEM PLATAFORM V209 - FEATURE RESOLVER

Correcciones críticas:
1) Se corrige cleanFeatureText: una cota numerica como 114 ya no se convierte en 14 por ser cota nº1.
2) PC-DMIS ahora guarda globalItems por pieza, no solo bloques exactos.
3) Si no existe bloque COTA exacto, el diagnostico intenta un fallback semantico controlado por tipo, nominal y tolerancia.
4) La confianza baja a MEDIUM/LOW cuando el enlace no viene de bloque exacto.

Objetivo:
Reducir falsos SIN_BLOQUE cuando el resultado existe en el informe pero la identidad no coincide 1:1 con COTA N.

Regla importante:
El fallback semantico no sustituye la trazabilidad: cada seleccion marca semanticFallback, semanticBlock y semanticScore.
