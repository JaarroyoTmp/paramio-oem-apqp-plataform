(function(){
  function workbookToRows(wb){const sh=wb.Sheets[wb.SheetNames[0]];return XLSX.utils.sheet_to_json(sh,{header:1,raw:false,defval:''});}
  function findHeader(rows){
    for(let i=0;i<Math.min(rows.length,60);i++){
      const line=rows[i].map(x=>norm(x).replace(/\s+/g,' '));
      if(line.some(x=>x.includes('CHAR')&&x.includes('NUMBER'))||line.some(x=>x.includes('GLOBO')||x==='Nº'||x==='NO'))return i;
    }
    return 0;
  }
  function nominalFrom(li,ls,value){
    const a=num(li),b=num(ls);
    if(Number.isFinite(a)&&Number.isFinite(b))return((a+b)/2).toFixed(4).replace(/\.?0+$/,'');
    const m=String(value||'').match(/[-+]?\d+(?:[,.]\d+)?/);
    return m?m[0].replace(',','.'):'';
  }
  window.parseInspectionWorkbook=function(wb){
    const rows=workbookToRows(wb);const hr=findHeader(rows);
    const h=rows[hr].map(x=>norm(x).replace(/[.]/g,'').replace(/\s+/g,' ').trim());
    const find=(tests)=>{for(const t of tests){const idx=h.findIndex(x=>x.includes(norm(t)));if(idx>=0)return idx;}return-1;};
    let cnum=find(['char number','characteristic number','balloon','globo','nº','no']);
    let cval=find(['value','valor','caracter','descrip']);
    let cunit=find(['units','unidad','ud']);
    let cup=find(['upper','superior','sup','ls','ucl']);
    let clow=find(['lower','inferior','inf','li','lcl']);
    if(cnum<0)cnum=0;if(cval<0)cval=1;
    const out=[];
    for(let i=hr+1;i<rows.length;i++){
      const r=rows[i];const n=parseInt(String(r[cnum]||'').replace(',','.'),10);if(!Number.isFinite(n))continue;
      const rawCell=fmt(r[cval]);const decoded=swDecode(rawCell);const value=cleanFeatureText(rawCell,n);
      const lower=fmt(r[clow]),upper=fmt(r[cup]);const featureType=normalizeFeatureType(rawCell+' '+decoded+' '+value);
      out.push({number:n,balloon:String(n),value,rawValue:rawCell,decodedValue:decoded,featureType,nominal:nominalFrom(lower,upper,decoded||value),units:fmt(r[cunit]),upper,lower,kcs:false,comment:'',assignedOp:'20',results:{}});
    }
    return out.sort((a,b)=>a.number-b.number);
  };
})();
