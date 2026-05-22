(function(){
  function inspectionTol(c){
    const n=num(c.nominal), lo=num(c.lower), up=num(c.upper);
    if(Number.isFinite(n)&&Number.isFinite(lo)&&Number.isFinite(up))return Math.max(Math.abs(up-n),Math.abs(n-lo));
    const u=Math.abs(num(c.upper));
    return Number.isFinite(u)?u:NaN;
  }
  function nominalClose(c,it){
    const a=num(c.nominal),b=num(it.nominal);
    if(!Number.isFinite(a)||!Number.isFinite(b))return true;
    return Math.abs(a-b)<=Math.max(0.01,Math.abs(a)*0.0005);
  }
  function measuredInsideInspection(c,it,extra){
    const n=num(c.nominal), v=num(it.measured), tol=inspectionTol(c);
    if(!Number.isFinite(n)||!Number.isFinite(v)||!Number.isFinite(tol))return false;
    const margin=Math.max(extra||0,tol*0.25,0.02);
    return v>=n-tol-margin && v<=n+tol+margin;
  }
  function isDimensionalRow(it){
    const ax=axisOf(it),t=pcText(it);
    if(['TP','DF','PA','PR','2D','3D','PROFILE','FLATNESS','ANGULARITY','PARALLELISM','PERPENDICULARITY','CIRCULARITY','CYLINDRICITY'].includes(ax))return false;
    if(/TRUE\s*POSITION|POSICION|\bPOSITION\b|PROFILE|PERFIL|FLATNESS|PLANITUD|ANGULAR|PARALLEL|PERPENDIC/.test(t))return false;
    return ['X','Y','Z','D','M',''].includes(ax)||/LOCATION|UBICACION|DISTANCE|DIMENSION\s*M|MEDIDA/.test(t);
  }
  function cloneAsActual(c,it,reason){
    const clone=Object.assign({},it);
    clone.originalNominal=it.nominal;
    clone.nominal=String(c.nominal??it.nominal??'');
    clone.semanticAdjusted=true;
    clone.adjustmentReason=reason;
    return clone;
  }
  function adjustedDeviation(c,it){
    const n=num(c.nominal), pcNom=num(it.nominal), delta=num(it.measured);
    if(!Number.isFinite(n)||!Number.isFinite(pcNom)||!Number.isFinite(delta))return null;
    if(Math.abs(pcNom)>1e-9)return null;
    const tol=inspectionTol(c);
    if(!Number.isFinite(tol))return null;
    if(Math.abs(delta)>Math.max(tol*3,0.5))return null;
    const clone=Object.assign({},it);
    clone.originalMeasured=it.measured;
    clone.originalNominal=it.nominal;
    clone.nominal=String(c.nominal??'');
    clone.measured=(n+delta).toFixed(4).replace(/\.?0+$/,'');
    clone.value=clone.measured;
    clone.reportValue=clone.measured;
    clone.adjustedFromDeviation=true;
    clone.adjustmentReason='PC-DMIS nominal 0: medida interpretada como desviacion sobre nominal Inspection';
    return clone;
  }
  window.ParamioStrategies=window.ParamioStrategies||{};
  window.ParamioStrategies.DIMENSION=function(c,items){
    const dimRows=(items||[]).filter(isDimensionalRow);
    const dist=dimRows.filter(it=>(axisOf(it)==='M'||/DISTANCE|DIMENSION\s*M/.test(pcText(it)))&&(nominalClose(c,it)||measuredInsideInspection(c,it,0)));
    if(dist.length)return dedupItems(dist.map(it=>nominalClose(c,it)?it:cloneAsActual(c,it,'Medida real compatible con nominal Inspection')));

    const exactNominal=dimRows.filter(it=>nominalClose(c,it));
    if(exactNominal.length)return dedupItems(exactNominal);

    // Caso real: PC-DMIS puede poner nominal 0 en D pero E trae la medida absoluta real.
    const measuredActual=dimRows.filter(it=>measuredInsideInspection(c,it,0)).map(it=>cloneAsActual(c,it,'Nominal PC-DMIS no coincide, pero medida E cae dentro de nominal/tolerancia Inspection'));
    if(measuredActual.length)return dedupItems(measuredActual);

    // Caso real: LOCATION X/Y/Z con nominal 0 y E como desviacion pequeña respecto al nominal del plano.
    const adjusted=dimRows.map(it=>{
      const ax=axisOf(it),t=pcText(it);
      if(!['X','Y','Z'].includes(ax))return null;
      if(!/LOCATION|UBICACION/.test(t))return null;
      return adjustedDeviation(c,it);
    }).filter(Boolean);
    return dedupItems(adjusted);
  };
})();
