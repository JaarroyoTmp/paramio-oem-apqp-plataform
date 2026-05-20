# V216 POSITION TP ONLY

Correccion minima sobre V215.

Objetivo:
- POSITION en ISIR/Dimensional muestra y valida solo la fila TP real.
- X POSITION, Y POSITION, Z POSITION y D POSITION no se muestran como resultados de la cota POSITION.
- Esas filas siguen disponibles en diagnostico/trazabilidad como filas descartadas, no se borran del proyecto.

Criterio aplicado:
- TP valido si columna/eje es TP, o nombre empieza por TP, o texto contiene TRUE POSITION.
- No vale solo que el texto diga "dimension de posicion".
