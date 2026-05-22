(function(){
  function n(v){
    const x=parseFloat(String(v??'').replace(',','.').replace(/[^\d.-]/g,''));
    return Number.isFinite(x)?x:NaN;
  }
  function txt(v){return String(v??'').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,' ');}
  function depthNominalFromInspection(c){
    const direct=n(c&&c.nominal);
    if(Number.isFinite(direct))return Math.abs(direct);
    const s=txt([c&&c.value,c&&c.rawValue,c&&c.decodedValue,c&&c.description].join(' '));
    const m=s.match(/(?:PROFUNDIDAD|DEPTH)\s*([-+]?\d+(?:[,.]\d+)?)/)||s.match(/([-+]?\d+(?:[,.]\d+)?)/);
    return m?Math.abs(n(m[1])):NaN;
  }
  function closeAbs(a,b){
    if(!Number.isFinite(a)||!Number.isFinite(b))return false;
    const tolerance=Math.max(0.02,Math.abs(a)*0.002);
    return Math.abs(Math.abs(a)-Math.abs(b))<=tolerance;
  }
  function isDirectDepth(it){
    const ax=axisOf(it);
    const t=pcText(it);
    return ax==='DEPTH'||/\bDEPTH\b|PROFUNDIDAD/.test(t);
  }
  function isSignedLocationDepth(c,it){
    const t=pcText(it);
    const ax=axisOf(it);
    if(!/LOCATION|UBICACION|PLANO/.test(t))return false;
    if(!['X','Y','Z','D','M',''].includes(ax))return false;
    const wanted=depthNominalFromInspection(c);
    const pcNom=n(it&&it.nominal);
    if(!closeAbs(wanted,pcNom))return false;
    return true;
  }
  window.ParamioStrategies=window.ParamioStrategies||{};
  window.ParamioStrategies.DEPTH=function(c,items){
    return dedupItems((items||[]).filter(function(it){
      return isDirectDepth(it)||isSignedLocationDepth(c,it);
    }));
  };
})();
