(function(){
  function nominalClose(c,it){
    const a=num(c.nominal),b=num(it.nominal);
    if(!Number.isFinite(a)||!Number.isFinite(b))return true;
    return Math.abs(a-b)<=0.01;
  }
  function inspectionTol(c){
    const n=num(c.nominal), lo=num(c.lower), up=num(c.upper);
    if(Number.isFinite(n)&&Number.isFinite(lo)&&Number.isFinite(up))return Math.max(Math.abs(up-n),Math.abs(n-lo));
    return NaN;
  }
  function adjustedLocation(c,it){
    const n=num(c.nominal), pcNom=num(it.nominal), delta=num(it.measured);
    if(!Number.isFinite(n)||!Number.isFinite(pcNom)||!Number.isFinite(delta))return null;
    if(Math.abs(pcNom)>1e-9)return null;
    const tol=inspectionTol(c);
    // Caso real PC-DMIS: LOCATION X/Y/Z con nominal 0 mide desviacion respecto al nominal del plano.
    // Se informa como valor real = nominal Inspection + desviacion PC-DMIS.
    if(Number.isFinite(tol)&&Math.abs(delta)>Math.max(tol*3,0.5))return null;
    const clone=Object.assign({},it);
    clone.originalMeasured=it.measured;
    clone.originalNominal=it.nominal;
    clone.measured=(n+delta).toFixed(4).replace(/\.?0+$/,'');
    clone.value=clone.measured;
    clone.reportValue=clone.measured;
    clone.adjustedFromDeviation=true;
    clone.adjustmentReason='PC-DMIS nominal 0: medida interpretada como desviacion sobre nominal Inspection';
    return clone;
  }
  window.ParamioStrategies=window.ParamioStrategies||{};
  window.ParamioStrategies.DIMENSION=function(c,items){
    const valid=items.filter(it=>{
      const ax=axisOf(it),t=pcText(it);
      if(['TP','DF','PA','PR','2D','3D','PROFILE','FLATNESS','ANGULARITY','PARALLELISM','PERPENDICULARITY'].includes(ax))return false;
      if(/TRUE\s*POSITION|POSICION|POSITION|PROFILE|PERFIL|FLATNESS|PLANITUD/.test(t))return false;
      if(!nominalClose(c,it))return false;
      return ['X','Y','Z','D','M',''].includes(ax)||/LOCATION|UBICACION|DISTANCE|DIMENSION\s*M/.test(t);
    });
    const dist=valid.filter(it=>axisOf(it)==='M'||/DISTANCE|DIMENSION\s*M/.test(pcText(it)));
    if(dist.length)return dedupItems(dist);
    if(valid.length)return dedupItems(valid);

    // Fallback controlado: bloque con ubicacion nominal 0 medido como desviacion.
    const adjusted=items.map(it=>{
      const ax=axisOf(it),t=pcText(it);
      if(!['X','Y','Z'].includes(ax))return null;
      if(/TRUE\s*POSITION|POSICION|POSITION|PROFILE|PERFIL|FLATNESS|PLANITUD/.test(t))return null;
      if(!/LOCATION|UBICACION/.test(t))return null;
      return adjustedLocation(c,it);
    }).filter(Boolean);
    return dedupItems(adjusted);
  };
})();
