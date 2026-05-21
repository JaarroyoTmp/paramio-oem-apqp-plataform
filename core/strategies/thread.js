(function(){
  window.ParamioStrategies = window.ParamioStrategies || {};

  window.ParamioStrategies.thread = {
    type: "THREAD",
    match(characteristic){
      const txt = [
        characteristic?.type,
        characteristic?.characteristic,
        characteristic?.specification,
        characteristic?.name
      ].join(" ").toLowerCase();

      return txt.includes("rosca") ||
             txt.includes("thread") ||
             txt.includes("m ") ||
             txt.includes("métric") ||
             txt.includes("metric");
    },
    evaluate(characteristic, result){
      return {
        status: result?.status || "PEND.",
        method: "THREAD",
        message: "Evaluación de rosca pendiente de regla específica"
      };
    }
  };
})();