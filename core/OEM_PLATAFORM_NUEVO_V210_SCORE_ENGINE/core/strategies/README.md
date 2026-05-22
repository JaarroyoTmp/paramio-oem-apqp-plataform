# Strategies V206

Cada archivo contiene una regla aislada.

Contrato:

```js
window.ParamioStrategies.TIPO = function(characteristic, items) {
  return itemsFiltrados;
}
```

- `characteristic` viene de Inspection.
- `items` son filas PC-DMIS del bloque COTA correspondiente.
- La strategy no valida OK/NOK.
- La strategy solo decide que filas representan la cota.
- La validacion se hace en `validation-engine.js`.
