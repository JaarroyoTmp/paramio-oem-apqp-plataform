
(function(){
 window.workbookAllRows=function(wb){let all=[];for(const name of wb.SheetNames){const sh=wb.Sheets[name];const rows=XLSX.utils.sheet_to_json(sh,{header:1,raw:false,defval:''});if(rows&&rows.length)all=all.concat(rows,[[]]);}return all;};
 window.parseCsvText=function(text){const lines=text.split(/\r?\n/);const sample=lines.slice(0,20).join('\n');const delim=(sample.match(/;/g)||[]).length>(sample.match(/,/g)||[]).length?';':',';return lines.map(l=>l.split(delim)).filter(r=>r.some(c=>String(c).trim()));};
 function rowText(r){return norm((r||[]).map(x=>String(x??'')).join(' '));}
 function cell(r,i){return(r&&r.length>i)?r[i]:'';}
 function detectAxis(r){const cells=(r||[]).map(norm).filter(Boolean);const text=rowText(r);const c0=norm(cell(r,0)),c1=norm(cell(r,1)),c2=norm(cell(r,2));
   if(c2==='TP'||cells.includes('TP')||/\bTP\b|TRUE\s*POSITION|DIMENSION\s+DE\s+POSICION/.test(text))return'TP';
   if(c2==='DF'||cells.includes('DF'))return'DF'; if(c2==='2D'||c2==='3D'||cells.includes('2D')||cells.includes('3D'))return'2D'; if(c2==='PA'||cells.includes('PA'))return'PA'; if(c2==='PR'||cells.includes('PR'))return'PR';
   if(c2==='X'||cells.includes('X')||/\bUBICACION\s*X\b/.test(c1))return'X'; if(c2==='Y'||cells.includes('Y')||/\bUBICACION\s*Y\b/.test(c1))return'Y'; if(c2==='Z'||cells.includes('Z')||/\bUBICACION\s*Z\b/.test(c1))return'Z';
   if(/^D\d*$/.test(c2)||c2==='D'||cells.some(c=>/^D\d*$/.test(c))||cells.includes('D')||/\bUBICACION\s*D\b/.test(c1))return'D';
   if(/^DIST\d*/.test(c0)||/\bDIMENSION\s*M\b/.test(c1)||/\bDIMENSION\s+M\b/.test(text))return'M';
   if(/PERFIL\s+DE\s+DIMENSION\s+DE\s+SUPERFICIE|SURFACE\s+PROFILE|PROFILE\s+OF\s+A\s+SURFACE/.test(text))return'PERF'; if(/UBICACION\s+DE\s+LA\s+DIMENSION|LOCATION/.test(text))return'UBIC'; if(/PLANITUD|FLATNESS/.test(text))return'FLATNESS'; if(/\bANG\b|ANGULO|ANGLE|ANGULARIDAD/.test(text))return'ANG'; if(cells.includes('M')||/MEDIDO|MEASURED|MEDICION/.test(text))return'M'; return'';}
 function detectRole(r){const text=rowText(r),c0=norm(cell(r,0)),c1=norm(cell(r,1)); if(/^DIST\d*/.test(c0)||/\bDIMENSION\s*M\b/.test(c1)||/\bDIMENSION\s+M\b/.test(text))return'DISTANCE'; if(/PERFIL|PROFILE/.test(text))return'PROFILE'; if(/UBICACION|LOCATION/.test(text))return'LOCATION'; if(/PLANITUD|FLATNESS/.test(text))return'FLATNESS'; if(/POSICION|POSITION|TRUE\s*POSITION|\bTP\b/.test(text))return'POSITION'; if(/ANGULO|ANGLE|ANGULAR/.test(text))return'ANGULARITY'; if(/PARALEL|PARALLEL/.test(text))return'PARALLELISM'; if(/PERPENDIC/.test(text))return'PERPENDICULARITY'; if(/RADIO|RADIUS/.test(text))return'RADIUS'; if(/PROFUNDIDAD|DEPTH/.test(text))return'DEPTH'; return'';}
 function rawObj(cota,r,rowIndex,marker=false){return{cota:String(cota),rowIndex,marker,A:fmt(cell(r,0)),B:fmt(cell(r,1)),C:fmt(cell(r,2)),D_nominal:fmt(cell(r,3)),E_medida:fmt(cell(r,4)),F_tolPlus:fmt(cell(r,5)),G_tolMinus:fmt(cell(r,6)),H_desv:fmt(cell(r,7)),I_extra:fmt(cell(r,8)),axis:marker?'':detectAxis(r),role:marker?'COTA_MARKER':detectRole(r),raw:r.map(fmt),rawText:rowText(r)}}
 function itemObj(cota,r,rowIndex){const axis=detectAxis(r),role=detectRole(r),measured=fmt(cell(r,4));return{cota:String(cota),blockCota:String(cota),axis,kind:axis,role,measured,value:measured,reportValue:measured,name:fmt(cell(r,0)),desc:fmt(cell(r,1)),nominal:fmt(cell(r,3)),plus:fmt(cell(r,5)),minus:fmt(cell(r,6)),deviation:fmt(cell(r,7)),outTol:fmt(cell(r,8)),rowIndex,raw:r.map(fmt),rawText:rowText(r)}}
 window.parsePcDmisRows=function(rows){let meta={},current=null,blocks=new Map(),rawBlocks=new Map();function ensure(n){const k=String(parseInt(n,10));if(!blocks.has(k))blocks.set(k,[]);if(!rawBlocks.has(k))rawBlocks.set(k,[]);return k;}
   for(let i=0;i<rows.length;i++){const r=Array.isArray(rows[i])?rows[i]:[];const first=String(cell(r,0)||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');const text=rowText(r);if(first.includes('nombre de la pieza'))meta.part=cell(r,1)||'';if(first.includes('numero de serie'))meta.serial=cell(r,1)||'';const m=text.match(/COTA\s*[*#:\- ]*\s*(\d+)/);if(m){current=ensure(m[1]);rawBlocks.get(current).push(rawObj(current,r,i+1,true));continue;}if(!current)continue;rawBlocks.get(String(current)).push(rawObj(current,r,i+1,false));const measured=fmt(cell(r,4)),nominal=fmt(cell(r,3));if(!measured||!Number.isFinite(num(measured)))continue;if(!nominal||!Number.isFinite(num(nominal)))continue;blocks.get(String(current)).push(itemObj(current,r,i+1));}
   const result={meta,measures:{},debug:{},rawBlocks:{}};rawBlocks.forEach((rows,n)=>result.rawBlocks[String(n)]=rows);blocks.forEach((items,n)=>{const clean=items.filter(it=>it.measured&&Number.isFinite(num(it.measured)));result.debug[n]=clean.map(it=>({rowIndex:it.rowIndex,axis:it.axis,role:it.role,nominal:it.nominal,measured:it.measured,plus:it.plus,minus:it.minus,name:it.name,desc:it.desc}));if(!clean.length)return;result.measures[String(n)]={items:clean,rawItems:clean,ok:true,serial:meta.serial||'',cota:String(n)};});return result;};
})();


/* ===== PATCH PARSER PCDMIS V2 · COTA MARKER ROBUSTO ===== */
(function(){
  function ppNorm(v){return String(v??'').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();}
  function ppNum(v){const n=parseFloat(String(v??'').replace(',','.').replace(/[^\d.-]/g,''));return Number.isFinite(n)?n:NaN;}
  function ppFmt(v){return v==null?'':String(v).trim();}
  function ppRowText(r){return ppNorm((r||[]).map(x=>String(x??'')).join(' '));}
  function ppCell(r,i){return (r&&r.length>i)?r[i]:'';}
  function ppCotaNumberFromRow(r){
    const full=ppRowText(r).replace(/\*/g,' ').replace(/#/g,' ').replace(/:/g,' ').replace(/-/g,' ');
    let m=full.match(/\bCOTA\s+([0-9]{1,4})\b/);
    if(m) return String(parseInt(m[1],10));
    for(let i=0;i<r.length;i++){
      const c=ppNorm(r[i]).replace(/\*/g,' ');
      if(/\bCOTA\b/.test(c)){
        const same=c.match(/COTA[^0-9]*([0-9]{1,4})/);
        if(same) return String(parseInt(same[1],10));
        for(let j=i+1;j<Math.min(r.length,i+5);j++){
          const n=ppNum(r[j]);
          if(Number.isFinite(n) && n>0 && n<10000) return String(parseInt(n,10));
        }
      }
    }
    return '';
  }
  function ppDetectAxis(r){
    const c0=ppNorm(ppCell(r,0)), c1=ppNorm(ppCell(r,1)), c2=ppNorm(ppCell(r,2));
    const text=ppRowText(r);
    const joined=[c0,c1,c2,text].join(' ');
    if(/\bTP\b|TRUE\s*POSITION|POSICION/.test(joined)) return 'TP';
    if(/\bDF\b/.test(joined)) return 'DF';
    if(/\b2D\b|\b3D\b/.test(joined)) return '2D';
    if(/\bPA\b/.test(joined)) return 'PA';
    if(/\bPR\b/.test(joined)) return 'PR';
    if(/DIST|DISTANCE|DISTANCIA|DIMENSION\s*M/.test(joined)) return 'M';
    if(/\bUBICACION\s*D\b|\bLOCATION\s*D\b|\bD\s+LOCATION\b|\bD\b/.test(joined)) return 'D';
    if(/\bUBICACION\s*X\b|\bLOCATION\s*X\b|\bX\s+LOCATION\b|\bX\b/.test(joined)) return 'X';
    if(/\bUBICACION\s*Y\b|\bLOCATION\s*Y\b|\bY\s+LOCATION\b|\bY\b/.test(joined)) return 'Y';
    if(/\bUBICACION\s*Z\b|\bLOCATION\s*Z\b|\bZ\s+LOCATION\b|\bZ\b/.test(joined)) return 'Z';
    if(/PERFIL|PROFILE/.test(joined)) return 'PERF';
    if(/PLANITUD|FLATNESS/.test(joined)) return 'FLATNESS';
    if(/ANGULO|ANGLE|ANGULAR/.test(joined)) return 'ANG';
    if(/\bM\b|MEDIDO|MEASURED|MEDICION/.test(joined)) return 'M';
    return '';
  }
  function ppDetectRole(r){
    const text=ppRowText(r);
    if(/DIST|DISTANCE|DISTANCIA|DIMENSION\s*M/.test(text)) return 'DISTANCE';
    if(/PERFIL|PROFILE/.test(text)) return 'PROFILE';
    if(/UBICACION|LOCATION/.test(text)) return 'LOCATION';
    if(/PLANITUD|FLATNESS/.test(text)) return 'FLATNESS';
    if(/POSICION|POSITION|TRUE\s*POSITION|\bTP\b/.test(text)) return 'POSITION';
    if(/ANGULO|ANGLE|ANGULAR/.test(text)) return 'ANGULARITY';
    if(/PARALEL|PARALLEL/.test(text)) return 'PARALLELISM';
    if(/PERPENDIC/.test(text)) return 'PERPENDICULARITY';
    if(/RADIO|RADIUS/.test(text)) return 'RADIUS';
    if(/PROFUNDIDAD|DEPTH/.test(text)) return 'DEPTH';
    return '';
  }
  window.parsePcDmisRows=function(rows){
    let meta={}, current=null, blocks=new Map(), rawBlocks=new Map();
    function ensure(n){
      const k=String(parseInt(n,10));
      if(!blocks.has(k)) blocks.set(k,[]);
      if(!rawBlocks.has(k)) rawBlocks.set(k,[]);
      return k;
    }
    function rawRow(cota,r,rowIndex,marker=false){
      return {cota:String(cota),rowIndex,marker,A:ppFmt(ppCell(r,0)),B:ppFmt(ppCell(r,1)),C:ppFmt(ppCell(r,2)),D_nominal:ppFmt(ppCell(r,3)),E_medida:ppFmt(ppCell(r,4)),F_tolPlus:ppFmt(ppCell(r,5)),G_tolMinus:ppFmt(ppCell(r,6)),H_desv:ppFmt(ppCell(r,7)),I_extra:ppFmt(ppCell(r,8)),axis:marker?'':ppDetectAxis(r),role:marker?'COTA_MARKER':ppDetectRole(r),raw:(r||[]).map(ppFmt),rawText:ppRowText(r)};
    }
    function item(cota,r,rowIndex){
      const ax=ppDetectAxis(r), role=ppDetectRole(r);
      return {cota:String(cota),blockCota:String(cota),axis:ax,kind:ax,role,measured:ppFmt(ppCell(r,4)),value:ppFmt(ppCell(r,4)),reportValue:ppFmt(ppCell(r,4)),name:ppFmt(ppCell(r,0)),desc:ppFmt(ppCell(r,1)),nominal:ppFmt(ppCell(r,3)),plus:ppFmt(ppCell(r,5)),minus:ppFmt(ppCell(r,6)),deviation:ppFmt(ppCell(r,7)),outTol:ppFmt(ppCell(r,8)),rowIndex,raw:(r||[]).map(ppFmt),rawText:ppRowText(r)};
    }
    for(let i=0;i<rows.length;i++){
      const r=Array.isArray(rows[i])?rows[i]:[];
      const first=String(ppCell(r,0)||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
      if(first.includes('nombre de la pieza')) meta.part=ppCell(r,1)||'';
      if(first.includes('numero de serie')) meta.serial=ppCell(r,1)||'';
      const cotaN=ppCotaNumberFromRow(r);
      if(cotaN){current=ensure(cotaN); rawBlocks.get(current).push(rawRow(current,r,i+1,true)); continue;}
      if(!current) continue;
      rawBlocks.get(String(current)).push(rawRow(current,r,i+1,false));
      const D=ppCell(r,3), E=ppCell(r,4);
      if(!Number.isFinite(ppNum(D)) || !Number.isFinite(ppNum(E))) continue;
      blocks.get(String(current)).push(item(current,r,i+1));
    }
    const result={meta,measures:{},debug:{},rawBlocks:{}};
    rawBlocks.forEach((rows,n)=>{result.rawBlocks[String(n)]=rows;});
    blocks.forEach((items,n)=>{
      const clean=items.filter(it=>it.measured && Number.isFinite(ppNum(it.measured)));
      result.debug[n]=clean.map(it=>({rowIndex:it.rowIndex,axis:it.axis,role:it.role,nominal:it.nominal,measured:it.measured,plus:it.plus,minus:it.minus,name:it.name,desc:it.desc}));
      if(clean.length) result.measures[String(n)]={items:clean,rawItems:clean,ok:true,serial:meta.serial||'',cota:String(n)};
    });
    return result;
  };
})();
