(function(){
  window.ParamioStrategies=window.ParamioStrategies||{};

  function colC(it){return String(it?.C||it?.raw?.[2]||'').trim().toUpperCase();}

  function isTruePositionRow(it){
    const c=colC(it);
    const name=String(it?.name||it?.A||it?.raw?.[0]||'').trim().toUpperCase();
    const desc=String(it?.desc||it?.B||it?.raw?.[1]||'').trim().toUpperCase();
    const t=pcText(it);

    // V218: POSITION = solo TP real.
    // Descarta X/Y/Z/D/DF/2D/3D POSITION aunque PC-DMIS lo describa como posicion.
    if(['X','Y','Z','D','DF','D1','D2','2D','3D','PA','PR','M'].includes(c))return false;
    if(c==='TP')return true;
    if(/^TP(\s|_|-|$)/.test(name))return true;
    if(/^TP(\s|_|-|$)/.test(desc))return true;
    if(/TRUE\s*POSITION/.test(t))return true;
    return false;
  }

  window.ParamioStrategies.POSITION=function(c,items){
    return dedupItems((items||[]).filter(isTruePositionRow));
  };
})();
