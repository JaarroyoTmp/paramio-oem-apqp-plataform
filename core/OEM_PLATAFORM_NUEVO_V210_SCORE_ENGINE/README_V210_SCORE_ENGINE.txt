OEM PLATAFORM V210 - SCORE ENGINE

Objetivo:
- Dejar de depender de coincidencia exacta COTA N / nominal exacto.
- Resolver candidatos por puntuacion industrial: tipo, eje, nominal, tolerancia, medida real y contexto.
- Mantener trazabilidad: candidato seleccionado, score, bloque semantico y motivo de ajuste.

Cambios clave:
1. DIMENSION admite PC-DMIS con D=0 y E como medida absoluta si E cae dentro de nominal/tolerancia Inspection.
2. DIMENSION admite nominal PC-DMIS no exacto si la medida real E es compatible con Inspection.
3. Fallback semantico global por bloque cuando el bloque numerico exacto no existe o es peor que otro candidato.
4. El bloque numerico ya no gana siempre: si el score semantico es claramente mejor, se usa el candidato semantico.

Regla de trabajo:
- Si aparece un fallo nuevo, se corrige la puntuacion o la strategy concreta, no la UI ni parsers completos.
