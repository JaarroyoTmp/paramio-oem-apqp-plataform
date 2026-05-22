(function(){
  function nominalClose(c,it){const a=num(c.nominal),b=num(it.nominal);if(!Number.isFinite(a)||!Number.isFinite(b))return true;return Math.abs(a-b)<=0.01;}
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
    return dist.length?dedupItems(dist):dedupItems(valid);
  };
})();
