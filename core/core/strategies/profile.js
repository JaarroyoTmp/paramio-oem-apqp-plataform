(function(){
  window.ParamioStrategies=window.ParamioStrategies||{};
  function isProfilePrimary(it){
    const ax=axisOf(it),t=pcText(it);
    if(/PLANITUD|FLATNESS/.test(t))return false;
    // V212: el resultado de PROFILE es la fila de error de perfil, normalmente M PROFILE.
    // LOCATION X/Y/Z son contexto asociado, no valores a validar contra tolerancia de perfil.
    return ax==='PROFILE'||/\bPROFILE\b|\bPERFIL\b/.test(t);
  }
  window.ParamioStrategies.PROFILE=function(c,items){
    return dedupItems((items||[]).filter(isProfilePrimary));
  };
})();
