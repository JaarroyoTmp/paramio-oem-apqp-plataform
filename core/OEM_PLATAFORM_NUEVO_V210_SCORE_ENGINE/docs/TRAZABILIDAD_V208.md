# Trazabilidad V208

## Objetivo

Con referencias de 500 cotas no sirve un estado generico `Pendiente`.
Cada cota debe terminar en un estado diagnosticable.

## Estados nuevos

| Estado | Significado | Accion |
|---|---|---|
| OK | Match encontrado y validado | Sin accion |
| NOK | Match encontrado, fuera de tolerancia | Revisar pieza/medicion |
| SIN_BLOQUE_PCDMIS | No existe bloque COTA en PC-DMIS | Revisar programa/reporte |
| SIN_MEDIDA_NUMERICA | Existe bloque, pero no hay E numerica | Revisar export PC-DMIS |
| SIN_REGLA | Existe bloque y datos, pero ninguna strategy acepta filas | Crear/ampliar strategy |

## Campos del trace

```js
{
  balloon: '38',
  piece: '1',
  inspectionType: 'ANGULARITY',
  strategy: 'ANGULARITY',
  rule: 'Acepta ANGULARITY/ANGULO o fallback controlado M nominal 0',
  status: 'OK',
  reason: 'Match ANGULARITY validado correctamente',
  confidence: 'HIGH',
  validationMode: 'GEOMETRIC_0_TO_TOL',
  candidatesFound: 2,
  selectedCount: 1,
  selected: [...],
  discarded: [...]
}
```

## Principio de crecimiento

Cualquier regla nueva debe entrar en una strategy concreta y debe verse en diagnostico.html.
No se deben crear parches globales.

## Uso recomendado

1. Cargar Inspection y PC-DMIS.
2. Abrir `diagnostico.html`.
3. Exportar CSV trazable.
4. Atacar primero `SIN_REGLA`.
5. Separar los `SIN_BLOQUE_PCDMIS` de los errores reales de motor.
