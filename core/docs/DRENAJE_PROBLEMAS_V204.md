# Drenaje de problemas V204/V205

## Problema 1: motores duplicados

Existian copias en raiz y en `/core`. Eso provocaba que se modificara una copia y la plataforma cargase otra.

Solucion V206: se eliminan los duplicados raiz. Solo existe nucleo activo en `/core`.

## Problema 2: patches acumulados

El engine tenia redefiniciones globales sucesivas. El resultado dependia del ultimo patch cargado.

Solucion V206: no hay patches. Hay functions base y strategies.

## Problema 3: parser PC-DMIS interpretaba demasiado

El parser intentaba decidir axis, roles y matching.

Solucion V206: el parser conserva RAW y campos normalizados minimos para que las strategies decidan.

## Problema 4: POSITION contaminada

X/Y/Z/D podian terminar siendo tratados como POSITION.

Solucion V206: POSITION solo acepta TP / TRUE POSITION / POSICION.

## Problema 5: DIAMETER mezclado con POSITION

`D LOCATION` podia confundirse.

Solucion V206: `D`, `DF`, `DIAMETER`, `LOCATION D` pertenecen a DIAMETER, nunca a POSITION.

## Problema 6: geometricas validadas contra nominal

Esto generaba NOK falsos.

Solucion V206: geometricas se validan como error: `0 <= valor <= tolerancia`.

## Problema 7: UI, matching y validacion mezclados

El mismo archivo hacia demasiadas cosas.

Solucion V206: separacion por responsabilidades.
