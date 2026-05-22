(function(){
  function make(type,rx){window.ParamioStrategies=window.ParamioStrategies||{};window.ParamioStrategies[type]=function(c,items){return dedupItems(items.filter(it=>axisOf(it)===type||rx.test(pcText(it))));};}
  make('ANGULARITY',/ANGULO|ANGLE|ANGULARIDAD|ANGULARITY/);
  make('PARALLELISM',/PARALEL|PARALLEL/);
  make('PERPENDICULARITY',/PERPENDICULAR|PERPENDICULARITY/);
})();
