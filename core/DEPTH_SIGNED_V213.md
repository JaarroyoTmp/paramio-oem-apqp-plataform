# V213 - DEPTH con nominal firmado

Correccion aplicada:

- Inspection puede decir `Profundidad 5`.
- PC-DMIS puede reportarlo como `UBICACION/LOCATION (PLANO COTA 5 X)` con nominal `-5` y medida `-5.xxx`.
- La strategy DEPTH ahora acepta filas LOCATION/UBICACION si el valor absoluto del nominal PC-DMIS coincide con la profundidad Inspection.
- La validacion conserva el signo real del PC-DMIS: por ejemplo `D=-5`, `E=-5.122`, `F=0.05`, `G=0.05` se valida como dimensional firmado y debe salir NOK si queda fuera de rango.

Esto convierte cotas 44/45/46 de `SIN_REGLA` a resultado real OK/NOK.
