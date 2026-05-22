(function(){
  window.ParamioStrategies=window.ParamioStrategies||{};
  window.ParamioStrategies.FLATNESS=function(c,items){return dedupItems(items.filter(it=>axisOf(it)==='FLATNESS'||/PLANITUD|FLATNESS/.test(pcText(it))));};
})();
