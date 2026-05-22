# Reglas del motor V206

## Principio

Inspection define el tipo real de la cota. PC-DMIS no decide el tipo, solo aporta filas dentro del bloque `COTA N`.

## Flujo

1. `parser-inspection.js` genera `characteristics[]`.
2. `parser-pcdmis.js` genera bloques RAW por cota y pieza.
3. `result-engine.js` llama a la strategy del tipo Inspection.
4. `validation-engine.js` valida OK/NOK.
5. HTML renderiza.

## Strategies actuales

| Tipo | Archivo | Regla |
|---|---|---|
| DIMENSION | `dimension.js` | X/Y/Z/D/M, DISTANCE, DIMENSION M, sin TP ni geometrica |
| POSITION | `position.js` | Solo TP / TRUE POSITION / POSICION |
| PROFILE | `profile.js` | PROFILE/PERFIL y ubicaciones asociadas |
| DIAMETER | `diameter.js` | D, DF, DIAMETER, LOCATION D |
| FLATNESS | `flatness.js` | FLATNESS / PLANITUD |
| ANGULARITY | `orientation.js` | ANGULARITY / ANGULO / ANGLE |
| PARALLELISM | `orientation.js` | PARALLELISM / PARALELISMO |
| PERPENDICULARITY | `orientation.js` | PERPENDICULARITY / PERPENDICULARIDAD |
| DEPTH | `depth.js` | DEPTH / PROFUNDIDAD |
| RADIUS | `radius.js` | RADIUS / RADIO |
| THREAD | `thread.js` | ROSCA / THREAD / Mxx |

## Validacion

### Dimensional

Se valida contra nominal y tolerancias:

```txt
nominal - abs(minus) <= medida <= nominal + abs(plus)
```

### Geometrica

Se valida contra tolerancia positiva:

```txt
0 <= medida <= tolerancia
```

Esto evita el error historico de marcar NOK un perfil 0.05 con tolerancia 0.2.

## Prohibiciones tecnicas

- No crear nuevos parches V2/V3/V4 encima del engine.
- No duplicar `result-engine.js` fuera de `/core`.
- No meter matching dentro del parser PC-DMIS.
- No usar X/Y/Z como prueba de POSITION.
- No mezclar `D LOCATION` con POSITION.
