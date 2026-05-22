(function(){
  window.ParamioStrategies=window.ParamioStrategies||{};
  window.ParamioStrategies.POSITION=function(c,items){
    return dedupItems(items.filter(it=>{
      const ax=axisOf(it),t=pcText(it);
      return ax==='TP'||/\bTP\b|TRUE\s*POSITION|DIMENSION\s+DE\s+POSICION/.test(t);
    }));
  };
})();
