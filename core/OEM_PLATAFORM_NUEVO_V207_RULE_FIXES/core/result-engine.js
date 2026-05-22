(function(){
  window.specText=function(c){return`LI ${esc(c.lower??'')} / LS ${esc(c.upper??'')} ${esc(c.units||'')}`;};
  window.isKcs=function(c){return!!c.kcs;};
  function measured(it){return String(it?.measured??it?.value??it?.reportValue??it?.E_medida??'').trim();}
  window.measured=measured;
  window.pcText=function(it){return [it?.name,it?.desc,it?.label,it?.type,it?.kind,it?.axis,it?.role,it?.rawText,(it?.raw||[]).join(' ')].map(x=>String(x||'')).join(' ').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,' ');};
  window.axisOf=function(it){
    const ax=norm(it?.axis||it?.kind||'');if(ax)return ax;
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
    if(/\bX\b/.test(t))return'X';if(/\bY\b/.test(t))return'Y';if(/\bZ\b/.test(t))return'Z';
    if(/\bM\b|DISTANCE|DIMENSION\s*M/.test(t))return'M';
    return'';
  };
  window.featureType=function(c){return normalizeFeatureType(c?.featureType||c?.rawValue||c?.decodedValue||c?.value||'');};
  window.dedupItems=function(items){const seen=new Set();return (items||[]).filter(it=>{const key=[axisOf(it),it.role||'',it.nominal||'',measured(it),it.name||'',it.desc||'',it.rowIndex||''].join('|');if(seen.has(key))return false;seen.add(key);return true;});};
  function itemBelongsToCota(it,c){const wanted=String(c.number??c.balloon??'').trim();const got=String(it.cota??it.blockCota??it.globo??it.charNumber??'').trim();return !got||got===wanted;}
  window.allItems=function(c,piece){const r=(c.results||{})[piece]||(c.results||{})['P'+piece]||null;if(!r)return[];if(Array.isArray(r.rawItems))return r.rawItems;if(Array.isArray(r.items))return r.items;return[];};
  window.pieceResult=function(c,piece){return(c.results||{})[piece]||(c.results||{})['P'+piece]||null;};
  window.manualValue=function(c,piece){const p=loadProject();return p?.manualResults?.[String(c.number)]?.[String(piece)]||'';};
  window.setManual=function(n,piece,val){const p=loadProject();p.manualResults=p.manualResults||{};p.manualResults[String(n)]=p.manualResults[String(n)]||{};p.manualResults[String(n)][String(piece)]=val;saveProject(p);};
  window.pieceLabels=function(p){const set=new Set();(p.characteristics||[]).forEach(c=>Object.keys(c.results||{}).forEach(k=>set.add(String(k).replace(/^P/i,''))));Object.values(p.manualResults||{}).forEach(byPiece=>Object.keys(byPiece||{}).forEach(k=>set.add(String(k).replace(/^P/i,''))));return [...set].sort((a,b)=>(parseInt(a.replace(/\D/g,''))||0)-(parseInt(b.replace(/\D/g,''))||0));};
  window.selectedPieces=function(p,fixedTwo){const labels=pieceLabels(p);if(fixedTwo)return['1','2'];const n=parseInt(localStorage.getItem('paramio_piece_count')||'',10);if(Number.isFinite(n)&&n>0)return Array.from({length:n},(_,i)=>String(i+1));return labels.length?labels:['1'];};
  window.piecesControl=function(p){const labels=pieceLabels(p);const max=labels.length||2;return`<label>Nº piezas documento <input id="pieceCount" type="number" min="1" value="${esc(localStorage.getItem('paramio_piece_count')||max)}" onchange="localStorage.setItem('paramio_piece_count',this.value);render()"></label><span class="small">Detectadas: ${esc(labels.join(', ')||'sin registros')}</span>`;};
  window.chooseReportItems=function(c,items){
    const ft=featureType(c);const usable=(Array.isArray(items)?items:[]).filter(it=>itemBelongsToCota(it,c)&&measured(it)&&Number.isFinite(num(measured(it))));
    const strategy=(window.ParamioStrategies||{})[ft]||(window.ParamioStrategies||{}).DIMENSION;
    return strategy?strategy(c,usable):[];
  };
  window.resultValues=function(c,piece){return chooseReportItems(c,allItems(c,piece)).map(measured).filter(Boolean);};
  window.itemOk=function(c,it){return validateMeasurement(c,it).ok;};
  window.pieceStatus=function(c,piece){const r=pieceResult(c,piece);const mv=manualValue(c,piece);if(!r&&String(mv||'').trim())return'MANUAL';if(!r)return'PEND.';const selected=chooseReportItems(c,allItems(c,piece));if(!selected.length)return String(mv||'').trim()?'MANUAL':'PEND.';return selected.some(it=>!itemOk(c,it))?'NOK':'OK';};
  window.statusOf=function(c){const p=loadProject();const pieces=pieceLabels(p||{characteristics:[c]});if(!pieces.length)return'PEND.';const sts=pieces.map(piece=>pieceStatus(c,piece));if(sts.includes('NOK'))return'NOK';if(sts.includes('OK'))return'OK';if(sts.includes('MANUAL'))return'MANUAL';return'PEND.';};
  window.resultCell=function(c,piece){const autoVals=resultValues(c,piece);const mv=manualValue(c,piece);const vals=mv!==''?String(mv).split(/\n|\/|;/).map(x=>x.trim()).filter(Boolean):autoVals;const st=pieceStatus(c,piece);const red=st==='NOK'?' nokVal':'';if(vals.length){return`<div class="resultStack">${vals.map(v=>`<input class="manualInput${red} ${mv!==''?'override':''}" value="${esc(v)}" onchange="const arr=Array.from(this.closest('.resultStack').querySelectorAll('input')).map(x=>x.value).filter(Boolean);setManual('${esc(c.number)}','${esc(piece)}',arr.join('\\n'))">`).join('')}</div>`;}return`<div class="resultStack"><input class="manualInput manualEmpty" value="" placeholder="Manual" onchange="setManual('${esc(c.number)}','${esc(piece)}',this.value)"></div>`;};
  window.statusPill=function(st){const cls=st==='NOK'?'nok':(st==='PEND.'?'warn':'');return`<span class="pill ${cls}">${esc(st)}</span>`;};
  window.filterRows=function(chars){const q=(document.getElementById('filter')?.value||window.__lastFilter||'').toLowerCase();if(!q)return chars;return chars.filter(c=>[c.number,cleanChar(c.value),c.nominal,c.lower,c.upper,c.units,statusOf(c),featureType(c)].join(' ').toLowerCase().includes(q));};
  window.diagFor=function(c,piece='1'){
    const items=allItems(c,piece);const selected=chooseReportItems(c,items);const ft=featureType(c);
    if(!items.length)return{status:'SIN_COTA',reason:'No existe bloque COTA '+c.number,items:[]};
    if(selected.length)return{status:'OK_LINK',reason:'Strategy '+ft+' selecciono '+selected.length+' fila(s)',items:selected};
    return{status:'SIN_REGLA',reason:'Existe COTA '+c.number+' pero ninguna fila cumple strategy '+ft,items};
  };
})();
