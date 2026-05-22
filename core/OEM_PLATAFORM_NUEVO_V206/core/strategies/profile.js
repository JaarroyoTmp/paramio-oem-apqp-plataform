(function(){
  window.ParamioStrategies=window.ParamioStrategies||{};
  window.ParamioStrategies.PROFILE=function(c,items){
    return dedupItems(items.filter(it=>{
      const ax=axisOf(it),t=pcText(it);
      if(/PLANITUD|FLATNESS/.test(t))return false;
      return ax==='PROFILE'||/PERFIL|PROFILE/.test(t)||((['X','Y','Z','M'].includes(ax)||/LOCATION|UBICACION/.test(t))&&/UBICACION|LOCATION|DIMENSION/.test(t));
    }));
  };
})();
