# V215 - PROFILE con ubicacion asociada y POSITION solo TP

Objetivo:

- POSITION: el valor automatico mostrado y validado debe ser exclusivamente la fila TP / TRUE POSITION.
- PROFILE: el valor validado debe ser la fila PROFILE / M PROFILE, pero el resultado mostrado debe incluir tambien las LOCATION/UBICACION asociadas del elemento cuando existan en el mismo bloque.

Regla importante:

- Se separa validacion de visualizacion.
- Las LOCATION asociadas a PROFILE no afectan al OK/NOK del perfil.
- Las X/Y/Z/D POSITION no se muestran como resultado principal de POSITION; solo se conserva TP.

Esto evita que POSITION muestre valores auxiliares y permite que PROFILE documente forma + ubicacion.
