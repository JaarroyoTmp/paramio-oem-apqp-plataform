
(function(){
 function cleanChar(v){return String(v??'').replace(/[\uE000-\uF8FF�□▯▾◧◎⌖◴]/g,'').replace(/\s+/g,' ').trim();}window.cleanChar=cleanChar;window.specText=function(c){return`LI ${esc(c.lower??'')} / LS ${esc(c.upper??'')} ${esc(c.units||'')}`;};window.isKcs=function(c){return!!c.kcs;};
 window.pieceLabels=function(p){const set=new Set();(p.characteristics||[]).forEach(c=>Object.keys(c.results||{}).forEach(k=>set.add(String(k).replace(/^P/i,''))));Object.values(p.manualResults||{}).forEach(byPiece=>Object.keys(byPiece||{}).forEach(k=>set.add(String(k).replace(/^P/i,''))));let arr=[...set].sort((a,b)=>(parseInt(a.replace(/\D/g,''))||0)-(parseInt(b.replace(/\D/g,''))||0));return arr;};
 window.selectedPieces=function(p,fixedTwo){const labels=pieceLabels(p);if(fixedTwo)return['1','2'];const n=parseInt(localStorage.getItem('paramio_piece_count')||'',10);if(Number.isFinite(n)&&n>0){let out=[];for(let i=1;i<=n;i++)out.push(String(i));return out;}return labels.length?labels:['1'];};
 window.piecesControl=function(p){const labels=pieceLabels(p);const max=labels.length||2;return`<label>Nº piezas documento <input id="pieceCount" type="number" min="1" value="${esc(localStorage.getItem('paramio_piece_count')||max)}" onchange="localStorage.setItem('paramio_piece_count',this.value);render()"></label><span class="small">Detectadas: ${esc(labels.join(', ')||'sin registros')}</span>`;};
 function itemText(it){try{return JSON.stringify(it||{}).toUpperCase();}catch(e){return[it.name,it.axis,it.desc,it.kind,it.role].map(x=>String(x||'')).join(' ').toUpperCase();}}function measured(it){return String(it?.measured??it?.value??it?.reportValue??'').trim();}window.measured=measured;
 window.axisOf=function(it){const ax=norm(it?.axis||it?.kind||'');if(ax)return ax;const t=itemText(it);if(/\bTP\b|TRUE\s*POSITION|POSICI/.test(t))return'TP';if(/PERF|PROFILE|PERFIL/.test(t))return'PERF';if(/UBIC|UBICACI|LOCATION/.test(t))return'UBIC';if(/\bANG\b|ANGLE|ANGULO|ANGULARIDAD/.test(t))return'ANG';if(/\bDF\b/.test(t))return'DF';if(/\b2D\b|\b3D\b/.test(t))return'2D';if(/\bPR\b/.test(t))return'PR';if(/\bPA\b/.test(t))return'PA';if(/\bD\d*\b|DIAM/.test(t))return'D';if(/\bX\b/.test(t))return'X';if(/\bY\b/.test(t))return'Y';if(/\bZ\b/.test(t))return'Z';if(/\bM\b|MEAS|MED|DIST/.test(t))return'M';return'';};
 window.featureType=function(c){const ft=norm(c?.featureType||'');if(ft)return ft;return featureTypeFromRaw(c?.rawValue||'',c?.decodedValue||'',c?.value||'');};function itemBelongsToCota(it,c){const wanted=String(c.number??'').trim();const got=String(it.cota??it.blockCota??it.globo??it.charNumber??'').trim();return!got||got===wanted;}
 function nominalClose(c,it){const ft=featureType(c);if(['POSITION','PROFILE','ANGULARITY','PARALLELISM','PERPENDICULARITY','FLATNESS','CIRCULARITY','CYLINDRICITY'].includes(ft))return true;const a=num(c.nominal),b=num(it.nominal);if(!Number.isFinite(a)||!Number.isFinite(b))return true;return Math.abs(a-b)<=0.001;}function dedup(items){const seen=new Set();return items.filter(it=>{const key=[axisOf(it),it.role||'',it.nominal||'',measured(it),it.name||'',it.desc||''].join('|');if(seen.has(key))return false;seen.add(key);return true;});}function priority(items,axes){for(const a of axes){const g=items.filter(it=>axisOf(it)===a);if(g.length)return g;}return [];}function pcText(it){return[it.name,it.desc,it.label,it.type,it.kind,it.axis,it.role,it.rawText].map(x=>String(x||'')).join(' ').toUpperCase();}
 window.allItems=function(c,piece){const r=(c.results||{})[piece]||(c.results||{})['P'+piece]||null;if(!r)return[];if(Array.isArray(r.rawItems))return r.rawItems;if(Array.isArray(r.items))return r.items;return[];};window.pieceResult=function(c,piece){return(c.results||{})[piece]||(c.results||{})['P'+piece]||null;};window.manualValue=function(c,piece){const p=loadProject();return p?.manualResults?.[String(c.number)]?.[String(piece)]||'';};
 window.setManual=function(n,piece,val){const p=loadProject();p.manualResults=p.manualResults||{};p.manualResults[String(n)]=p.manualResults[String(n)]||{};p.manualResults[String(n)][String(piece)]=val;saveProject(p);};
 window.chooseReportItems=function(c,items){items=Array.isArray(items)?items:[];let withValue=items.filter(it=>itemBelongsToCota(it,c)&&measured(it));if(!withValue.length)return[];const ft=featureType(c);if(ft==='POSITION')return dedup(withValue.filter(it=>axisOf(it)==='TP'||/\bTP\b/.test(pcText(it))));if(ft==='DIAMETER'){const valid=withValue.filter(it=>['D','DF'].includes(axisOf(it))&&nominalClose(c,it));return dedup(priority(valid,['D','DF']));}if(ft==='PROFILE'){const prof=withValue.filter(it=>{const t=pcText(it),ax=axisOf(it);return(ax==='PERF'||ax==='UBIC'||/PERFIL|PROFILE|UBICACI|LOCATION/.test(t))&&!/PLANITUD|FLATNESS/.test(t);});return dedup(prof);}if(['ANGULARITY','PARALLELISM','PERPENDICULARITY'].includes(ft)){const ori=withValue.filter(it=>{const t=pcText(it),ax=axisOf(it);return['ANG','M','X','Y','Z','D','UBIC'].includes(ax)||/ANGULO|ANGLE|ANGULAR|PARALEL|PARALLEL|PERPENDIC|UBICACI|LOCATION/.test(t);});return dedup(ori);}if(['FLATNESS','CIRCULARITY','CYLINDRICITY'].includes(ft)){const form=withValue.filter(it=>{const t=pcText(it),ax=axisOf(it);return ax==='M'||/PLANITUD|FLATNESS|CIRCULAR|CILINDRIC|CYLINDRIC/.test(t);});return dedup(form);}if(ft==='THREAD')return dedup(priority(withValue.filter(it=>['M','D'].includes(axisOf(it))&&nominalClose(c,it)),['M','D']));if(ft==='RADIUS'||ft==='DEPTH')return dedup(withValue.filter(it=>!['TP','DF','2D','PR','PA'].includes(axisOf(it))&&nominalClose(c,it)));const valid=withValue.filter(it=>{const ax=axisOf(it),t=pcText(it);if(['TP','DF','2D','PR','PA'].includes(ax))return false;if(!nominalClose(c,it))return false;if(ax==='M'||/DIST|DIMENSION\s*M|LONG|LENGTH/.test(t))return true;if(['X','Y','Z','D',''].includes(ax))return true;return false;});const dist=valid.filter(it=>axisOf(it)==='M'||/DIST|DIMENSION\s*M/.test(pcText(it)));if(dist.length)return dedup(dist);return dedup(priority(valid,['X','Y','Z','D','']));};
 window.resultValues=function(c,piece){return chooseReportItems(c,allItems(c,piece)).map(measured).filter(Boolean);};
 window.itemOk=function(c,it){const ft=featureType(c),E=num(measured(it)),D=num(it.nominal),F=num(it.plus),G=num(it.minus);if(!Number.isFinite(E))return true;const t=pcText(it),ax=axisOf(it);const isGeom=['POSITION','PROFILE','ANGULARITY','PARALLELISM','PERPENDICULARITY','FLATNESS','CIRCULARITY','CYLINDRICITY'].includes(ft);const isGeomError=isGeom&&(ax==='TP'||/PERFIL|PROFILE|ANGULO|ANGLE|ANGULAR|PARALEL|PARALLEL|PERPENDIC|PLANITUD|FLATNESS|CIRCULAR|CILINDRIC|CYLINDRIC/.test(t));if(isGeomError){if(Number.isFinite(F))return E>=-1e-9&&E<=F+1e-9;return true;}if(!Number.isFinite(D))return Number.isFinite(F)?E<=F+1e-9:true;if(!Number.isFinite(F))return true;const lower=D-Math.abs(Number.isFinite(G)?G:0);const upper=D+F;return E>=lower-1e-9&&E<=upper+1e-9;};
 window.pieceStatus=function(c,piece){const r=pieceResult(c,piece);const mv=manualValue(c,piece);if(!r&&String(mv||'').trim())return'MANUAL';if(!r)return'PEND.';const selected=chooseReportItems(c,allItems(c,piece));if(!selected.length)return String(mv||'').trim()?'MANUAL':'PEND.';return selected.some(it=>!itemOk(c,it))?'NOK':'OK';};
 window.statusOf=function(c){const p=loadProject();const pieces=pieceLabels(p||{characteristics:[c]});if(!pieces.length)return'PEND.';const sts=pieces.map(piece=>pieceStatus(c,piece));if(sts.includes('NOK'))return'NOK';if(sts.includes('OK'))return'OK';if(sts.includes('MANUAL'))return'MANUAL';return'PEND.';};
 window.resultCell=function(c,piece){const autoVals=resultValues(c,piece);const mv=manualValue(c,piece);const vals=mv!==''?String(mv).split(/\n|\/|;/).map(x=>x.trim()).filter(Boolean):autoVals;const st=pieceStatus(c,piece);const red=st==='NOK'?' nokVal':'';if(vals.length){return`<div class="resultStack">${vals.map((v,i)=>`<input class="manualInput${red} ${mv!==''?'override':''}" value="${esc(v)}" onchange="const arr=Array.from(this.closest('.resultStack').querySelectorAll('input')).map(x=>x.value).filter(Boolean);setManual('${esc(c.number)}','${esc(piece)}',arr.join('\\n'))">`).join('')}</div>`;}return`<div class="resultStack"><input class="manualInput manualEmpty" value="" placeholder="Manual" onchange="setManual('${esc(c.number)}','${esc(piece)}',this.value)"></div>`;};
 window.statusPill=function(st){const cls=st==='NOK'?'nok':(st==='PEND.'?'warn':'');return`<span class="pill ${cls}">${esc(st)}</span>`;};window.filterRows=function(chars){const q=(document.getElementById('filter')?.value||window.__lastFilter||'').toLowerCase();if(!q)return chars;return chars.filter(c=>[c.number,cleanChar(c.value),c.nominal,c.lower,c.upper,c.units,statusOf(c),featureType(c)].join(' ').toLowerCase().includes(q));};window.diagFor=function(c,piece='1'){const items=allItems(c,piece);const selected=chooseReportItems(c,items);if(!items.length)return{status:'SIN_COTA',reason:'No existe bloque COTA '+c.number,items:[]};if(selected.length)return{status:'OK_LINK',reason:'Inspection manda: '+featureType(c),items:selected};return{status:'SIN_REGLA',reason:'Existe COTA '+c.number+' pero ninguna fila cumple '+featureType(c),items};};
})();


/* ===== PATCH RESULT ENGINE V2 · AXIS COMPUESTO + DIMENSION D/LOCATION ===== */
(function(){
  function pn(v){return String(v??'').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();}
  function nm(v){const n=parseFloat(String(v??'').replace(',','.').replace(/[^\d.-]/g,''));return Number.isFinite(n)?n:NaN;}
  function val(it){return String(it?.measured??it?.value??it?.reportValue??'').trim();}
  function ax(it){
    const direct=pn(it?.axis||it?.kind||'');
    const text=pn([direct,it?.role,it?.name,it?.desc,it?.rawText].join(' '));
    if(/\bTP\b|TRUE POSITION|POSICION/.test(text))return 'TP';
    if(/\bDF\b/.test(text))return 'DF';
    if(/\b2D\b|\b3D\b/.test(text))return '2D';
    if(/\bPA\b/.test(text))return 'PA';
    if(/\bPR\b/.test(text))return 'PR';
    if(/DIST|DISTANCE|DISTANCIA|DIMENSION M/.test(text))return 'M';
    if(/\bD\s+LOCATION\b|\bD LOCATION\b|\bUBICACION D\b|\bLOCATION D\b|^D$|\bD\b/.test(text))return 'D';
    if(/\bX\s+LOCATION\b|\bX LOCATION\b|\bUBICACION X\b|\bLOCATION X\b|^X$|\bX\b/.test(text))return 'X';
    if(/\bY\s+LOCATION\b|\bY LOCATION\b|\bUBICACION Y\b|\bLOCATION Y\b|^Y$|\bY\b/.test(text))return 'Y';
    if(/\bZ\s+LOCATION\b|\bZ LOCATION\b|\bUBICACION Z\b|\bLOCATION Z\b|^Z$|\bZ\b/.test(text))return 'Z';
    if(/PERFIL|PROFILE/.test(text))return 'PERF';
    if(/PLANITUD|FLATNESS/.test(text))return 'FLATNESS';
    if(/\bM\b/.test(text))return 'M';
    return direct||'';
  }
  function txt(it){return pn([it?.axis,it?.kind,it?.role,it?.name,it?.desc,it?.rawText].join(' '));}
  function ft(c){return pn(c?.featureType||'') || pn(window.featureType?window.featureType(c):'DIMENSION') || 'DIMENSION';}
  function close(c,it){
    const t=ft(c);
    if(['POSITION','PROFILE','ANGULARITY','PARALLELISM','PERPENDICULARITY','FLATNESS','CIRCULARITY','CYLINDRICITY'].includes(t))return true;
    const a=nm(c?.nominal),b=nm(it?.nominal);
    if(!Number.isFinite(a)||!Number.isFinite(b))return true;
    return Math.abs(a-b)<=0.001;
  }
  function dedup(items){
    const seen=new Set();
    return items.filter(it=>{
      const k=[ax(it),it?.role||'',it?.nominal||'',val(it),it?.name||'',it?.desc||''].join('|');
      if(seen.has(k))return false;
      seen.add(k);return true;
    });
  }
  function prio(items,axes){
    for(const a of axes){const g=items.filter(it=>ax(it)===a);if(g.length)return g;}
    return [];
  }
  function dimLine(it){
    const a=ax(it), t=txt(it);
    return ['M','X','Y','Z','D',''].includes(a) || /LOCATION|UBICACION|DISTANCE|DISTANCIA|DIMENSION|LENGTH|LONGITUD|WIDTH|ANCHURA|DIST/.test(t);
  }
  window.axisOf=function(it){return ax(it);};
  window.chooseReportItems=function(c,items){
    items=Array.isArray(items)?items:[];
    const useful=items.filter(it=>val(it)&&Number.isFinite(nm(val(it))));
    if(!useful.length)return [];
    const t=ft(c);
    if(t==='POSITION')return dedup(useful.filter(it=>ax(it)==='TP'||/\bTP\b|TRUE POSITION|POSICION/.test(txt(it))));
    if(t==='DIAMETER')return dedup(prio(useful.filter(it=>['D','DF'].includes(ax(it))&&close(c,it)),['D','DF']));
    if(t==='PROFILE')return dedup(useful.filter(it=>['PERF','UBIC','X','Y','Z','D','M'].includes(ax(it))||/PERFIL|PROFILE|UBICACION|LOCATION/.test(txt(it))));
    if(['ANGULARITY','PARALLELISM','PERPENDICULARITY'].includes(t))return dedup(useful.filter(it=>['ANG','M','X','Y','Z','D','UBIC'].includes(ax(it))||/ANGULO|ANGLE|ANGULAR|PARALEL|PARALLEL|PERPENDIC|UBICACION|LOCATION/.test(txt(it))));
    if(['FLATNESS','CIRCULARITY','CYLINDRICITY'].includes(t))return dedup(useful.filter(it=>ax(it)==='M'||/PLANITUD|FLATNESS|CIRCULAR|CILINDRIC|CYLINDRIC/.test(txt(it))));
    if(t==='THREAD')return dedup(prio(useful.filter(it=>['M','D'].includes(ax(it))&&close(c,it)),['M','D']));
    if(t==='RADIUS'||t==='DEPTH')return dedup(useful.filter(it=>!['TP','DF','2D','3D','PR','PA'].includes(ax(it))&&close(c,it)));
    const valid=useful.filter(it=>!['TP','DF','2D','3D','PR','PA'].includes(ax(it))&&close(c,it)&&dimLine(it));
    const dist=valid.filter(it=>ax(it)==='M'||/DIST|DISTANCE|DISTANCIA|DIMENSION M/.test(txt(it)));
    if(dist.length)return dedup(dist);
    const xyz=prio(valid,['X','Y','Z']); if(xyz.length)return dedup(xyz);
    const d=prio(valid,['D']); if(d.length)return dedup(d);
    return dedup(valid);
  };
  window.resultValues=function(c,piece){const items=window.allItems?window.allItems(c,piece):[];return window.chooseReportItems(c,items).map(val).filter(Boolean);};
  window.itemOk=function(c,it){
    const t=ft(c),E=nm(val(it)),D=nm(it?.nominal),F=nm(it?.plus),G=nm(it?.minus);
    if(!Number.isFinite(E))return true;
    const isGeom=['POSITION','PROFILE','ANGULARITY','PARALLELISM','PERPENDICULARITY','FLATNESS','CIRCULARITY','CYLINDRICITY'].includes(t);
    const geomError=isGeom&&(ax(it)==='TP'||/PERFIL|PROFILE|ANGULO|ANGLE|ANGULAR|PARALEL|PARALLEL|PERPENDIC|PLANITUD|FLATNESS|CIRCULAR|CILINDRIC|CYLINDRIC/.test(txt(it)));
    if(geomError){if(Number.isFinite(F))return E>=-1e-9&&E<=F+1e-9;return true;}
    if(!Number.isFinite(D))return Number.isFinite(F)?E<=F+1e-9:true;
    if(!Number.isFinite(F))return true;
    const lower=D-Math.abs(Number.isFinite(G)?G:0), upper=D+F;
    return E>=lower-1e-9&&E<=upper+1e-9;
  };
  window.pieceStatus=function(c,piece){
    const r=window.pieceResult?window.pieceResult(c,piece):null;
    const mv=window.manualValue?window.manualValue(c,piece):'';
    if(!r&&String(mv||'').trim())return 'MANUAL';
    if(!r)return 'PEND.';
    const selected=window.chooseReportItems(c,window.allItems(c,piece));
    if(!selected.length)return String(mv||'').trim()?'MANUAL':'PEND.';
    return selected.some(it=>!window.itemOk(c,it))?'NOK':'OK';
  };
  window.statusOf=function(c){
    const p=window.loadProject?window.loadProject():null;
    const pieces=window.pieceLabels?window.pieceLabels(p||{characteristics:[c]}):['1'];
    if(!pieces.length)return 'PEND.';
    const sts=pieces.map(piece=>window.pieceStatus(c,piece));
    if(sts.includes('NOK'))return 'NOK';
    if(sts.includes('OK'))return 'OK';
    if(sts.includes('MANUAL'))return 'MANUAL';
    return 'PEND.';
  };
  window.diagFor=function(c,piece='1'){
    const items=window.allItems?window.allItems(c,piece):[];
    const selected=window.chooseReportItems(c,items);
    if(!items.length)return {status:'SIN_COTA',reason:'No existe bloque COTA '+c.number,items:[]};
    if(selected.length)return {status:'OK_LINK',reason:'Motor V2: '+ft(c)+' compatible',items:selected};
    return {status:'SIN_REGLA',reason:'Existe COTA '+c.number+' pero ninguna fila cumple '+ft(c),items};
  };
})();


/* ===== PATCH RESULT ENGINE V3 SAFE TYPE =====
   Problema corregido:
   - Si parser-inspection dejó featureType = SUPERIOR / INFERIOR / LS / LI / UPPER / LOWER,
     NO se acepta como tipo válido.
   - Se recalcula desde rawValue / decodedValue / value.
   - Si no hay símbolo ni texto especial, se trata como DIMENSION.
*/
(function(){
  function sxNorm(v){
    return String(v??'').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
  }
  function sxNum(v){
    const n=parseFloat(String(v??'').replace(',','.').replace(/[^\d.-]/g,''));
    return Number.isFinite(n)?n:NaN;
  }
  function sxVal(it){
    return String(it?.measured??it?.value??it?.reportValue??'').trim();
  }
  function sxBadType(t){
    return !t || [
      'SUPERIOR','INFERIOR','UPPER','LOWER','LS','LI','LIMITE SUPERIOR','LIMITE INFERIOR',
      'UNITS','UNIDAD','MM','IN','GRAD','VALUE','VALOR','CHARACTERISTIC','CARACTERISTICA'
    ].includes(t);
  }
  function sxType(c){
    let ft=sxNorm(c?.featureType||'');
    if(!sxBadType(ft)) return ft;

    const raw=String([c?.rawValue,c?.decodedValue,c?.value,c?.characteristic,c?.datums].join(' '));
    const u=sxNorm(raw);

    if(raw.includes('Ø') || raw.includes('⌀') || /\bDIAM/.test(u)) return 'DIAMETER';
    if(/\bM\d+/.test(u) || /ROSCA|THREAD/.test(u)) return 'THREAD';
    if(/POSICION|POSITION|TRUE POSITION|\bTP\b|⌖/.test(u)) return 'POSITION';
    if(/PERFIL|PROFILE|⌒|⌓/.test(u)) return 'PROFILE';
    if(/ANGULARIDAD|ANGULARITY|ANGULO|ANGLE|∠/.test(u)) return 'ANGULARITY';
    if(/PARALELISMO|PARALLELISM|∥/.test(u)) return 'PARALLELISM';
    if(/PERPENDICULARIDAD|PERPENDICULARITY|⊥/.test(u)) return 'PERPENDICULARITY';
    if(/PLANITUD|FLATNESS/.test(u)) return 'FLATNESS';
    if(/CIRCULARIDAD|CIRCULARITY/.test(u)) return 'CIRCULARITY';
    if(/CILINDRICIDAD|CYLINDRICITY/.test(u)) return 'CYLINDRICITY';
    if(/RADIO|RADIUS|\bR\s*\d/.test(u)) return 'RADIUS';
    if(/PROFUNDIDAD|DEPTH/.test(u)) return 'DEPTH';

    return 'DIMENSION';
  }
  function sxAxis(it){
    const direct=sxNorm(it?.axis||it?.kind||'');
    const text=sxNorm([direct,it?.role,it?.name,it?.desc,it?.rawText].join(' '));
    if(/\bTP\b|TRUE POSITION|POSICION/.test(text))return 'TP';
    if(/\bDF\b/.test(text))return 'DF';
    if(/\b2D\b|\b3D\b/.test(text))return '2D';
    if(/\bPA\b/.test(text))return 'PA';
    if(/\bPR\b/.test(text))return 'PR';
    if(/DIST|DISTANCE|DISTANCIA|DIMENSION M/.test(text))return 'M';
    if(/\bD\s+LOCATION\b|\bUBICACION D\b|\bLOCATION D\b|^D$|\bD\b/.test(text))return 'D';
    if(/\bX\s+LOCATION\b|\bUBICACION X\b|\bLOCATION X\b|^X$|\bX\b/.test(text))return 'X';
    if(/\bY\s+LOCATION\b|\bUBICACION Y\b|\bLOCATION Y\b|^Y$|\bY\b/.test(text))return 'Y';
    if(/\bZ\s+LOCATION\b|\bUBICACION Z\b|\bLOCATION Z\b|^Z$|\bZ\b/.test(text))return 'Z';
    if(/PERFIL|PROFILE/.test(text))return 'PERF';
    if(/PLANITUD|FLATNESS/.test(text))return 'FLATNESS';
    if(/\bM\b/.test(text))return 'M';
    return direct||'';
  }
  function sxText(it){
    return sxNorm([it?.axis,it?.kind,it?.role,it?.name,it?.desc,it?.rawText].join(' '));
  }
  function sxClose(c,it){
    const t=sxType(c);
    if(['POSITION','PROFILE','ANGULARITY','PARALLELISM','PERPENDICULARITY','FLATNESS','CIRCULARITY','CYLINDRICITY'].includes(t))return true;
    const a=sxNum(c?.nominal), b=sxNum(it?.nominal);
    if(!Number.isFinite(a)||!Number.isFinite(b))return true;
    return Math.abs(a-b)<=0.001;
  }
  function sxDedup(items){
    const seen=new Set();
    return items.filter(it=>{
      const k=[sxAxis(it),it?.role||'',it?.nominal||'',sxVal(it),it?.name||'',it?.desc||''].join('|');
      if(seen.has(k))return false;
      seen.add(k);return true;
    });
  }
  function sxPrio(items,axes){
    for(const a of axes){
      const g=items.filter(it=>sxAxis(it)===a);
      if(g.length)return g;
    }
    return [];
  }
  function sxDimLine(it){
    const a=sxAxis(it), t=sxText(it);
    return ['M','X','Y','Z','D',''].includes(a) || /LOCATION|UBICACION|DISTANCE|DISTANCIA|DIMENSION|LENGTH|LONGITUD|WIDTH|ANCHURA|DIST/.test(t);
  }

  window.featureType=function(c){return sxType(c);};
  window.axisOf=function(it){return sxAxis(it);};

  window.chooseReportItems=function(c,items){
    items=Array.isArray(items)?items:[];
    const useful=items.filter(it=>sxVal(it)&&Number.isFinite(sxNum(sxVal(it))));
    if(!useful.length)return [];
    const t=sxType(c);

    if(t==='POSITION')return sxDedup(useful.filter(it=>sxAxis(it)==='TP'||/\bTP\b|TRUE POSITION|POSICION/.test(sxText(it))));

    if(t==='DIAMETER'){
      return sxDedup(sxPrio(useful.filter(it=>['D','DF'].includes(sxAxis(it))&&sxClose(c,it)),['D','DF']));
    }

    if(t==='PROFILE')return sxDedup(useful.filter(it=>['PERF','UBIC','X','Y','Z','D','M'].includes(sxAxis(it))||/PERFIL|PROFILE|UBICACION|LOCATION/.test(sxText(it))));

    if(['ANGULARITY','PARALLELISM','PERPENDICULARITY'].includes(t))return sxDedup(useful.filter(it=>['ANG','M','X','Y','Z','D','UBIC'].includes(sxAxis(it))||/ANGULO|ANGLE|ANGULAR|PARALEL|PARALLEL|PERPENDIC|UBICACION|LOCATION/.test(sxText(it))));

    if(['FLATNESS','CIRCULARITY','CYLINDRICITY'].includes(t))return sxDedup(useful.filter(it=>sxAxis(it)==='M'||/PLANITUD|FLATNESS|CIRCULAR|CILINDRIC|CYLINDRIC/.test(sxText(it))));

    if(t==='THREAD')return sxDedup(sxPrio(useful.filter(it=>['M','D'].includes(sxAxis(it))&&sxClose(c,it)),['M','D']));

    if(t==='RADIUS'||t==='DEPTH')return sxDedup(useful.filter(it=>!['TP','DF','2D','3D','PR','PA'].includes(sxAxis(it))&&sxClose(c,it)));

    const valid=useful.filter(it=>!['TP','DF','2D','3D','PR','PA'].includes(sxAxis(it))&&sxClose(c,it)&&sxDimLine(it));

    const dist=valid.filter(it=>sxAxis(it)==='M'||/DIST|DISTANCE|DISTANCIA|DIMENSION M/.test(sxText(it)));
    if(dist.length)return sxDedup(dist);

    const xyz=sxPrio(valid,['X','Y','Z']);
    if(xyz.length)return sxDedup(xyz);

    const d=sxPrio(valid,['D']);
    if(d.length)return sxDedup(d);

    return sxDedup(valid);
  };

  window.resultValues=function(c,piece){
    const items=window.allItems?window.allItems(c,piece):[];
    return window.chooseReportItems(c,items).map(sxVal).filter(Boolean);
  };

  window.itemOk=function(c,it){
    const t=sxType(c), E=sxNum(sxVal(it)), D=sxNum(it?.nominal), F=sxNum(it?.plus), G=sxNum(it?.minus);
    if(!Number.isFinite(E))return true;

    const isGeom=['POSITION','PROFILE','ANGULARITY','PARALLELISM','PERPENDICULARITY','FLATNESS','CIRCULARITY','CYLINDRICITY'].includes(t);
    const geomError=isGeom&&(sxAxis(it)==='TP'||/PERFIL|PROFILE|ANGULO|ANGLE|ANGULAR|PARALEL|PARALLEL|PERPENDIC|PLANITUD|FLATNESS|CIRCULAR|CILINDRIC|CYLINDRIC/.test(sxText(it)));

    if(geomError){
      if(Number.isFinite(F))return E>=-1e-9&&E<=F+1e-9;
      return true;
    }

    if(!Number.isFinite(D))return Number.isFinite(F)?E<=F+1e-9:true;
    if(!Number.isFinite(F))return true;

    const lower=D-Math.abs(Number.isFinite(G)?G:0);
    const upper=D+F;
    return E>=lower-1e-9&&E<=upper+1e-9;
  };

  window.pieceStatus=function(c,piece){
    const r=window.pieceResult?window.pieceResult(c,piece):null;
    const mv=window.manualValue?window.manualValue(c,piece):'';
    if(!r&&String(mv||'').trim())return 'MANUAL';
    if(!r)return 'PEND.';
    const selected=window.chooseReportItems(c,window.allItems(c,piece));
    if(!selected.length)return String(mv||'').trim()?'MANUAL':'PEND.';
    return selected.some(it=>!window.itemOk(c,it))?'NOK':'OK';
  };

  window.statusOf=function(c){
    const p=window.loadProject?window.loadProject():null;
    const pieces=window.pieceLabels?window.pieceLabels(p||{characteristics:[c]}):['1'];
    if(!pieces.length)return 'PEND.';
    const sts=pieces.map(piece=>window.pieceStatus(c,piece));
    if(sts.includes('NOK'))return 'NOK';
    if(sts.includes('OK'))return 'OK';
    if(sts.includes('MANUAL'))return 'MANUAL';
    return 'PEND.';
  };

  window.diagFor=function(c,piece='1'){
    const items=window.allItems?window.allItems(c,piece):[];
    const selected=window.chooseReportItems(c,items);
    if(!items.length)return {status:'SIN_COTA',reason:'No existe bloque COTA '+c.number,items:[]};
    if(selected.length)return {status:'OK_LINK',reason:'Motor V3 SAFE TYPE: '+sxType(c)+' compatible',items:selected};
    return {status:'SIN_REGLA',reason:'Existe COTA '+c.number+' pero ninguna fila cumple '+sxType(c),items};
  };
})();
