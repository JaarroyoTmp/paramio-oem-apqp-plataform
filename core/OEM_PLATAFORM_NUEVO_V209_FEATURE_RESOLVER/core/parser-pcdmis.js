(function(){
  window.workbookAllRows=function(wb){let all=[];for(const name of wb.SheetNames){const sh=wb.Sheets[name];const rows=XLSX.utils.sheet_to_json(sh,{header:1,raw:false,defval:''});if(rows&&rows.length)all=all.concat(rows,[[]]);}return all;};
  window.parseCsvText=function(text){const lines=String(text||'').split(/\r?\n/);const sample=lines.slice(0,25).join('\n');const delim=(sample.match(/;/g)||[]).length>(sample.match(/,/g)||[]).length?';':',';return lines.map(l=>l.split(delim)).filter(r=>r.some(c=>String(c).trim()));};
  function cell(r,i){return(r&&r.length>i)?r[i]:'';}
  function rowText(r){return norm((r||[]).map(x=>String(x??'')).join(' '));}
  function rawAxis(r){
    const c=norm(cell(r,2));const b=norm(cell(r,1));const a=norm(cell(r,0));const t=rowText(r);
    // La columna C manda para el eje. La descripcion puede decir "dimension de posicion",
    // pero eso no convierte X/Y/D/DF/D1 en TP.
    if(c==='TP')return'TP';
    if(c==='X')return'X';
    if(c==='Y')return'Y';
    if(c==='Z')return'Z';
    if(c==='DF')return'DF';
    if(/^D\d*$/.test(c)||c==='D')return'D';
    if(c==='M')return'M';
    if(/UBICACION\s*X|LOCATION\s*X/.test(b))return'X';
    if(/UBICACION\s*Y|LOCATION\s*Y/.test(b))return'Y';
    if(/UBICACION\s*Z|LOCATION\s*Z/.test(b))return'Z';
    if(/UBICACION\s*D|LOCATION\s*D|DIAM/.test(b))return'D';
    if(/^DIST/.test(a)||/DIMENSION\s*M|DISTANCE/.test(t))return'M';
    if(/\bTP\b|TRUE\s*POSITION|POSICION/.test(t))return'TP';
    if(/PERFIL|PROFILE/.test(t))return'PROFILE';
    if(/PLANITUD|FLATNESS/.test(t))return'FLATNESS';
    if(/ANGULO|ANGLE|ANGULAR/.test(t))return'ANGULARITY';
    if(/PARALEL|PARALLEL/.test(t))return'PARALLELISM';
    if(/PERPENDIC/.test(t))return'PERPENDICULARITY';
    if(/PROFUNDIDAD|DEPTH/.test(t))return'DEPTH';
    if(/RADIO|RADIUS/.test(t))return'RADIUS';
    return c||'';
  }
  function rawRole(r){
    const t=rowText(r);const a=norm(cell(r,0));const b=norm(cell(r,1));
    if(/^DIST/.test(a)||/DISTANCE|DIMENSION\s*M/.test(t))return'DISTANCE';
    if(/\bTP\b|TRUE\s*POSITION|POSICION|POSITION/.test(t))return'POSITION';
    if(/PERFIL|PROFILE/.test(t))return'PROFILE';
    if(/UBICACION|LOCATION/.test(t))return'LOCATION';
    if(/PLANITUD|FLATNESS/.test(t))return'FLATNESS';
    if(/ANGULO|ANGLE|ANGULAR/.test(t))return'ANGULARITY';
    if(/PARALEL|PARALLEL/.test(t))return'PARALLELISM';
    if(/PERPENDIC/.test(t))return'PERPENDICULARITY';
    if(/PROFUNDIDAD|DEPTH/.test(t))return'DEPTH';
    if(/RADIO|RADIUS/.test(t))return'RADIUS';
    if(/DIAM|UBICACION\s*D|LOCATION\s*D/.test(b))return'DIAMETER';
    return'';
  }
  function rawObj(cota,r,rowIndex,marker){
    return {cota:String(cota),blockCota:String(cota),rowIndex,marker:!!marker,A:fmt(cell(r,0)),B:fmt(cell(r,1)),C:fmt(cell(r,2)),D_nominal:fmt(cell(r,3)),E_medida:fmt(cell(r,4)),F_tolPlus:fmt(cell(r,5)),G_tolMinus:fmt(cell(r,6)),H_desv:fmt(cell(r,7)),I_extra:fmt(cell(r,8)),axis:marker?'':rawAxis(r),role:marker?'COTA_MARKER':rawRole(r),raw:(r||[]).map(fmt),rawText:rowText(r)};
  }
  function itemObj(o){return {cota:o.cota,blockCota:o.cota,rowIndex:o.rowIndex,axis:o.axis,kind:o.axis,role:o.role,measured:o.E_medida,value:o.E_medida,reportValue:o.E_medida,name:o.A,desc:o.B,nominal:o.D_nominal,plus:o.F_tolPlus,minus:o.G_tolMinus,deviation:o.H_desv,outTol:o.I_extra,raw:o.raw,rawText:o.rawText};}
  window.parsePcDmisRows=function(rows){
    const meta={},rawBlocks={},itemsByCota={},globalItems=[];let current=null;
    function ensure(n){const k=String(parseInt(n,10));rawBlocks[k]=rawBlocks[k]||[];itemsByCota[k]=itemsByCota[k]||[];return k;}
    for(let i=0;i<rows.length;i++){
      const r=Array.isArray(rows[i])?rows[i]:[];const first=String(cell(r,0)||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');const text=rowText(r);
      if(first.includes('nombre de la pieza'))meta.part=cell(r,1)||'';
      if(first.includes('numero de serie'))meta.serial=cell(r,1)||'';
      if(first.includes('no pieza')||first.includes('nº pieza')||first.includes('n pieza'))meta.piece=cell(r,1)||meta.piece||'';
      const m=text.match(/COTA\s*[*#:\- ]*\s*(\d+)/);
      if(m){current=ensure(m[1]);rawBlocks[current].push(rawObj(current,r,i+1,true));continue;}
      if(!current)continue;
      const ro=rawObj(current,r,i+1,false);rawBlocks[current].push(ro);
      if(Number.isFinite(num(ro.E_medida))){const it=itemObj(ro);itemsByCota[current].push(it);globalItems.push(it);}
    }
    const measures={},debug={};
    Object.keys(itemsByCota).forEach(n=>{const items=itemsByCota[n];debug[n]=items.map(it=>({rowIndex:it.rowIndex,axis:it.axis,role:it.role,nominal:it.nominal,measured:it.measured,plus:it.plus,minus:it.minus,name:it.name,desc:it.desc}));if(items.length)measures[n]={items,rawItems:items,ok:true,serial:meta.serial||'',cota:n};});
    return {meta,measures,debug,rawBlocks,globalItems};
  };
})();
