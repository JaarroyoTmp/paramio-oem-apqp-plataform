(function(){
  window.specText=function(c){return`LI ${esc(c.lower??'')} / LS ${esc(c.upper??'')} ${esc(c.units||'')}`;};
  window.isKcs=function(c){return!!c.kcs;};

  function cleanUpper(v){return String(v??'').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,' ').replace(/\s+/g,' ').trim();}
  function measured(it){return String(it?.measured??it?.value??it?.reportValue??it?.E_medida??'').trim();}
  window.measured=measured;

  window.pcText=function(it){
    return [it?.name,it?.desc,it?.label,it?.type,it?.kind,it?.axis,it?.role,it?.rawText,(it?.raw||[]).join(' ')]
      .map(x=>String(x||'')).join(' ').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,' ');
  };

  window.axisOf=function(it){
    const ax=norm(it?.axis||it?.kind||'');
    if(ax)return ax;
    const t=pcText(it);
    if(/\bTP\b|TRUE\s*POSITION|POSICION/.test(t))return'TP';
    if(/PERFIL|PROFILE/.test(t))return'PROFILE';
    if(/PLANITUD|FLATNESS/.test(t))return'FLATNESS';
    if(/ANGULAR|ANGULO|ANGLE/.test(t))return'ANGULARITY';
    if(/PARALEL|PARALLEL/.test(t))return'PARALLELISM';
    if(/PERPENDIC/.test(t))return'PERPENDICULARITY';
    if(/PROFUNDIDAD|DEPTH/.test(t))return'DEPTH';
    if(/RADIO|RADIUS/.test(t))return'RADIUS';
    if(/\bDF\b/.test(t))return'DF';
    if(/\bD\d*\b|DIAM/.test(t))return'D';
    if(/\bX\b/.test(t))return'X';
    if(/\bY\b/.test(t))return'Y';
    if(/\bZ\b/.test(t))return'Z';
    if(/\bM\b|DISTANCE|DIMENSION\s*M/.test(t))return'M';
    return'';
  };

  window.featureType=function(c){return normalizeFeatureType(c?.featureType||c?.rawValue||c?.decodedValue||c?.value||'');};

  window.dedupItems=function(items){
    const seen=new Set();
    return (items||[]).filter(it=>{
      const key=[axisOf(it),it.role||'',it.nominal||'',measured(it),it.name||'',it.desc||'',it.rowIndex||''].join('|');
      if(seen.has(key))return false;
      seen.add(key);
      return true;
    });
  };

  function itemBelongsToCota(it,c){
    const wanted=String(c.number??c.balloon??'').trim();
    const got=String(it.cota??it.blockCota??it.globo??it.charNumber??'').trim();
    return !got||got===wanted;
  }

  function usableItems(c,items){
    return (Array.isArray(items)?items:[])
      .filter(it=>itemBelongsToCota(it,c))
      .map(it=>Object.assign({},it,{_axis:axisOf(it),_pcText:pcText(it),_measured:measured(it)}));
  }

  function numericUsableItems(c,items){
    return usableItems(c,items).filter(it=>it._measured&&Number.isFinite(num(it._measured)));
  }

  function strategyName(c){return featureType(c)||'DIMENSION';}

  function runStrategy(c,items){
    const ft=strategyName(c);
    const strategy=(window.ParamioStrategies||{})[ft]||(window.ParamioStrategies||{}).DIMENSION;
    if(!strategy)return [];
    return dedupItems(strategy(c,items)||[]);
  }

  function expectedRuleText(ft){
    const rules={
      DIMENSION:'Acepta X/Y/Z/D/M/DISTANCE/DIMENSION M. Valida nominal +/- tolerancia.',
      POSITION:'Acepta solo TP / TRUE POSITION / DIMENSION DE POSICION. Valida 0 <= valor <= tolerancia.',
      PROFILE:'Acepta PROFILE/PERFIL y LOCATION asociadas. Valida 0 <= valor <= tolerancia.',
      DIAMETER:'Acepta D/DF/D LOCATION/DIAMETER/Ø. Nunca acepta TP.',
      FLATNESS:'Acepta FLATNESS/PLANITUD. Valida 0 <= valor <= tolerancia.',
      ANGULARITY:'Acepta ANGULARITY/ANGULO o fallback controlado M nominal 0. Valida geométrica.',
      PARALLELISM:'Acepta PARALLELISM/PARALELISMO o fallback controlado M nominal 0. Valida geométrica.',
      PERPENDICULARITY:'Acepta PERPENDICULARITY/PERPENDICULARIDAD o fallback controlado M nominal 0. Valida geométrica.',
      DEPTH:'Acepta DEPTH/PROFUNDIDAD.',
      RADIUS:'Acepta RADIUS/RADIO/R.',
      THREAD:'Acepta THREAD/ROSCA/Mxx.'
    };
    return rules[ft]||'Tipo sin regla documentada: revisar strategy.';
  }

  function itemSummary(it){
    const validation=window.validateMeasurement?validateMeasurement(window.__traceCurrentCharacteristic||{},it):null;
    return {
      rowIndex:it.rowIndex||'',
      axis:axisOf(it)||'',
      role:it.role||'',
      name:it.name||it.A||'',
      desc:it.desc||it.B||'',
      nominal:it.nominal||it.D_nominal||'',
      measured:measured(it),
      plus:it.plus||it.F_tolPlus||'',
      minus:it.minus||it.G_tolMinus||'',
      text:pcText(it).slice(0,220),
      validation
    };
  }

  function explainDiscard(c,it,selectedKeys){
    const ft=strategyName(c), ax=axisOf(it), t=pcText(it), val=measured(it);
    const key=[ax,it.role||'',it.nominal||'',val,it.name||'',it.desc||'',it.rowIndex||''].join('|');
    if(selectedKeys.has(key))return 'SELECCIONADA';
    if(!val||!Number.isFinite(num(val)))return 'Descartada: sin medida numérica en columna E.';
    if(ft==='POSITION'){
      if(ax!=='TP'&&!/\bTP\b|TRUE\s*POSITION|DIMENSION\s+DE\s+POSICION/.test(t))return 'Descartada POSITION: no es TP/TRUE POSITION.';
      return 'Descartada POSITION: candidata duplicada o filtrada por deduplicación.';
    }
    if(ft==='DIAMETER'){
      if(ax==='TP'||/TRUE\s*POSITION|POSICION/.test(t))return 'Descartada DIAMETER: fila de posición, no diámetro.';
      if(!(['D','DF'].includes(ax)||/[Ø⌀]|DIAM|UBICACION\s*D|LOCATION\s*D|\bD\s*LOCATION/.test(t)))return 'Descartada DIAMETER: no es D/DF/DIAMETER.';
    }
    if(ft==='DIMENSION'){
      if(['TP','DF','PA','PR','2D','3D','PROFILE','FLATNESS','ANGULARITY','PARALLELISM','PERPENDICULARITY'].includes(ax))return 'Descartada DIMENSION: eje/tipo reservado para geométrica.';
      if(/TRUE\s*POSITION|POSICION|POSITION|PROFILE|PERFIL|FLATNESS|PLANITUD/.test(t))return 'Descartada DIMENSION: texto geométrico.';
      const a=num(c.nominal),b=num(it.nominal);
      if(Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)>0.01)return 'Descartada DIMENSION: nominal Inspection no coincide con nominal PC-DMIS.';
      return 'Descartada DIMENSION: no cumple patrón dimensional útil.';
    }
    if(isGeometricType(ft)){
      if(['X','Y','Z','D','DF'].includes(ax)&&!/(PROFILE|PERFIL|LOCATION|UBICACION)/.test(t))return 'Descartada geométrica: fila dimensional/eje auxiliar no válido para esta regla.';
      return 'Descartada geométrica: no cumple patrón directo ni fallback controlado.';
    }
    return 'Descartada: no cumple la strategy '+ft+'.';
  }

  function buildTrace(c,items,piece){
    const ft=strategyName(c);
    const all=usableItems(c,items);
    const numeric=numericUsableItems(c,items);
    window.__traceCurrentCharacteristic=c;
    const selected=runStrategy(c,numeric);
    const selectedKeys=new Set(selected.map(it=>[axisOf(it),it.role||'',it.nominal||'',measured(it),it.name||'',it.desc||'',it.rowIndex||''].join('|')));
    const validations=selected.map(it=>validateMeasurement(c,it));
    let status='SIN_REGLA', reason='Existe bloque COTA pero ninguna fila cumple strategy '+ft, confidence='LOW';
    if(!all.length){status='SIN_BLOQUE_PCDMIS';reason='No existe bloque PC-DMIS para COTA '+(c.number??c.balloon);confidence='NONE';}
    else if(!numeric.length){status='SIN_MEDIDA_NUMERICA';reason='Existe bloque pero no hay filas con medida numérica en columna E.';confidence='LOW';}
    else if(selected.length){
      const bad=validations.find(v=>!v.ok);
      status=bad?'NOK':'OK';
      reason=bad?bad.reason:'Match '+ft+' validado correctamente.';
      confidence=selected.length===1?'HIGH':'MEDIUM';
    }
    const discarded=numeric.filter(it=>!selectedKeys.has([axisOf(it),it.role||'',it.nominal||'',measured(it),it.name||'',it.desc||'',it.rowIndex||''].join('|')))
      .map(it=>Object.assign(itemSummary(it),{discardReason:explainDiscard(c,it,selectedKeys)}));
    return {
      balloon:String(c.number??c.balloon??''),
      piece:String(piece??'1'),
      inspectionType:ft,
      strategy:ft,
      rule:expectedRuleText(ft),
      status,
      reason,
      confidence,
      validationMode:isGeometricType(ft)?'GEOMETRIC_0_TO_TOL':'DIMENSIONAL_NOMINAL_TOL',
      candidatesFound:numeric.length,
      selectedCount:selected.length,
      selected:selected.map(it=>itemSummary(it)),
      discarded,
      allRows:all.map(it=>itemSummary(it))
    };
  }

  window.traceCharacteristic=function(c,piece='1'){
    const items=allItems(c,piece);
    return buildTrace(c,items,piece);
  };

  window.traceProject=function(p,piece='1'){
    p=p||loadProject();
    if(!p)return [];
    return (p.characteristics||[]).map(c=>traceCharacteristic(c,piece));
  };

  window.allItems=function(c,piece){
    const r=(c.results||{})[piece]||(c.results||{})['P'+piece]||null;
    if(!r)return[];
    if(Array.isArray(r.rawItems))return r.rawItems;
    if(Array.isArray(r.items))return r.items;
    return[];
  };

  window.pieceResult=function(c,piece){return(c.results||{})[piece]||(c.results||{})['P'+piece]||null;};
  window.manualValue=function(c,piece){const p=loadProject();return p?.manualResults?.[String(c.number)]?.[String(piece)]||'';};
  window.setManual=function(n,piece,val){const p=loadProject();p.manualResults=p.manualResults||{};p.manualResults[String(n)]=p.manualResults[String(n)]||{};p.manualResults[String(n)][String(piece)]=val;saveProject(p);};

  window.pieceLabels=function(p){
    const set=new Set();
    (p.characteristics||[]).forEach(c=>Object.keys(c.results||{}).forEach(k=>set.add(String(k).replace(/^P/i,''))));
    Object.values(p.manualResults||{}).forEach(byPiece=>Object.keys(byPiece||{}).forEach(k=>set.add(String(k).replace(/^P/i,''))));
    return [...set].sort((a,b)=>(parseInt(a.replace(/\D/g,''))||0)-(parseInt(b.replace(/\D/g,''))||0));
  };

  window.selectedPieces=function(p,fixedTwo){
    const labels=pieceLabels(p);
    if(fixedTwo)return['1','2'];
    const n=parseInt(localStorage.getItem('paramio_piece_count')||'',10);
    if(Number.isFinite(n)&&n>0)return Array.from({length:n},(_,i)=>String(i+1));
    return labels.length?labels:['1'];
  };

  window.piecesControl=function(p){
    const labels=pieceLabels(p);const max=labels.length||2;
    return`<label>Nº piezas documento <input id="pieceCount" type="number" min="1" value="${esc(localStorage.getItem('paramio_piece_count')||max)}" onchange="localStorage.setItem('paramio_piece_count',this.value);render()"></label><span class="small">Detectadas: ${esc(labels.join(', ')||'sin registros')}</span>`;
  };

  window.chooseReportItems=function(c,items){
    const usable=numericUsableItems(c,items);
    return runStrategy(c,usable);
  };

  window.resultValues=function(c,piece){return chooseReportItems(c,allItems(c,piece)).map(measured).filter(Boolean);};
  window.itemOk=function(c,it){return validateMeasurement(c,it).ok;};

  window.pieceStatus=function(c,piece){
    const r=pieceResult(c,piece);const mv=manualValue(c,piece);
    if(!r&&String(mv||'').trim())return'MANUAL';
    if(!r)return'PEND.';
    const tr=traceCharacteristic(c,piece);
    if(tr.status==='OK')return'OK';
    if(tr.status==='NOK')return'NOK';
    return String(mv||'').trim()?'MANUAL':'PEND.';
  };

  window.statusOf=function(c){
    const p=loadProject();const pieces=pieceLabels(p||{characteristics:[c]});
    if(!pieces.length)return'PEND.';
    const sts=pieces.map(piece=>pieceStatus(c,piece));
    if(sts.includes('NOK'))return'NOK';
    if(sts.includes('OK'))return'OK';
    if(sts.includes('MANUAL'))return'MANUAL';
    return'PEND.';
  };

  window.resultCell=function(c,piece){
    const autoVals=resultValues(c,piece);const mv=manualValue(c,piece);
    const vals=mv!==''?String(mv).split(/\n|\/|;/).map(x=>x.trim()).filter(Boolean):autoVals;
    const st=pieceStatus(c,piece);const red=st==='NOK'?' nokVal':'';
    if(vals.length){return`<div class="resultStack">${vals.map(v=>`<input class="manualInput${red} ${mv!==''?'override':''}" value="${esc(v)}" onchange="const arr=Array.from(this.closest('.resultStack').querySelectorAll('input')).map(x=>x.value).filter(Boolean);setManual('${esc(c.number)}','${esc(piece)}',arr.join('\\n'))">`).join('')}</div>`;}
    return`<div class="resultStack"><input class="manualInput manualEmpty" value="" placeholder="Manual" onchange="setManual('${esc(c.number)}','${esc(piece)}',this.value)"></div>`;
  };

  window.statusPill=function(st){const cls=st==='NOK'?'nok':(st==='PEND.'?'warn':'');return`<span class="pill ${cls}">${esc(st)}</span>`;};
  window.filterRows=function(chars){const q=(document.getElementById('filter')?.value||window.__lastFilter||'').toLowerCase();if(!q)return chars;return chars.filter(c=>[c.number,cleanChar(c.value),c.nominal,c.lower,c.upper,c.units,statusOf(c),featureType(c)].join(' ').toLowerCase().includes(q));};

  window.diagFor=function(c,piece='1'){
    const tr=traceCharacteristic(c,piece);
    const legacyStatus=tr.status==='OK'||tr.status==='NOK'?'OK_LINK':tr.status;
    return {status:legacyStatus,traceStatus:tr.status,reason:tr.reason,items:tr.selected.length?tr.selected:tr.allRows,trace:tr};
  };
})();
