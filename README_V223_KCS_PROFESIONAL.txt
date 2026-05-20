V223 KCS PROFESIONAL

Base: V222 / motor V218 estable.

Objetivo:
- No tocar parser, motor de resultados, POSITION, PROFILE, DEPTH ni validaciones.
- Corregir lectura real de KCS seleccionadas desde Dimensional.
- Dar un aspecto mas empresarial a los informes cliente.

Cambios:
1. KCS exacto:
   - Dimensional guarda una lista KCS independiente por numero de globo.
   - KCS lee exclusivamente esa lista exacta.
   - Evita que KCS use selecciones antiguas o parciales.

2. Flujo:
   - Dimensional: seleccion oficial KCS.
   - ISIR: solo marca visualmente KCS.
   - KCS: muestra solo las KCS seleccionadas en Dimensional.

3. Presentacion:
   - Capa visual profesional comun.
   - Cabeceras, tablas, estados y modo impresion/PDF mas limpios.

No se modifica el nucleo de medicion.
