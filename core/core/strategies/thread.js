(function(){
  window.ParamioStrategies=window.ParamioStrategies||{};
  window.ParamioStrategies.THREAD=function(c,items){return dedupItems(items.filter(it=>{const t=pcText(it),ax=axisOf(it);return ax==='M'||ax==='D'||/ROSCA|THREAD|\bM\d+/.test(t);}));};
})();
