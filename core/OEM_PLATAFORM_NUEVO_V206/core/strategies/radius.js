(function(){
  window.ParamioStrategies=window.ParamioStrategies||{};
  window.ParamioStrategies.RADIUS=function(c,items){return dedupItems(items.filter(it=>axisOf(it)==='RADIUS'||/RADIO|RADIUS|\bR\s*\d/.test(pcText(it))));};
})();
