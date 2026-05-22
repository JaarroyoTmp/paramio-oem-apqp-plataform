(function(){
  window.ParamioStrategies=window.ParamioStrategies||{};
  window.ParamioStrategies.DEPTH=function(c,items){return dedupItems(items.filter(it=>axisOf(it)==='DEPTH'||/PROFUNDIDAD|DEPTH/.test(pcText(it))));};
})();
