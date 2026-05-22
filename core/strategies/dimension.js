window.ParamioStrategies = window.ParamioStrategies || {};

window.ParamioStrategies.dimension = {
  type: "DIMENSION",
  match(c) {
    const txt = [c?.type, c?.characteristic, c?.specification, c?.name].join(" ").toLowerCase();
    return txt.includes("dimension") || txt.includes("diameter") || txt.includes("Ø");
  },
  evaluate(c, result) {
    return window.evaluateResult
      ? window.evaluateResult(c, result)
      : { status: "PEND", method: "DIMENSION", message: "Strategy pendiente" };
  }
};