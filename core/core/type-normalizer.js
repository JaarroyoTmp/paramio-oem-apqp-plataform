(function(){
  const GEOM_TYPES=new Set(['POSITION','PROFILE','FLATNESS','ANGULARITY','PARALLELISM','PERPENDICULARITY','CIRCULARITY','CYLINDRICITY','STRAIGHTNESS','CONCENTRICITY','SYMMETRY','RUNOUT','TOTAL_RUNOUT']);
  const GDT_MAP={
    0xE000:'⌀',0xE003:'⌒',0xE004:'⌖',0xE009:'⏥',0xE00A:'◎',0xE00D:'⌓',
    0xE36E:'⌖',0xE368:'⌒',0xE362:'▱',0xE369:'∠',0xE365:'⊥',
    0xE36A:'⊥'
  };
  function swDecode(value){
    if(value==null)return'';
    let s=String(value),out='';
    for(const ch of s){
      const cp=ch.codePointAt(0);
      out+=GDT_MAP[cp]||(cp>=0xE020&&cp<=0xE07E?(cp===0xE07C?' ':String.fromCharCode(cp-0xE000)):ch);
    }
    return out.replace(/\s+/g,' ').trim();
  }
  function hardClean(s){return String(s??'').replace(/[\uE000-\uF8FF�□▯▾◧◎◴]/g,'').replace(/\s+/g,' ').trim();}
  function normalizeType(input){
    const raw=String(input||'');
    const dec=swDecode(raw);
    const t=norm(raw+' '+dec);

    // Precedencia crítica: si hay Ø/DIAM, es diámetro aunque aparezcan grados o chaflán.
    if(/[Ø⌀]|\bDIAM(?:ETER|ETRO)?\b|\bDIA\b/.test(t))return'DIAMETER';
    if(/\bM\d+(?:[xX]\d+)?\b|ROSCA|THREAD/.test(t))return'THREAD';
    if(/PROFUNDIDAD|DEPTH/.test(t))return'DEPTH';
    if(/RADIO|RADIUS|\bR\s*\d/.test(t))return'RADIUS';

    if(raw.includes('\uE36E')||dec.includes('⌖')||/\bTP\b|TRUE\s*POSITION|POSICION|POSITION/.test(t))return'POSITION';
    if(raw.includes('\uE368')||dec.includes('⌒')||/PERFIL|PROFILE/.test(t))return'PROFILE';
    if(raw.includes('\uE362')||dec.includes('▱')||/PLANITUD|FLATNESS/.test(t))return'FLATNESS';
    if(raw.includes('\uE365')||raw.includes('\uE36A')||dec.includes('⊥')||/PERPENDICULARIDAD|PERPENDICULARITY|PERPENDICULAR/.test(t))return'PERPENDICULARITY';
    if(/PARALELISMO|PARALLELISM|PARALEL/.test(t))return'PARALLELISM';
    if(raw.includes('\uE369')||dec.includes('∠')||/ANGULARIDAD|ANGULARITY|ANGULO|ANGLE|\bGRAD\b|°/.test(t))return'ANGULARITY';
    if(/CIRCULARIDAD|CIRCULARITY/.test(t))return'CIRCULARITY';
    if(/CILINDRICIDAD|CYLINDRICITY/.test(t))return'CYLINDRICITY';
    if(/RECTITUD|STRAIGHTNESS/.test(t))return'STRAIGHTNESS';
    if(/CONCENTRICIDAD|CONCENTRICITY/.test(t))return'CONCENTRICITY';
    if(/SIMETRIA|SYMMETRY/.test(t))return'SYMMETRY';
    if(/TOTAL\s*RUNOUT|RUNOUT\s*TOTAL|OSCILACION\s*TOTAL/.test(t))return'TOTAL_RUNOUT';
    if(/RUNOUT|OSCILACION/.test(t))return'RUNOUT';
    return'DIMENSION';
  }
  function cleanFeatureText(raw,n){
    const d=swDecode(raw);
    let t=d.replace(/[⌖⌒▱∠⊥⌀]/g,'').replace(/[\uE000-\uF8FF]/g,'').replace(/[�□▯]+/g,'').replace(/\s+/g,' ').trim();
    // Correccion V212: NO borrar el numero de cota si el texto es una cota numerica real.
    // Antes: cota 1 con valor 114 acababa como 14. Eso contamina diagnostico y matching.
    const numericOnly=/^[-+]?\d+(?:[,.]\d+)?(?:\s*(?:±|\+\/-|\/|-)\s*[-+]?\d+(?:[,.]\d+)?)*$/.test(t);
    if(!numericOnly){
      const rx=new RegExp('^'+String(n).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?:\\s+|\\s*[-.:]+\\s*)');
      t=t.replace(rx,'').trim();
    }
    return t||('Característica '+n);
  }
  function isGeometricType(t){return GEOM_TYPES.has(String(t||'').toUpperCase());}
  window.swDecode=swDecode;
  window.cleanChar=hardClean;
  window.cleanFeatureText=cleanFeatureText;
  window.normalizeFeatureType=normalizeType;
  window.featureTypeFromRaw=function(rawCell,decoded,cleanValue){return normalizeType([rawCell,decoded,cleanValue].join(' '));};
  window.isGeometricType=isGeometricType;
})();
