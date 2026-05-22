window.ParamioStrategies = window.ParamioStrategies || {};

window.ParamioStrategies.radius = {
  type: "RADIUS",

  match(c) {
    const txt = [
      c?.type,
      c?.characteristic,
      c?.specification,
      c?.name
    ].join(" ").toLowerCase();

    return txt.includes("radius") ||
           txt.includes("radio") ||
           txt.includes(" r");
  },

  evaluate(c, result) {
    return window.evaluateResult
      ? window.evaluateResult(c, result)
      : {
          status: "PEND",
          method: "RADIUS",
          message: "Strategy radio pendiente"
        };
  }
};