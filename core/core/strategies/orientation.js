(function(){
  function tol(c){
    if(typeof inspectionTolAbs==='function'){const v=inspectionTolAbs(c); if(Number.isFinite(v))return v;}
    const vals=[c?.upper,c?.tolerance?.upper,c?.tolerance].map(num).map(Math.abs).filter(Number.isFinite);
    return vals.length?Math.max(...vals):NaN;
  }
  function measuredNumber(it){return num(measured(it));}
  function isPrimaryOrientationRow(c,it,type,rx){
    const ax=axisOf(it);
    const col=String(it?.C||it?.raw?.[2]||'').trim().toUpperCase();
    const t=pcText(it);
    const v=measuredNumber(it);
    const limit=tol(c);
    if(!Number.isFinite(v))return false;
    if(['X','Y','Z','D','DF','TP','2D','3D','PROFILE'].includes(ax)||['X','Y','Z','D','DF','TP','2D','3D'].includes(col))return false;

    const direct=(ax===type)||rx.test(t);
    const fallbackMZero=(ax==='M'||col==='M'||ax==='') && Number.isFinite(num(it.nominal)) && Math.abs(num(it.nominal))<1e-9;
    if(!direct && !fallbackMZero)return false;

    // V218: para orientación solo se muestra el error geométrico dentro de tolerancia.
    // Ej: ANGULARITY 0.002 OK; no mostrar 8.99 grados/ubicación auxiliar.
    if(Number.isFinite(limit))return v>=-1e-9 && v<=limit+1e-9;
    return true;
  }
  function make(type,rx){
    window.ParamioStrategies=window.ParamioStrategies||{};
    window.ParamioStrategies[type]=function(c,items){
      return dedupItems((items||[]).filter(it=>isPrimaryOrientationRow(c,it,type,rx)));
    };
  }
  make('ANGULARITY',/ANGULO|ANGLE|ANGULARIDAD|ANGULARITY/);
  make('PARALLELISM',/PARALEL|PARALLEL/);
  make('PERPENDICULARITY',/PERPENDICULAR|PERPENDICULARITY/);
})();
