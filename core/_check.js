document.write(renderShell('plan'))

const PLAN_VERSION='V234_PRODUCT_SPEC_COLUMNS';
const OPS_KEY='paramio_control_plan_ops_v225';
const OV_KEY='paramio_control_plan_overrides_v225';
const LIB_KEY='paramio_control_plan_library_v225';
const ROUTE_KEY='paramio_control_plan_route_v225';
const RULE_KEY='paramio_control_plan_rules_v228';
let project=applyKcsSelectionToProject(loadProject()||{});
const root=document.getElementById('root');
function cpNorm(v){return String(v??'').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();}
function cpNum(v){const n=parseFloat(String(v??'').replace(',','.').replace(/[^0-9.\-]/g,''));return Number.isFinite(n)?n:NaN;}
function sig(){return getProjectSignature(project||{});}
function storeKey(base){return base+'__'+sig();}
function loadJson(key,fallback){try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback;}catch(e){return fallback;}}
function saveJson(key,val){try{localStorage.setItem(key,JSON.stringify(val));}catch(e){}}
function cpType(c){return normalizeFeatureType(c?.featureType||c?.rawValue||c?.decodedValue||c?.value||'');}
function cpClean(c){return cleanFeatureText?cleanFeatureText(c?.value||c?.rawValue||'',c?.number):cleanChar(c?.value||'');}
function cpSpec(c){const lo=String(c.lower??c.li??'').trim();const up=String(c.upper??c.ls??'').trim();const unit=String(c.units??c.unit??'').trim();if(lo||up)return `LI ${esc(lo)} / LS ${esc(up)} ${esc(unit)}`.trim();return esc(c.value||c.rawValue||'');}

function cpPlainText(v){return String(v??'').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();}
function cpOriginalCharacteristic(c){
 const raw=String(c?.decodedValue||c?.rawValue||c?.value||'').replace(/\s+/g,' ').trim();
 const cleaned=cpClean(c);
 return raw || cleaned || '';
}
function cpPlanSpec(c){
 const main=cpOriginalCharacteristic(c);
 const lo=String(c.lower??c.li??'').trim();
 const up=String(c.upper??c.ls??'').trim();
 const unit=String(c.units??c.unit??'').trim();
 const lim=(lo||up)?`LI ${lo||'—'} / LS ${up||'—'} ${unit}`.trim():'';
 if(main && lim && !cpNorm(main).includes(cpNorm(lim))) return `${main}\n${lim}`;
 return main || lim;
}
function cpProductCategory(c){
 const t=cpNorm([c?.value,c?.rawValue,c?.decodedValue,c?.featureType,c?.gdtType].join(' '));
 const typ=cpType(c);
 if(/RUGOSIDAD|ROUGHNESS|\bRA\b|\bRZ\b/.test(t)) return 'Rugosidad';
 if(/ROSCA|THREAD|ROSCADO|\bM\d+/.test(t)) return 'Rosca';
 if(/CHAFLAN|CHAMFER|AVELLANADO|\bX\s*\d+(?:[\.,]\d+)?\s*(?:°|GRAD|DEG)|(?:°|GRAD|DEG)/.test(t) && (t.includes('Ø')||t.includes('DIAM')||/\bX\b/.test(t))) return 'Chaflán';
 if(/PROFUNDIDAD|DEPTH|\bPROF\b|FONDO/.test(t) || typ==='DEPTH') return 'Profundidad';
 if(/RADIO|RADIUS|\bR\s*\d/.test(t) || typ==='RADIUS') return 'Radio';
 if(/POSITION|POSICION|⌖|TRUE\s*POSITION/.test(t) || typ==='POSITION') return 'Posición';
 if(/PROFILE|PERFIL|⌒|⌓/.test(t) || typ==='PROFILE') return 'Perfil de superficie';
 if(/FLATNESS|PLANITUD/.test(t) || typ==='FLATNESS') return 'Planitud';
 if(/ANGULARITY|ANGULARIDAD|ANGULO|ANGLE|∠/.test(t) || typ==='ANGULARITY') return 'Angularidad';
 if(/PARALLELISM|PARALELISMO/.test(t) || typ==='PARALLELISM') return 'Paralelismo';
 if(/PERPENDICULARITY|PERPENDICULARIDAD|PERPENDICULAR/.test(t) || typ==='PERPENDICULARITY') return 'Perpendicularidad';
 if(/CONCENTRICITY|CONCENTRICIDAD|CONCENTRIC/.test(t) || typ==='CONCENTRICITY') return 'Concentricidad';
 if(/CIRCULARITY|CIRCULARIDAD|REDONDEZ/.test(t) || typ==='CIRCULARITY') return 'Circularidad';
 if(/CYLINDRICITY|CILINDRICIDAD/.test(t) || typ==='CYLINDRICITY') return 'Cilindricidad';
 if(/RUNOUT|OSCILACION|BATIMIENTO/.test(t) || typ==='RUNOUT') return 'Batimiento';
 if(/TALADRO|BORE|DRILL/.test(t) && (t.includes('Ø')||t.includes('DIAM'))) return 'Taladro';
 if(/Ø|⌀|DIAM/.test(t) || typ==='DIAMETER') return 'Diámetro';
 if(/DISTANCIA|DISTANCE|LONGITUD|ALTURA|ANCHURA|ANCHO|ESPESOR|ENTRE PLANOS|ENTRE CARAS/.test(t)) return 'Distancia';
 return 'Distancia / Dimensión';
}
function cpIsKcs(c){const map=loadKcsSelection(project);return !!map[String(c.number)]||!!c.kcs;}
function phase(){return loadJson(storeKey(ROUTE_KEY),{phase:'Producción',preparedBy:'Calidad',approvedBy:'',docNo:'PC-'+((project.meta||{}).reference||'REFERENCIA'),rev:'01'});}
function savePhaseField(field,value){const r=phase();r[field]=value;saveJson(storeKey(ROUTE_KEY),r);}
const BASE_ROWS=[
 {band:true,op:'010',title:'RECEPCIÓN DE MATERIA PRIMA'},
 {id:'base-010-1',op:'010',process:'Recepción MP',machine:'Almacén / recepción',controlClass:'Documental',characteristic:'Conformidad con pedido, albarán y documentación de lote',specification:'Referencia, cantidad, lote y certificado correctos según pedido/cliente',method:'Revisión documental',equipment:'Pedido / albarán / certificado',sample:'100%',frequency:'Cada recepción',owner:'Logística / Calidad',reaction:'Retener material; identificar no conforme; comunicar a compras/proveedor'},
 {id:'base-010-2',op:'010',process:'Recepción MP',machine:'Almacén / recepción',controlClass:'Producto',characteristic:'Estado visual del material y embalaje',specification:'Sin golpes, daños, oxidación, contaminación ni embalaje deteriorado',method:'Instrucción de recepción',equipment:'Visual / instrucción recepción',sample:'1 lote',frequency:'Cada recepción',owner:'Logística',reaction:'Bloquear material; abrir incidencia; avisar Calidad'},
 {band:true,op:'020',title:'MECANIZADO / PROCESO PRINCIPAL'},
 {subheader:true,op:'020',title:'Preparación de máquinas, herramientas y utillajes'},
 {id:'setup-020-1',op:'020',process:'Preparación de máquinas, herramientas y utillajes',machine:'Máquina / utillaje / garras',controlClass:'Subproceso',subClass:'setup',characteristic:'Localización de utillaje / garras',specification:'Listado ubicación de utillajes/garras vigente',method:'Checklist de arranque de producción',equipment:'Visual',sample:'1',frequency:'Inicio de cada lote de producción',owner:'Responsable de línea',reaction:'Avisar responsable de Producción; revisar listado de ubicación de utillaje/garras'},
 {id:'setup-020-2',op:'020',process:'Preparación de máquinas, herramientas y utillajes',machine:'Pañol / herramientas',controlClass:'Subproceso',subClass:'setup',characteristic:'Localización de herramientas',specification:'Pañol / tabla de herramientas vigente',method:'Checklist de arranque de producción',equipment:'Visual',sample:'100%',frequency:'Inicio de cada lote de producción',owner:'Responsable de línea',reaction:'Avisar responsable de Producción; revisar listado de ubicación de utillaje'},
 {id:'setup-020-3',op:'020',process:'Preparación de máquinas, herramientas y utillajes',machine:'CNC / programa',controlClass:'Subproceso',subClass:'setup',characteristic:'Parámetros CNC de máquina correctos',specification:'Tabla de herramientas / programa / correctores conforme a hoja de proceso',method:'Checklist de arranque de producción',equipment:'Verificación de programa',sample:'1',frequency:'Inicio de cada lote de producción',owner:'Responsable de línea',reaction:'Parar máquina; corregir parámetros; avisar responsable de Producción'},
 {id:'setup-020-4',op:'020',process:'Preparación de máquinas, herramientas y utillajes',machine:'Máquina / taladrina',controlClass:'Subproceso',subClass:'setup',characteristic:'Concentración de taladrina',specification:'5% - 7% o rango definido por mantenimiento/proceso',method:'Gama de mantenimiento',equipment:'Refractómetro',sample:'1',frequency:'Mensual',owner:'Operario',reaction:'Ajustar niveles de concentración; avisar responsable de línea'},
 {id:'setup-020-5',op:'020',process:'Preparación de máquinas, herramientas y utillajes',machine:'Máquina / amarre',controlClass:'Subproceso',subClass:'setup',characteristic:'Amarre de la pieza conforme',specification:'Conformidad con hoja técnica: presión de amarre y posicionadores',method:'Pareto de defectos / Hoja técnica',equipment:'Visual con manómetro en máquina',sample:'1',frequency:'Inicio de cada lote de producción / inicio cada turno',owner:'Responsable de línea',reaction:'Parar máquina; revisar amarres y corregir; rechazar pieza; revisar stock de piezas mecanizadas'},
 {subheader:true,op:'020',title:'Puesta a punto y controles previos de OP20'},
 {id:'setup-020-6',op:'020',process:'Puesta a punto',machine:'Máquina / CMM / medios control',controlClass:'Subproceso',subClass:'firstoff',characteristic:'Puesta a punto (verificación de 1ª pieza)',specification:'Especificaciones en pauta de control',method:'Informe tridimensional / Dimensional',equipment:'3D + medios de control',sample:'1',frequency:'Inicio de cada lote de producción / inicio cada turno',owner:'Calidad',reaction:'Rechazar pieza; ajustar parámetros de máquina; repetir protocolo de medición y reacción en siguiente pieza; parar producción si no controlado'},
 {id:'setup-020-7',op:'020',process:'Puesta a cero equipos',machine:'Medios de control a pie de máquina',controlClass:'Subproceso',subClass:'firstoff',characteristic:'Puesta a cero de los alexómetros / equipos de control',specification:'Puesta a cero correcta antes de uso',method:'Pauta de control',equipment:'Patrón / alexómetro / medio específico',sample:'1',frequency:'1/Turno',owner:'Operario / Calidad',reaction:'No medir hasta ajustar; repetir verificaciones afectadas'},
 {id:'setup-020-8',op:'020',process:'Control volante',machine:'Medios de control a pie de máquina',controlClass:'Subproceso',subClass:'firstoff',characteristic:'Control volante (verificación diaria)',specification:'3 cotas aleatorias por turno',method:'Informe control volante diario',equipment:'Equipos de control a pie de máquina',sample:'1',frequency:'3 cotas / 1 Turno; registro en informe control volante diario',owner:'Calidad',reaction:'Parar máquina si es necesario; corregir parámetros; avisar responsable de Producción'},
 {subheader:true,op:'020',title:'Características de producto asignadas a OP20'},
 {band:true,op:'030',title:'REBARBADO, LIMPIEZA Y SOPLADO'},
 {id:'base-030-1',op:'030',process:'Rebarbado',machine:'Banco rebarbado',controlClass:'Proceso',characteristic:'Ausencia de rebabas y aristas peligrosas',specification:'Sin rebabas cortantes ni restos de mecanizado en zonas funcionales',method:'Pauta de control',equipment:'Visual / útil manual',sample:'100%',frequency:'Cada pieza',owner:'Producción',reaction:'Repetir rebarbado; segregar pieza si no recuperable'},
 {id:'base-030-2',op:'030',process:'Limpieza / soplado',machine:'Aire comprimido / lavado',controlClass:'Proceso',characteristic:'Ausencia de viruta, suciedad y humedad',specification:'Pieza limpia; conductos y zonas críticas libres de viruta',method:'Pauta de control',equipment:'Aire comprimido / instrucción limpieza',sample:'100%',frequency:'Cada pieza / cada lote según proceso',owner:'Producción',reaction:'Repetir limpieza; revisar proceso si hay recurrencia'},
 {band:true,op:'050',title:'EMBALAJE, IDENTIFICACIÓN Y EXPEDICIÓN'},
 {id:'base-050-1',op:'050',process:'Embalaje',machine:'Zona embalaje',controlClass:'Proceso',characteristic:'Embalaje y protección conforme',specification:'Embalaje según especificación cliente; pieza protegida contra daños/transporte',method:'Instrucción de embalaje',equipment:'Instrucción embalaje / contenedor cliente',sample:'100%',frequency:'Cada envío',owner:'Logística',reaction:'Retener envío; corregir embalaje; avisar responsable'},
 {id:'base-050-2',op:'050',process:'Expedición',machine:'Almacén / sistema',controlClass:'Documental',characteristic:'Identificación, etiqueta y documentación de expedición',specification:'Referencia, revisión, lote, cantidad, albarán/RPS correctos',method:'Verificación documental',equipment:'Etiqueta / sistema / albarán',sample:'100%',frequency:'Cada envío',owner:'Logística',reaction:'Retener envío; corregir documentación/etiqueta antes de expedir'},
 {band:true,op:'060',title:'AUDITORÍAS Y VERIFICACIÓN DOCUMENTAL'},
 {id:'base-060-1',op:'060',process:'Auditoría proceso',machine:'Línea / proceso',controlClass:'Auditoría',characteristic:'Auditoría de proceso y cumplimiento de pauta',specification:'Proceso conforme a hoja de proceso, plan de control e instrucciones vigentes',method:'Auditoría proceso',equipment:'Checklist auditoría / registros',sample:'1',frequency:'Según plan auditorías',owner:'Calidad',reaction:'Abrir acción correctiva; contener lote/proceso si hay riesgo'},
 {id:'base-060-2',op:'060',process:'Auditoría producto',machine:'Producto terminado',controlClass:'Auditoría',characteristic:'Auditoría de producto terminado',specification:'Conformidad con plano, requisitos cliente y documentación de calidad',method:'Auditoría producto',equipment:'Plano / ISIR / informe dimensional / pauta',sample:'1',frequency:'Según plan auditorías / requisito cliente',owner:'Calidad',reaction:'Contención de lote; análisis causa; acción correctiva'}
];
const TEMPLATES={
 "040 LAVADO FINAL": {
  "op": "040",
  "process": "Lavado final",
  "machine": "Lavadora / soplado final",
  "controlClass": "Proceso",
  "characteristic": "Limpieza final de pieza",
  "specification": "Pieza limpia, seca y sin contaminación en zonas críticas",
  "method": "Proceso lavado + inspección visual",
  "equipment": "Lavadora / aire comprimido / instrucción limpieza",
  "sample": "1 lote",
  "frequency": "Cada lote",
  "owner": "Producción",
  "reaction": "Repetir lavado; retener lote si persiste contaminación"
 },
 "045 MARCADO": {
  "op": "045",
  "process": "Marcado",
  "machine": "Marcadora / láser / etiqueta",
  "controlClass": "Proceso",
  "characteristic": "Marcado e identificación de pieza",
  "specification": "Marcado legible, correcto y conforme a especificación cliente",
  "method": "Inspección visual",
  "equipment": "Patrón marcado / plano cliente",
  "sample": "100%",
  "frequency": "Cada pieza / cada lote según requisito",
  "owner": "Producción",
  "reaction": "Retener pieza/lote; corregir marcado; avisar Calidad"
 },
 "070 CONTROL FINAL": {
  "op": "070",
  "process": "Control final",
  "machine": "Zona calidad",
  "controlClass": "Producto",
  "characteristic": "Verificación final documental y visual",
  "specification": "Pieza conforme antes de expedición",
  "method": "Revisión final",
  "equipment": "Pauta control / ISIR / registros",
  "sample": "1",
  "frequency": "Cada lote",
  "owner": "Calidad",
  "reaction": "Retener lote; abrir no conformidad; definir disposición"
 },
 "035 LAVADO + SOPLADO": {
  "op": "035",
  "process": "Lavado + soplado",
  "machine": "Lavadora / zona soplado",
  "controlClass": "Proceso",
  "characteristic": "Ausencia de viruta, humedad y restos de proceso",
  "specification": "Pieza limpia y seca; conductos y zonas críticas sin contaminación",
  "method": "Visual + proceso de lavado",
  "equipment": "Lavadora / aire comprimido / instrucción limpieza",
  "sample": "100% / 1 lote",
  "frequency": "Cada lote / cada pieza según proceso",
  "owner": "Producción",
  "reaction": "Repetir lavado/soplado; retener lote si persiste contaminación"
 },
 "060 AUDITORIA PROCESO": {
  "op": "060",
  "process": "Auditoría proceso",
  "machine": "Línea / proceso productivo",
  "controlClass": "Auditoría",
  "characteristic": "Conformidad con proceso estandarizado",
  "specification": "Proceso conforme a hoja de proceso, plan de control e instrucciones",
  "method": "Auditoría de proceso",
  "equipment": "Informe auditoría de proceso / checklist",
  "sample": "1",
  "frequency": "Según planificación anual de auditorías",
  "owner": "Calidad",
  "reaction": "Abrir acción correctiva; contener proceso/lote si hay riesgo"
 },
 "061 AUDITORIA PRODUCTO": {
  "op": "061",
  "process": "Auditoría producto",
  "machine": "Producto terminado / zona calidad",
  "controlClass": "Auditoría",
  "characteristic": "Conformidad con requisitos cliente e internos",
  "specification": "Producto conforme a plano, ISIR, pauta y documentación de calidad",
  "method": "Auditoría producto",
  "equipment": "Plano / ISIR / informe dimensional / pauta",
  "sample": "1",
  "frequency": "Según planificación anual de auditorías de producto",
  "owner": "Calidad",
  "reaction": "Bloqueo de material y control 100% del lote si aplica"
 }
};

function cpTolWidth(c){
 const lo=cpNum(c?.lower??c?.li), up=cpNum(c?.upper??c?.ls);
 if(Number.isFinite(lo)&&Number.isFinite(up)) return Math.abs(up-lo);
 const raw=String(c?.value||c?.rawValue||c?.decodedValue||'').replace(',','.');
 const pm=raw.match(/±\s*([0-9.]+)/); if(pm) return Math.abs(parseFloat(pm[1])*2);
 return NaN;
}
function cpNominal(c){
 const candidates=[c?.nominal,c?.value,c?.rawValue,c?.decodedValue];
 for(const v of candidates){const n=cpNum(v); if(Number.isFinite(n)) return n;}
 return NaN;
}
function cpTextAll(c){return cpNorm([c?.value,c?.rawValue,c?.decodedValue,c?.featureType,c?.gdtType,c?.units,c?.unit].join(' '));}
const BASE_CONTROL_RULES=[
 {
  "id": "KCS_GEOMETRIC_SPECIAL",
  "priority": 2000,
  "kcs": true,
  "types": [
   "POSITION",
   "PROFILE",
   "FLATNESS",
   "ANGULARITY",
   "PARALLELISM",
   "PERPENDICULARITY",
   "CIRCULARITY",
   "CYLINDRICITY",
   "RUNOUT",
   "TOTAL_RUNOUT"
  ],
  "controlClass": "Producto",
  "method": "Control geométrico especial",
  "equipment": "3D / Máquina tridimensional CMM con programa validado",
  "sample": "1",
  "frequency": "KCS: 1 de cada 50 piezas o cambios/ajustes de herramienta",
  "owner": "Calidad / Metrología",
  "reaction": "KCS: rechazar pieza; contención inmediata desde última pieza OK; ajustar parámetros o utillaje; repetir protocolo; parar producción si no controlado",
  "reason": "Criterio extraído de planes reales: KCS geométricas se controlan por 3D con frecuencia reforzada 1/50 o cambio/ajuste."
 },
 {
  "id": "KCS_DIMENSIONAL_SPECIAL",
  "priority": 1950,
  "kcs": true,
  "types": [
   "DIMENSION",
   "DIMENSIONAL",
   "DIAMETER",
   "DEPTH",
   "RADIUS",
   "ANGLE",
   "THREAD"
  ],
  "controlClass": "Producto",
  "method": "Medición dimensional especial",
  "equipment": "Medio dedicado según característica + verificación 3D si aplica",
  "sample": "3",
  "frequency": "KCS: 1 de cada 50 piezas o cambios/ajustes de herramienta",
  "owner": "Producción / Calidad",
  "reaction": "KCS: contención inmediata desde última pieza OK; ajustar proceso; verificar pieza siguiente antes de continuar; registrar acción correctiva",
  "reason": "KCS dimensional: reglas históricas elevan frecuencia, muestra y reacción respecto a dimensional estándar."
 },
 {
  "id": "THREAD_GO_NOGO",
  "priority": 1800,
  "textAny": [
   "ROSCA",
   "ROSCADO",
   "THREAD",
   "MACHO",
   "6H",
   "6G",
   " M6",
   " M8",
   " M10",
   " M12",
   " M16",
   " M20"
  ],
  "controlClass": "Producto",
  "method": "Control funcional de rosca",
  "equipment": "Tampón de rosca P/NP calibrado + pie de rey si controla profundidad/altura",
  "sample": "2",
  "frequency": "Inicio de la serie, cambio o rotura de herramienta",
  "owner": "Calidad / Producción",
  "reaction": "Rechazar pieza; revisar macho/herramienta; ajustar proceso; contener lote desde última verificación OK",
  "reason": "129 líneas históricas: roscas se controlan con tampón P/NP; frecuencia típica inicio serie y cambio/rotura de herramienta."
 },
 {
  "id": "ROUGHNESS_RA_RZ",
  "priority": 1750,
  "textAny": [
   "RUGOSIDAD",
   " RA ",
   "RA ",
   " RZ ",
   "RZ "
  ],
  "controlClass": "Producto",
  "method": "Medición de rugosidad",
  "equipment": "Rugosímetro calibrado",
  "sample": "1",
  "frequency": "Inicio de la serie / inicio y final del lote / 1 turno según criticidad",
  "owner": "Calidad / Producción",
  "reaction": "Revisar herramienta y parámetros de corte; repetir control; contener lote si NOK",
  "reason": "112 líneas históricas: rugosidad casi siempre con rugosímetro e informe de muestras iniciales/pauta."
 },
 {
  "id": "POSITION_3D",
  "priority": 1700,
  "types": [
   "POSITION"
  ],
  "controlClass": "Producto",
  "method": "Control geométrico de posición",
  "equipment": "3D / Máquina tridimensional CMM",
  "sample": "1",
  "frequency": "Inicio y final del lote",
  "owner": "Calidad / Metrología",
  "reaction": "Rechazar pieza; ajustar parámetros o utillaje; repetir protocolo de medición; contener producto no controlado",
  "reason": "107 posiciones históricas: equipo 3D, muestra 1, frecuencia dominante inicio y final de lote."
 },
 {
  "id": "PROFILE_SURFACE_3D",
  "priority": 1690,
  "types": [
   "PROFILE"
  ],
  "controlClass": "Producto",
  "method": "Control geométrico de perfil de superficie",
  "equipment": "3D / Máquina tridimensional CMM",
  "sample": "1",
  "frequency": "Inicio y final del lote",
  "owner": "Calidad / Metrología",
  "reaction": "Rechazar pieza; revisar amarre/programa/proceso; repetir medición; contener lote si NOK",
  "reason": "Perfiles históricos: se controlan en 3D, incluyendo forma y ubicación del elemento."
 },
 {
  "id": "FLATNESS_3D",
  "priority": 1685,
  "types": [
   "FLATNESS"
  ],
  "controlClass": "Producto",
  "method": "Control de planitud",
  "equipment": "3D / CMM / útil de forma si aplica",
  "sample": "1",
  "frequency": "Inicio y final del lote",
  "owner": "Calidad / Metrología",
  "reaction": "Rechazar pieza; revisar apoyo, amarre y deformaciones; repetir medición",
  "reason": "Planitud histórica: control de forma con 3D e inicio/final de lote."
 },
 {
  "id": "ORIENTATION_3D",
  "priority": 1680,
  "types": [
   "ANGULARITY",
   "PARALLELISM",
   "PERPENDICULARITY",
   "CIRCULARITY",
   "CYLINDRICITY",
   "RUNOUT",
   "TOTAL_RUNOUT"
  ],
  "controlClass": "Producto",
  "method": "Control geométrico de forma/orientación",
  "equipment": "3D / Máquina tridimensional CMM",
  "sample": "1",
  "frequency": "Inicio y final del lote",
  "owner": "Calidad / Metrología",
  "reaction": "Rechazar pieza; ajustar amarre/parámetros; repetir protocolo; contener producto no controlado",
  "reason": "Orientación/formas históricas: 3D como medio principal e inicio/final de lote."
 },
 {
  "id": "DIAMETER_H_TOLERANCE",
  "priority": 1600,
  "textAny": [
   " H7",
   " H6",
   " H8",
   "(+0,018)",
   "+0,018",
   "+ 0,037",
   "+0,037"
  ],
  "controlClass": "Producto",
  "method": "Medición dimensional de diámetro de precisión",
  "equipment": "Alexómetro / micrómetro interior 3 contactos / tampón liso P/NP si aplica",
  "sample": "1",
  "frequency": "1/Turno / cambio o ajuste de herramienta",
  "owner": "Operario / Calidad",
  "reaction": "Rechazar pieza; ajustar corrector; revisar herramienta; repetir control en pieza siguiente",
  "reason": "Diámetros con tolerancia tipo H7/H6: planes históricos usan alexómetro, micrómetro 3 contactos o tampón liso."
 },
 {
  "id": "DIAMETER_TIGHT",
  "priority": 1580,
  "types": [
   "DIAMETER"
  ],
  "tolMax": 0.05,
  "controlClass": "Producto",
  "method": "Medición dimensional de precisión",
  "equipment": "Alexómetro / micrómetro 3 contactos / CMM según acceso",
  "sample": "1",
  "frequency": "Registro 1/Turno + medición/registro en ajuste, rotura o cambio de herramienta",
  "owner": "Operario / Calidad",
  "reaction": "Rechazar pieza; ajustar corrector; revisar herramienta; verificar pieza siguiente; contener lote si NOK",
  "reason": "Diámetro con tolerancia estrecha: criterio repetido en planes con control reforzado."
 },
 {
  "id": "DIAMETER_STANDARD",
  "priority": 1540,
  "types": [
   "DIAMETER"
  ],
  "controlClass": "Producto",
  "method": "Medición dimensional de diámetro",
  "equipment": "Alexómetro / micrómetro / pie de rey / CMM según acceso y tamaño",
  "sample": "2",
  "frequency": "Inicio de serie / 1 Turno / cambio herramienta",
  "owner": "Producción / Calidad",
  "reaction": "Ajustar corrector; revisar herramienta; controlar pieza siguiente; segregar NOK",
  "reason": "258 diámetros históricos: equipo depende de acceso/tolerancia; frecuencia base inicio serie o 1/turno."
 },
 {
  "id": "DEPTH_DIGITAL_PROBE",
  "priority": 1500,
  "types": [
   "DEPTH"
  ],
  "textAny": [
   "PROFUNDIDAD",
   "DEPTH",
   "PRF",
   "FONDO"
  ],
  "controlClass": "Producto",
  "method": "Medición dimensional de profundidad",
  "equipment": "Sonda digital / sonda de profundidad / pie de rey / CMM según acceso",
  "sample": "2",
  "frequency": "Inicio de la serie / inicio y final del lote / 1 Turno según criticidad",
  "owner": "Producción / Calidad",
  "reaction": "Ajustar corrector o herramienta; verificar siguiente pieza; contener lote si NOK",
  "reason": "Profundidades históricas: pie de rey/sonda digital/3D con frecuencia inicio serie o inicio/final lote."
 },
 {
  "id": "RADIUS_TEMPLATE_PRESETTING",
  "priority": 1480,
  "types": [
   "RADIUS"
  ],
  "textAny": [
   "RADIO",
   "RADIUS",
   " R"
  ],
  "controlClass": "Producto",
  "method": "Control de radio",
  "equipment": "Plantilla de radios / presetting / proyector / CMM si aplica",
  "sample": "2",
  "frequency": "Inicio de la serie / inicio del lote",
  "owner": "Calidad / Producción",
  "reaction": "Ajustar herramienta; verificar pieza siguiente; segregar pieza NOK",
  "reason": "Radios históricos: plantilla de radios + presetting como patrón dominante."
 },
 {
  "id": "CHAMFER_PRESETTING",
  "priority": 1460,
  "textAny": [
   "CHAFLAN",
   "CHAF",
   "AVELLANADO"
  ],
  "controlClass": "Producto",
  "method": "Control dimensional de chaflán",
  "equipment": "Pie de rey + presetting / proyector / CMM si aplica",
  "sample": "2",
  "frequency": "Inicio de la serie",
  "owner": "Calidad / Producción",
  "reaction": "Ajustar herramienta; repetir control; segregar piezas NOK",
  "reason": "Chaflanes históricos: pie de rey/presetting con muestra 2 e inicio de serie."
 },
 {
  "id": "ANGLE_STANDARD",
  "priority": 1440,
  "types": [
   "ANGLE"
  ],
  "textAny": [
   "ANGULO",
   "ANGLE",
   "°"
  ],
  "controlClass": "Producto",
  "method": "Medición angular",
  "equipment": "Presetting / pie de rey / goniómetro / CMM según acceso",
  "sample": "2",
  "frequency": "Inicio de la serie / inicio y final del lote si control 3D",
  "owner": "Calidad / Producción",
  "reaction": "Ajustar herramienta o amarre; verificar siguiente pieza; contener lote si NOK",
  "reason": "Ángulos y chaflanes históricos: presetting o 3D según naturaleza de la cota."
 },
 {
  "id": "DISTANCE_BETWEEN_PLANES_TIGHT",
  "priority": 1380,
  "types": [
   "DIMENSION",
   "DIMENSIONAL"
  ],
  "textAny": [
   "DISTANCIA ENTRE PLANOS",
   "DISTANCIA ENTRE CARAS",
   "ENTRE PLANOS",
   "ENTRE CARAS"
  ],
  "tolMax": 0.1,
  "controlClass": "Producto",
  "method": "Medición dimensional de precisión",
  "equipment": "Micrómetro exteriores / gramil de alturas / CMM según acceso",
  "sample": "1",
  "frequency": "1/Turno",
  "owner": "Operario / Calidad",
  "reaction": "Ajustar corrector; repetir control en pieza siguiente; segregar NOK",
  "reason": "Distancias entre planos estrechas históricas: micrómetro/gramil y frecuencia 1/turno."
 },
 {
  "id": "DATUM_OR_INTERSECTION_3D",
  "priority": 1360,
  "textAny": [
   "DATUM",
   "PUNTO INTERSECCION",
   "PUNTO DE INTERSECCION",
   "CENTRO A PUNTO",
   "EJE"
  ],
  "controlClass": "Producto",
  "method": "Control dimensional/geométrico por CMM",
  "equipment": "3D / Máquina tridimensional CMM",
  "sample": "1",
  "frequency": "Inicio y final del lote",
  "owner": "Calidad / Metrología",
  "reaction": "Rechazar pieza; ajustar parámetros; repetir medición; contener producto no controlado",
  "reason": "Cotas con datums, intersecciones o ejes se controlan habitualmente en 3D."
 },
 {
  "id": "STANDARD_3D_DIMENSION",
  "priority": 1300,
  "types": [
   "DIMENSION",
   "DIMENSIONAL"
  ],
  "nominalMin": 80,
  "controlClass": "Producto",
  "method": "Medición dimensional por CMM si figura en informe tridimensional",
  "equipment": "3D / CMM o medio dedicado según acceso",
  "sample": "1",
  "frequency": "Inicio y final del lote",
  "owner": "Calidad",
  "reaction": "Rechazar pieza; ajustar parámetros; repetir protocolo de medición; contener lote si NOK",
  "reason": "En planes grandes, dimensiones de referencia/longitud elevadas suelen controlarse por 3D al inicio y final de lote."
 },
 {
  "id": "STANDARD_DIMENSION",
  "priority": 1000,
  "types": [
   "DIMENSION",
   "DIMENSIONAL"
  ],
  "controlClass": "Producto",
  "method": "Medición dimensional",
  "equipment": "Pie de rey / micrómetro / calibre / CMM según acceso",
  "sample": "2",
  "frequency": "Inicio de serie / 1 Turno",
  "owner": "Producción / Calidad",
  "reaction": "Ajustar máquina; verificar herramienta; repetir control; segregar piezas NOK",
  "reason": "Dimensional estándar histórico: medio simple o 3D según acceso y criticidad."
 },
 {
  "id": "PROCESS_VISUAL_GENERIC",
  "priority": 500,
  "textAny": [
   "REBABA",
   "REBARBADO",
   "LIMPIEZA",
   "SOPLADO",
   "EMBALAJE",
   "CONFORMIDAD",
   "IDENTIFICACION",
   "MARCADO"
  ],
  "controlClass": "Proceso",
  "method": "Inspección visual / documental según operación",
  "equipment": "Visual / instrucción / RPS / checklist",
  "sample": "100% / 1 lote según operación",
  "frequency": "Cada pieza / cada lote",
  "owner": "Producción / Logística",
  "reaction": "Retener pieza/lote; corregir operación; avisar responsable si reincide",
  "reason": "Operaciones de proceso/documental extraídas de planes: control visual/documental recurrente."
 },
 {
  "id": "UNKNOWN_REVIEW",
  "priority": 1,
  "controlClass": "Producto",
  "method": "Definir método de control",
  "equipment": "Definir equipo / medio de control",
  "sample": "1",
  "frequency": "Definir frecuencia",
  "owner": "Calidad",
  "reaction": "Validar característica antes de liberar el plan",
  "reason": "Sin regla específica: requiere revisión de Calidad antes de liberar documentación."
 }
];
function loadRuleLibrary(){
 const custom=loadJson(storeKey(RULE_KEY),null);
 if(Array.isArray(custom)&&custom.length) return custom;
 return BASE_CONTROL_RULES;
}
function saveRuleLibrary(rules){saveJson(storeKey(RULE_KEY),rules||BASE_CONTROL_RULES);}
function resetRuleLibrary(){if(confirm('Restaurar reglas base del motor de Plan de Control?')){localStorage.removeItem(storeKey(RULE_KEY));render();}}
function exportRules(){const blob=new Blob([JSON.stringify(loadRuleLibrary(),null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='motor_reglas_plan_control_V229_metodo_control.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);}
function importRules(ev){const f=ev.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const arr=JSON.parse(r.result);if(!Array.isArray(arr))throw new Error('Debe ser un array de reglas');saveRuleLibrary(arr);render();}catch(e){alert('No se pudo importar reglas: '+e.message);}};r.readAsText(f,'utf-8');}
function ruleMatches(rule,c){
 const t=cpType(c), k=cpIsKcs(c), tol=cpTolWidth(c), nom=cpNominal(c), txt=cpTextAll(c);
 if(rule.kcs===true && !k) return false;
 if(rule.kcs===false && k) return false;
 if(rule.types && rule.types.length && !rule.types.includes(t)) return false;
 if(rule.tolMax!=null && (!Number.isFinite(tol)||tol>Number(rule.tolMax))) return false;
 if(rule.tolMin!=null && (!Number.isFinite(tol)||tol<Number(rule.tolMin))) return false;
 if(rule.nominalMax!=null && (!Number.isFinite(nom)||Math.abs(nom)>Number(rule.nominalMax))) return false;
 if(rule.nominalMin!=null && (!Number.isFinite(nom)||Math.abs(nom)<Number(rule.nominalMin))) return false;
 if(rule.textAny && rule.textAny.length && !rule.textAny.some(x=>txt.includes(cpNorm(x)))) return false;
 if(rule.textAll && rule.textAll.length && !rule.textAll.every(x=>txt.includes(cpNorm(x)))) return false;
 return true;
}
function selectControlRule(c){
 const rules=loadRuleLibrary().slice().sort((a,b)=>(Number(b.priority)||0)-(Number(a.priority)||0));
 return rules.find(r=>ruleMatches(r,c)) || BASE_CONTROL_RULES[BASE_CONTROL_RULES.length-1];
}
function isDiameterType(c){
 const t=cpNorm([cpType(c),cpTextAll(c),c?.value,c?.rawValue,c?.decodedValue].join(' '));
 return t.includes('DIAMETER') || t.includes('DIAMETRO') || t.includes('DIAM') || t.includes('Ø') || t.includes('⌀');
}
function diameterEquipmentByTolerance(c){
 const tol=cpTolWidth(c);
 if(Number.isFinite(tol)){
   if(tol<=0.05) return 'Calidad: Tridimensional CMM / PC-DMIS. Operario: alexómetro o micrómetro de 3 contactos.';
   if(tol<=0.10) return 'Calidad: Tridimensional CMM / PC-DMIS. Operario: alexómetro / micrómetro según acceso.';
   if(tol<=0.30) return 'Calidad: Tridimensional CMM / PC-DMIS. Operario: micrómetro / alexómetro / calibre específico.';
   return 'Calidad: Tridimensional CMM / PC-DMIS. Operario: pie de rey / micrómetro según diámetro y acceso.';
 }
 const txt=cpTextAll(c);
 if(txt.includes('H7')||txt.includes('H6')||txt.includes('H5')) return 'Calidad: Tridimensional CMM / PC-DMIS. Operario: alexómetro o tampón/calibre funcional según diámetro.';
 return 'Calidad: Tridimensional CMM / PC-DMIS. Operario: equipo dimensional definido en pauta.';
}
function diameterFrequencyByTolerance(c,kcs){
 const tol=cpTolWidth(c);
 if(kcs) return 'KCS: inicio serie + 1/50 piezas + cambios/ajustes de herramienta; registrar autocontrol operario.';
 if(Number.isFinite(tol)){
   if(tol<=0.05) return 'Inicio serie + 1/turno + cambio herramienta; autocontrol operario según pauta.';
   if(tol<=0.10) return 'Inicio serie + 1/turno + cambio herramienta.';
   if(tol<=0.30) return 'Inicio serie + frecuencia de proceso / 1 turno.';
 }
 return 'Inicio serie + control periódico según pauta de fabricación.';
}

function cpMeasureObjectForChar(c){
 const n=String(c?.number??'').trim();
 if(!n) return null;
 const results=c?.results||{};
 for(const key of Object.keys(results)){
   const r=results[key];
   const arr=[].concat(Array.isArray(r?.rawItems)?r.rawItems:[], Array.isArray(r?.items)?r.items:[]);
   if(arr.length) return r;
 }
 const all=project?.allPcdmisMeasures||{};
 for(const piece of Object.keys(all)){
   const map=all[piece]||{};
   const hit=map[n] || map[String(parseInt(n,10))];
   if(hit){
     const arr=[].concat(Array.isArray(hit?.rawItems)?hit.rawItems:[], Array.isArray(hit?.items)?hit.items:[]);
     if(arr.length) return hit;
   }
 }
 return null;
}
function cpHasPcdmisMeasure(c){ return !!cpMeasureObjectForChar(c); }
function cpFeatureText(c){ return cpNorm([c?.value,c?.rawValue,c?.decodedValue,c?.featureType,c?.gdtType,c?.units,c?.unit].join(' ')); }
function cpMainNumber(c){
 const txt=String([c?.value,c?.rawValue,c?.decodedValue].join(' ')).replace(',','.');
 const m=txt.match(/-?\d+(?:\.\d+)?/);
 return m ? parseFloat(m[0]) : NaN;
}
function cpIsRoughness(c){ const t=cpFeatureText(c); return /\bRA\b|\bRZ\b|RUGOSIDAD|ROUGHNESS/.test(t); }
function cpIsChamfer(c){ const t=cpFeatureText(c); return /CHAFLAN|CHAMFER|AVELLANADO|\bX\s*\d+(?:[\.,]\d+)?\s*(?:°|GRAD|DEG)|(?:°|GRAD|DEG)/.test(t) && (t.includes('Ø')||t.includes('DIAM')||/\bX\b/.test(t)); }
function cpIsRadius(c){ const t=cpFeatureText(c); return /RADIO|RADIUS|\bR\s*\d/.test(t) || cpType(c)==='RADIUS'; }
function cpIsDepth(c){ const t=cpFeatureText(c); return /PROFUNDIDAD|DEPTH|\bPROF\b|FONDO/.test(t) || cpType(c)==='DEPTH'; }
function cpIsThreadDepth(c){ const t=cpFeatureText(c); return cpIsDepth(c) && (/ROSCA|THREAD|ROSCADO|MACHO|\bM\d+/.test(t)); }
function cpIsDistance(c){ const t=cpFeatureText(c); const typ=cpType(c); return /DISTANCIA|DISTANCE|LONGITUD|ALTURA|ANCHURA|ANCHO|ESPESOR|ENTRE PLANOS|ENTRE CARAS/.test(t) || ['DIMENSION','DIMENSIONAL'].includes(typ); }
function missingPcdmisControlRule(c,r){
 const out=Object.assign({},r);
 const k=cpIsKcs(c);
 const radiusValue=Math.abs(cpMainNumber(c));
 out.controlClass='Producto';
 out.sample=k?'3':'2';
 out.frequency=k?'1 pieza al turno':'Inicio y final del lote';
 out.owner='Calidad';
 out.reaction=k
   ? 'KCS: contención inmediata; bloquear lote desde última pieza OK; avisar Calidad y Producción; repetir control antes de continuar.'
   : 'Si NOK: retener pieza/lote, avisar Calidad y Producción, ajustar proceso y repetir control.';
 out.criteria='Regla V229: característica de Inspection no localizada en PC-DMIS; se controla fuera de programa 3D con método específico.';
 if(cpIsRoughness(c)){
   out.method='Pauta de control';
   out.equipment='Rugosímetro calibrado';
   out.criteria+=' Rugosidad detectada.';
   return out;
 }
 if(cpIsThreadDepth(c)){
   out.method='Pauta de control';
   out.equipment='Pie de rey / sonda de profundidad según acceso';
   out.criteria+=' Profundidad de rosca detectada.';
   return out;
 }
 if(cpIsChamfer(c)){
   out.method='Pauta de control';
   out.equipment='Pie de rey + Presetting';
   out.criteria+=' Chaflán/ángulo detectado.';
   return out;
 }
 if(cpIsRadius(c)){
   out.method='Pauta de control';
   out.equipment=Number.isFinite(radiusValue) && radiusValue<=10 ? 'Plantilla de radios + Presetting' : 'Presetting';
   out.criteria+=Number.isFinite(radiusValue) && radiusValue<=10 ? ' Radio <= 10.' : ' Radio > 10 o sin valor fiable.';
   return out;
 }
 if(isDiameterType(c)){
   out.method='Pauta de control';
   out.equipment='Pie de rey';
   out.criteria+=' Diámetro sin resultado PC-DMIS.';
   return out;
 }
 if(cpIsDistance(c)){
   out.method='Pauta de control';
   out.equipment='Pie de rey / Gramil de alturas';
   out.criteria+=' Distancia/cota dimensional sin resultado PC-DMIS.';
   return out;
 }
 out.method='Informe dimensional';
 out.equipment='Informe dimensional / revisión de registro';
 return out;
}
function enhanceInspectionRule(c,r){
 const out=Object.assign({},r);
 const k=cpIsKcs(c);
 const dia=isDiameterType(c);
 if(!cpHasPcdmisMeasure(c)) return missingPcdmisControlRule(c,out);
 out.controlClass='Producto';
 if(dia){
   out.method='Informe tridimensional / Dimensional + Pauta de control';
   out.equipment=diameterEquipmentByTolerance(c);
   out.frequency=k?'1 pieza al turno':diameterFrequencyByTolerance(c,k);
   out.owner='Calidad + Operario';
   out.sample=k?'1':'1';
   out.reaction=k
     ? 'KCS: contención inmediata desde última pieza OK; ajustar corrector/herramienta; verificar pieza siguiente en 3D y autocontrol antes de continuar.'
     : 'Ajustar corrector o herramienta; repetir autocontrol; escalar a Calidad si hay desviación o tendencia.';
   out.criteria='Regla V228: diámetro procedente de Inspection/PC-DMIS = verificación 3D obligatoria + autocontrol operario según tolerancia/rango.';
   return out;
 }
 out.method='Informe tridimensional / Dimensional';
 out.equipment='Tridimensional CMM / PC-DMIS';
 out.owner='Calidad / Metrología';
 out.sample=k?'1':'1';
 out.frequency=k?'KCS: inicio serie + 1/50 piezas + cambios/ajustes de herramienta':'Inicio serie + 1/turno / cambios y ajustes de proceso';
 out.reaction=k
   ? 'KCS: bloquear lote desde última pieza OK; avisar Calidad y Producción; repetir medición 3D; registrar acción correctiva.'
   : (out.reaction||'Rechazar pieza si NOK; ajustar proceso; repetir medición 3D y contener lote si aplica.');
 out.criteria='Regla V229: toda característica con resultado PC-DMIS se controla por 3D; las no presentes usan método de control específico.';
 return out;
}
function defaultRule(c){
 const r=selectControlRule(c);
 const base={controlClass:r.controlClass||'Producto',method:r.method||'',equipment:r.equipment||'',sample:r.sample||'',frequency:r.frequency||'',owner:r.owner||'',reaction:r.reaction||'',criteria:r.reason||r.id||'Regla aplicada'};
 return enhanceInspectionRule(c,base);
}
function renderRuleCards(){
 const rules=loadRuleLibrary().slice().sort((a,b)=>(Number(b.priority)||0)-(Number(a.priority)||0)).slice(0,8);
 return `<div class="ruleGrid">${rules.map(r=>`<div class="ruleCard"><b>${esc(r.id||'Regla')}</b><span>Prioridad ${esc(r.priority||'')} · ${esc((r.types||[]).join(', ')||'Todos')}<br>${esc(r.reason||'')}</span></div>`).join('')}</div>`;
}
function loadOverrides(){return loadJson(storeKey(OV_KEY),{});}function saveOverrides(o){saveJson(storeKey(OV_KEY),o);}function rowKey(row){return row.key||row.id||('row_'+row.op+'_'+row.characteristic);}function getVal(row,field){const o=loadOverrides();const k=rowKey(row);return o[k]&&Object.prototype.hasOwnProperty.call(o[k],field)?o[k][field]:(row[field]??'');}function setVal(k,field,val){const o=loadOverrides();o[k]=o[k]||{};o[k][field]=val;saveOverrides(o);}function edit(row,field,cls=''){const k=rowKey(row),v=getVal(row,field);const long=['method','equipment','frequency','owner','reaction','specification','characteristic','criteria'].includes(field);if(long)return `<textarea class="pcEdit pcArea ${cls}" onchange="setVal('${esc(k)}','${field}',this.value)" oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px'">${esc(v)}</textarea>`;return `<input class="pcEdit ${cls}" value="${esc(v)}" onchange="setVal('${esc(k)}','${field}',this.value)">`;}
function charRows(){const chars=(project.characteristics||[]);return chars.map(c=>{const rule=defaultRule(c);return {key:'char_'+c.number,source:'inspection',op:'020',process:'Mecanizado',machine:'Máquina asignada / medio productivo',globo:String(c.number),kcs:cpIsKcs(c),controlClass:rule.controlClass,featureType:cpType(c),product:cpProductCategory(c),characteristic:cpOriginalCharacteristic(c),specification:cpPlanSpec(c),method:rule.method,equipment:rule.equipment,sample:rule.sample,frequency:rule.frequency,owner:rule.owner,reaction:rule.reaction,criteria:rule.criteria};});}
function cpRangeFromNumbers(nums){
 const arr=[...new Set(nums.map(n=>parseInt(n,10)).filter(Number.isFinite))].sort((a,b)=>a-b);
 const parts=[];let start=null,prev=null;
 arr.forEach(n=>{if(start===null){start=prev=n;return;}if(n===prev+1){prev=n;return;}parts.push(start===prev?String(start):(start+'-'+prev));start=prev=n;});
 if(start!==null)parts.push(start===prev?String(start):(start+'-'+prev));
 return parts.join(', ');
}
function cpGroupKey(r){return [r.kcs?'KCS':'STD',r.method,r.equipment,r.sample,r.frequency,r.owner,r.reaction,r.controlClass].map(x=>String(x||'')).join('||');}
function groupedCharRows(){
 // V233: las cotas vuelven a ser INDIVIDUALES. No se agrupan en rangos.
 // Mantener el nombre evita tocar otras partes del flujo, pero devuelve cada cota con su globo y característica.
 return charRows();
}
function loadLibrary(){return loadJson(storeKey(LIB_KEY),[]);}function saveLibrary(a){saveJson(storeKey(LIB_KEY),a||[]);}function addTemplate(name){const t=Object.assign({},TEMPLATES[name]||{});if(!t.op)return;const lib=loadLibrary();t.id='lib_'+Date.now();lib.push(t);saveLibrary(lib);render();}function addCustomOp(){const lib=loadLibrary();lib.push({id:'lib_'+Date.now(),op:document.getElementById('newOp').value||'040',process:document.getElementById('newProcess').value||'Operación añadida',machine:document.getElementById('newMachine').value||'',controlClass:document.getElementById('newClass').value||'Proceso',characteristic:document.getElementById('newChar').value||'',specification:document.getElementById('newSpec').value||'',method:document.getElementById('newMethod').value||'',equipment:document.getElementById('newEquip').value||'',sample:document.getElementById('newSample').value||'',frequency:document.getElementById('newFreq').value||'',owner:document.getElementById('newOwner').value||'',reaction:document.getElementById('newReact').value||''});saveLibrary(lib);render();}function deleteLib(id){if(!confirm('Eliminar operación de biblioteca?'))return;saveLibrary(loadLibrary().filter(x=>x.id!==id));render();}
function allRows(){const lib=loadLibrary().map(x=>Object.assign({source:'library'},x));const rows=[];BASE_ROWS.forEach(r=>{
 rows.push(r);
 if(r.subheader && String(r.title||'').includes('Características de producto asignadas a OP20')){
   groupedCharRows().forEach(c=>rows.push(c));
   lib.filter(x=>String(x.op||'').padStart(3,'0')>='020'&&String(x.op||'').padStart(3,'0')<'030').forEach(x=>rows.push(x));
 }
});lib.filter(x=>{const op=String(x.op||'').padStart(3,'0');return op<'020'||op>='030';}).forEach(x=>rows.push(x));return rows;}
function badge(row){if(row.kcs)return '<span class="pcBadge kcs">KCS</span>';const c=cpNorm(row.controlClass);if(c.includes('DOCUMENT'))return '<span class="pcBadge doc">Documental</span>';if(c.includes('AUDIT'))return '<span class="pcBadge audit">Auditoría</span>';if(c.includes('PROCES'))return '<span class="pcBadge proc">Proceso</span>';return '<span class="pcBadge prod">Producto</span>';}
function filteredRows(){const q=cpNorm(document.getElementById('filterText')?.value||'');const mode=document.getElementById('filterMode')?.value||'ALL';let rows=allRows();if(mode==='KCS')rows=rows.filter(r=>r.band||r.kcs);if(mode==='INSPECTION')rows=rows.filter(r=>r.band||r.source==='inspection');if(mode==='BASE')rows=rows.filter(r=>r.band||(!r.source||r.source==='base'));if(q)rows=rows.filter(r=>r.band||cpNorm(Object.values(r).join(' ')).includes(q));return rows;}
function rowProductText(r){
 const cls=cpNorm(r.controlClass);
 if(r.source==='inspection') return getVal(r,'product') || cpProductCategory(r);
 if(cls.includes('PRODUCT') || cls.includes('DOCUMENT')) return getVal(r,'characteristic');
 return '';
}
function rowProcessText(r){
 const cls=cpNorm(r.controlClass);
 if(r.source==='inspection') return '';
 if(cls.includes('PRODUCT') || cls.includes('DOCUMENT')) return '';
 return getVal(r,'characteristic');
}
function renderKcCell(r){
 return r.kcs ? '<span class="kcMark">KCS</span>' : '<span class="kcBlank">—</span>';
}
function renderTable(rows){
 let html='';
 rows.forEach(r=>{
  if(r.band){html+=`<tr class="opBand"><td colspan="15">OP ${esc(r.op)} · ${esc(r.title)}</td></tr>`;return;}
  if(r.subheader){html+=`<tr class="substepRow"><td></td><td colspan="14"><b>${esc(r.title)}</b></td></tr>`;return;}
  const src=(r.source==='inspection'?'inspectionRow':(r.source==='library'?'libraryRow':(r.controlClass==='Subproceso'?(r.subClass==='firstoff'?'firstoffRow':'setupRow'):'baseRow')));
  html+=`<tr class="${src} ${r.kcs?'kcsRow':''}">
<td class="colOp">${edit(r,'op','op')}</td>
<td class="colProc">${edit(r,'process')}</td>
<td class="colMach">${edit(r,'machine')}</td>
<td class="pcCenter colNo">${esc(r.globo||'')}</td>
<td class="colProd">${rowProductText(r) ? edit(r, r.source==='inspection'?'product':'characteristic') : ''}</td>
<td class="colProcessChar">${rowProcessText(r) ? edit(r,'characteristic') : ''}</td>
<td class="kcCell colKc">${renderKcCell(r)}</td>
<td class="colSpec">${edit(r,'specification')}</td>
<td class="colLimits">${edit(r,'limits')}</td>
<td class="colEquip">${edit(r,'equipment')}</td>
<td class="colSample">${edit(r,'sample','sample')}</td>
<td class="colFreq">${edit(r,'frequency')}</td>
<td class="colOwner">${edit(r,'owner')}</td>
<td class="colMethod">${edit(r,'method')}</td>
<td class="colReaction">${edit(r,'reaction')}</td>
</tr>`;
 });
 return html;
}
function exportCsv(){
 const rows=allRows().filter(r=>!r.band&&!r.subheader);
 const headers=['OP','Descripción operación','Máquina/útiles','Nº característica','Producto','Proceso','KC','Especificación/Tolerancia','Límites de control','Instrumento de evaluación/medida','Tamaño muestra','Frecuencia de muestreo','Realizado por','Método de control','Plan de reacción'];
 const lines=[headers.join(';')];
 rows.forEach(r=>{
   lines.push([
    getVal(r,'op'),getVal(r,'process'),getVal(r,'machine'),r.globo||'',rowProductText(r),rowProcessText(r),r.kcs?'KCS':'',
    getVal(r,'specification'),getVal(r,'limits'),getVal(r,'equipment'),getVal(r,'sample'),getVal(r,'frequency'),getVal(r,'owner'),getVal(r,'method'),getVal(r,'reaction')
   ].map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(';'));
 });
 const blob=new Blob([lines.join('\n')],{type:'text/csv;charset=utf-8'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='plan_control_'+((project.meta||{}).reference||'referencia')+'_V234.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);
}
function exportLibrary(){const blob=new Blob([JSON.stringify(loadLibrary(),null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='biblioteca_operaciones_plan_control.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);}function importLibrary(ev){const f=ev.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const arr=JSON.parse(r.result);if(!Array.isArray(arr))throw new Error('Formato no válido');saveLibrary(arr);render();}catch(e){alert('No se pudo importar: '+e.message);}};r.readAsText(f,'utf-8');}
function clearEdits(){if(confirm('Borrar cambios manuales del plan para esta referencia?')){localStorage.removeItem(storeKey(OV_KEY));render();}}
function render(){project=applyKcsSelectionToProject(loadProject()||{});if(!project||!project.characteristics||!project.characteristics.length){root.innerHTML=noDataHtml();return;}const m=project.meta||{},ph=phase();const kcsCount=charRows().filter(r=>r.kcs).length;root.innerHTML=`
<section class="cpHeader"><div class="cpHeaderTop"><div class="cpLogoBox"><img src="assets/logo_paramio.png" onerror="this.src='assets/paramio-logo.png';this.onerror=null"></div><div class="cpTitleBox"><h2>PLAN DE CONTROL</h2><p>Control Plan · ${esc(ph.phase||'Producción')}</p></div><div class="cpDocBox"><div>Documento</div><div>${esc(ph.docNo||'')}</div><div>Revisión</div><div>${esc(ph.rev||'01')}</div><div>Versión app</div><div>${PLAN_VERSION}</div></div></div><div class="cpMeta"><div class="lab">Cliente</div><div class="val">${esc(m.client||'')}</div><div class="lab">Referencia</div><div class="val">${esc(m.reference||'')}</div><div class="lab">Rev. pieza</div><div class="val">${esc(m.revision||'')}</div><div class="lab">Denominación</div><div class="val">${esc(m.partName||'')}</div><div class="lab">Fecha</div><div class="val">${esc(m.date||new Date().toISOString().slice(0,10))}</div><div class="lab">Fase</div><div class="val">${esc(ph.phase||'Producción')}</div><div class="lab">Preparado por</div><div class="val">${esc(ph.preparedBy||'Calidad')}</div><div class="lab">Aprobado por</div><div class="val">${esc(ph.approvedBy||'')}</div><div class="lab">KCS</div><div class="val">${kcsCount} características</div></div><div class="cpMetrologyNote">No se indica la Ref. de los Calibres por ser susceptibles de cambio por su situación metrológica o lugar de inspección.</div></section>
<section class="cpPanel noPrint"><h3>Configuración documental</h3><div class="cpGrid wide"><div><label>Fase</label><select class="cpSelect phaseSelect" onchange="savePhaseField('phase',this.value);render()"><option ${ph.phase==='Prototipo'?'selected':''}>Prototipo</option><option ${ph.phase==='Pre-serie'?'selected':''}>Pre-serie</option><option ${ph.phase==='Producción'?'selected':''}>Producción</option></select></div><div><label>Nº documento</label><input class="cpInput" value="${esc(ph.docNo||'')}" onchange="savePhaseField('docNo',this.value);render()"></div><div><label>Preparado por</label><input class="cpInput" value="${esc(ph.preparedBy||'Calidad')}" onchange="savePhaseField('preparedBy',this.value);render()"></div><div><label>Aprobado por</label><input class="cpInput" value="${esc(ph.approvedBy||'')}" onchange="savePhaseField('approvedBy',this.value);render()"></div></div></section>
<section class="cpToolbar noPrint"><input id="filterText" class="cpInput search" placeholder="Filtrar operación, característica, método, equipo..." oninput="renderTableOnly()"><select id="filterMode" class="cpSelect" onchange="renderTableOnly()"><option value="ALL">Todo</option><option value="KCS">Solo KCS</option><option value="INSPECTION">Solo Inspection</option><option value="BASE">Solo operaciones base</option></select><button class="btn light" onclick="exportCsv()">Exportar CSV</button><button class="btn light" onclick="exportLibrary()">Exportar biblioteca</button><button class="btn light" onclick="exportRules()">Exportar reglas</button><label class="btn light">Importar reglas <input type="file" accept=".json" style="display:none" onchange="importRules(event)"></label><button class="btn light" onclick="resetRuleLibrary()">Reglas base</button><label class="btn light">Importar biblioteca <input type="file" accept=".json" style="display:none" onchange="importLibrary(event)"></label><button class="btn light" onclick="clearEdits()">Borrar ediciones</button><button class="btn" onclick="window.print()">Guardar PDF / Imprimir</button></section>
<section class="cpPanel noPrint"><h3>Motor de decisión del Plan de Control</h3><p class="cpHint">Asigna automáticamente método documental, instrumento de evaluación/medida, muestra, frecuencia y reacción. Las KCS quedan a 1 pieza al turno.</p>${renderRuleCards()}</section>
<section class="cpPanel noPrint"><h3>Biblioteca de operaciones</h3><p class="cpHint">Añade operaciones completas de la pieza. Las cotas de Inspection se asignan por defecto a OP 020, pero cada fila puede editarse para moverla a otra operación.</p><div class="actions"><button class="btn light" onclick="addTemplate('035 LAVADO + SOPLADO')">+ Lavado + soplado</button><button class="btn light" onclick="addTemplate('040 LAVADO FINAL')">+ Lavado final</button><button class="btn light" onclick="addTemplate('045 MARCADO')">+ Marcado</button><button class="btn light" onclick="addTemplate('060 AUDITORIA PROCESO')">+ Auditoría proceso</button><button class="btn light" onclick="addTemplate('061 AUDITORIA PRODUCTO')">+ Auditoría producto</button><button class="btn light" onclick="addTemplate('070 CONTROL FINAL')">+ Control final</button></div><div class="cpGrid" style="margin-top:10px"><div><label>OP</label><input id="newOp" class="cpInput" value="040"></div><div><label>Proceso</label><input id="newProcess" class="cpInput" placeholder="Operación"></div><div><label>Máquina / útiles</label><input id="newMachine" class="cpInput" placeholder="Medio productivo"></div><div><label>Clase</label><select id="newClass" class="cpSelect"><option>Proceso</option><option>Producto</option><option>Documental</option><option>Auditoría</option></select></div><div><label>Característica</label><input id="newChar" class="cpInput" placeholder="Qué se controla"></div><div><label>Especificación</label><input id="newSpec" class="cpInput" placeholder="Criterio"></div><div><label>Método de control</label><input id="newMethod" class="cpInput" placeholder="Documento / registro"></div><div><label>Instrumento de Evaluación / Medida</label><input id="newEquip" class="cpInput" placeholder="Equipo de medición"></div><div><label>Muestra</label><input id="newSample" class="cpInput" value="100%"></div><div><label>Frecuencia</label><input id="newFreq" class="cpInput" placeholder="Frecuencia"></div><div><label>Responsable</label><input id="newOwner" class="cpInput" value="Producción"></div><div><label>Reacción</label><input id="newReact" class="cpInput" placeholder="Acción ante NOK"></div></div><div class="actions"><button class="btn green" onclick="addCustomOp()">Añadir operación</button></div></section>
<section class="cpTableWrap"><table class="cpTable"><thead><tr><th rowspan="2" class="subHead colOp">Nº Operación</th><th rowspan="2" class="subHead colProc">Descripción de la operación</th><th rowspan="2" class="subHead colMach">Máquina, útiles, htas. de fabricación</th><th colspan="4" class="groupHead">Características</th><th colspan="8" class="groupHead">Métodos</th></tr><tr><th class="subHead colNo">Nº</th><th class="subHead colProd">Producto</th><th class="subHead colProcessChar">Proceso</th><th class="subHead colKc">KC</th><th class="subHead colSpec">Especificación de Producto/Proceso/Tolerancia</th><th class="subHead colLimits">Límites de control</th><th class="subHead colEquip">Instrumento de Evaluación/Medida</th><th class="subHead colSample">Tamaño muestra</th><th class="subHead colFreq">Frecuencia de muestreo</th><th class="subHead colOwner">Realizado por</th><th class="subHead colMethod">Método de control</th><th class="subHead colReaction">Plan de reacción</th></tr></thead><tbody id="planBody">${renderTable(filteredRows())}</tbody></table></section><div class="cpFooterNote"><span>Documento generado desde Paramio Quality Documentation · ${PLAN_VERSION}</span><span>Las mediciones/resultados se gestionan en ISIR y Dimensional; el Plan de Control mantiene método, frecuencia, responsabilidad y reacción.</span></div>`;}
function autoSizeAreas(){document.querySelectorAll('textarea.pcArea').forEach(t=>{t.style.height='auto';t.style.height=(t.scrollHeight+2)+'px';});}
function renderTableOnly(){const body=document.getElementById('planBody');if(body){body.innerHTML=renderTable(filteredRows());setTimeout(autoSizeAreas,0);}}
setTimeout(autoSizeAreas,0);
render();
setTimeout(autoSizeAreas,50);
