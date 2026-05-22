OEM PLATAFORM V211 - SEQUENTIAL BLOCK FIX

Avance real aplicado:
- Corregido el bug principal del parser PC-DMIS.
- Ya no se interpreta "PLANO COTA 114" como cabecera de bloque.
- Solo abre bloque una fila de cabecera real en columna A.
- Esto debe recuperar las cotas que aparecían como SIN_BLOQUE aunque tenían medición real.

Prueba prioritaria:
- Referencia de 48 cotas / Panel conectores.
- Cotas 1, 2, 7, 8, 9 deben dejar de aparecer como SIN_BLOQUE si el informe contiene esas líneas.
