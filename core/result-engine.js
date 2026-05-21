(function(){
  window.evaluateResult = function(characteristic, result){
    if(!result){
      return {
        status: "SIN_MEDICION",
        ok: false,
        message: "Sin medición asociada"
      };
    }

    if(result.status){
      return {
        status: result.status,
        ok: String(result.status).toUpperCase() === "OK",
        message: "Estado importado desde PC-DMIS"
      };
    }

    const value = Number(result.value ?? result.measured ?? result.result);
    const li = Number(characteristic?.li ?? characteristic?.lower ?? characteristic?.lowerLimit);
    const ls = Number(characteristic?.ls ?? characteristic?.upper ?? characteristic?.upperLimit);

    if(Number.isFinite(value) && Number.isFinite(li) && Number.isFinite(ls)){
      const ok = value >= li && value <= ls;
      return {
        status: ok ? "OK" : "NOK",
        ok,
        value,
        message: ok ? "Dentro de tolerancia" : "Fuera de tolerancia"
      };
    }

    return {
      status: "PEND.",
      ok: false,
      message: "No se puede evaluar automáticamente"
    };
  };
})();