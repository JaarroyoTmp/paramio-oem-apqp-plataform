# V229 - Metodo de control automatico

Cambios aplicados solo en control-plan.html:

- Renombrada la columna a Metodo de control.
- Las cotas con resultado PC-DMIS mantienen criterio de verificacion 3D.
- Las cotas de Inspection que no aparecen en PC-DMIS pasan a reglas especificas:
  - Muestra: 2
  - Frecuencia: Inicio y final del lote
  - Responsable: Calidad
  - Metodo por defecto: Informe dimensional
- Reglas especificas para no-PCDMIS:
  - Radio <= 10: Plantilla de radio / Presetting
  - Radio > 10: Presetting
  - Profundidad de rosca: Pie de rey
  - Chaflan: Pie de rey / Presetting
  - Diametro: Pie de rey
  - Distancia: Pie de rey / Gramil de alturas
  - Rugosidad: Rugosimetro

No se ha tocado ISIR, KCS, Dimensional, diagnostico ni el motor dimensional.
