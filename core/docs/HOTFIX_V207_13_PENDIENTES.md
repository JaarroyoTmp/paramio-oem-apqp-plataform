# Hotfix V207 - Drenaje de los 13 pendientes

## Caso analizado

Referencia: `0181280008900PM00_revA0.xlsx`
PC-DMIS: `PANEL DE CONECTORES - A0 - 0181280008900001.XLS` y `0002.XLS`

## Resultado antes

- 48 cotas Inspection
- 38 bloques PC-DMIS
- 13 pendientes

Desglose real:

- 10 cotas sin bloque PC-DMIS: 1, 2, 7, 8, 9, 44, 45, 46, 47, 48
- 3 cotas con bloque pero rechazadas por regla: 10, 38, 43

## Correcciones aplicadas

### 1. Nominal Inspection

Antes se calculaba nominal como media entre limite inferior y superior.
Eso falla en tolerancias asimetricas.

Ahora el nominal se extrae primero del valor Inspection.
Si no existe valor explicito, entonces se usa la media de limites.

### 2. DIMENSION con LOCATION nominal 0

PC-DMIS puede informar una ubicacion como desviacion respecto al nominal del plano:

- Inspection: nominal 81
- PC-DMIS: nominal 0
- PC-DMIS medida: -0.055

Valor real usado:

```txt
81 + (-0.055) = 80.945
```

Esto corrige la cota 10.

### 3. Diametro con angulo

Una caracteristica tipo:

```txt
Ø14 ± 0,25 x 90° ± 5°
```

se clasificaba como ANGULARITY por contener grados.
Ahora Ø / DIAM tiene prioridad y se clasifica como DIAMETER.

### 4. Ejes PC-DMIS en POSITION

Antes, si la descripcion decia "dimension de posicion", todas las filas X/Y/D/DF se convertian en TP.
Ahora la columna C manda:

- C = X => X
- C = Y => Y
- C = D / D1 / DF => diametro
- C = TP => TP

La descripcion ya no pisa el eje real.

### 5. Orientaciones con fila unica M nominal 0

Para perpendicularidad / angularidad / paralelismo, si el bloque tiene una unica fila numerica M con nominal 0, se acepta como error geometrico.

## Resultado esperado despues

Para PANEL DE CONECTORES:

- pendientes por regla: 0
- pendientes reales por falta de bloque PC-DMIS: 10

Las 10 restantes no pueden enlazarse automaticamente porque no existe bloque COTA correspondiente en el PC-DMIS aportado.
