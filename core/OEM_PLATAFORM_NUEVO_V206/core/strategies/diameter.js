(function(){
  window.ParamioStrategies=window.ParamioStrategies||{};
  window.ParamioStrategies.DIAMETER=function(c,items){
    return dedupItems(items.filter(it=>{
      const ax=axisOf(it),t=pcText(it);
      if(ax==='TP'||/TRUE\s*POSITION|POSICION/.test(t))return false;
      return ax==='D'||ax==='DF'||/[Ø⌀]|DIAM|UBICACION\s*D|LOCATION\s*D|\bD\s*LOCATION/.test(t);
    }));
  };
})();
