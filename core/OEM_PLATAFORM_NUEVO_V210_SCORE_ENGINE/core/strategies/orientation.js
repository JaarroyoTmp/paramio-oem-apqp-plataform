(function(){
  function fallbackSingleZero(c,items,type){
    const numeric=(items||[]).filter(it=>Number.isFinite(num(measured(it))));
    if(numeric.length!==1)return [];
    const it=numeric[0];
    const ax=axisOf(it), t=pcText(it);
    if(['X','Y','Z','D','DF','TP','PROFILE'].includes(ax))return [];
    if(Number.isFinite(num(it.nominal))&&Math.abs(num(it.nominal))>1e-9)return [];
    return [it];
  }
  function make(type,rx){
    window.ParamioStrategies=window.ParamioStrategies||{};
    window.ParamioStrategies[type]=function(c,items){
      const direct=dedupItems(items.filter(it=>axisOf(it)===type||rx.test(pcText(it))));
      if(direct.length)return direct;
      return dedupItems(fallbackSingleZero(c,items,type));
    };
  }
  make('ANGULARITY',/ANGULO|ANGLE|ANGULARIDAD|ANGULARITY/);
  make('PARALLELISM',/PARALEL|PARALLEL/);
  make('PERPENDICULARITY',/PERPENDICULAR|PERPENDICULARITY/);
})();
