window.ParamioStrategies = window.ParamioStrategies || {};

window.ParamioStrategies.orientation = {
  type: "ORIENTATION",

  match(c) {
    const txt = [
      c?.type,
      c?.characteristic,
      c?.specification,
      c?.name
    ].join(" ").toLowerCase();

    return txt.includes("orientation") ||
           txt.includes("orientación") ||
           txt.includes("parallel") ||
           txt.includes("paralelismo") ||
           txt.includes("perpendicular") ||
           txt.includes("perpendicularidad") ||
           txt.includes("angular") ||
           txt.includes("angularidad");
  },

  evaluate(c, result) {
    return window.evaluateResult
      ? window.evaluateResult(c, result)
      : {
          status: "PEND",
          method: "ORIENTATION",
          message: "Strategy orientación pendiente"
        };
  }
};