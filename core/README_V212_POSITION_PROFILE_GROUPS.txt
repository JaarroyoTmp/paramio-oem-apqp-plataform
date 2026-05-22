OEM PLATAFORM V214 - POSITION/PROFILE GROUP FIX

Cambios:
- POSITION ya no valida X/Y/Z/D POSITION como resultado.
- POSITION valida solo TP / TRUE POSITION.
- PROFILE ya no valida LOCATION X/Y/Z como error de perfil.
- PROFILE valida solo PROFILE / PERFIL / M PROFILE.
- Se mantienen las filas auxiliares visibles en trazabilidad.

Objetivo:
Bajar NOK falsos en geometrías compuestas sin tocar DIMENSION, que ya estaba funcionando mejor.
