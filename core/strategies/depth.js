window.ParamioStrategies = window.ParamioStrategies || {};

window.ParamioStrategies.depth = {
  type: "DEPTH",

  match(c) {
    const txt = [
      c?.type,
      c?.characteristic,
      c?.specification,
      c?.name
    ].join(" ").toLowerCase();

    return txt.includes("depth") ||
           txt.includes("profundidad") ||
           txt.includes("prof.");
  },

  evaluate(c, result) {
    return window.evaluateResult
      ? window.evaluateResult(c, result)
      : {
          status: "PEND",
          method: "DEPTH",
          message: "Strategy profundidad pendiente"
        };
  }
};