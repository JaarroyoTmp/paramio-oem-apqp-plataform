window.ParamioStrategies = window.ParamioStrategies || {};

window.ParamioStrategies.position = {
  type: "POSITION",
  match(c) {
    const txt = [c?.type, c?.characteristic, c?.specification, c?.name].join(" ").toLowerCase();
    return txt.includes("position") || txt.includes("posición") || txt.includes("true position");
  },
  evaluate(c, result) {
    return window.evaluateResult
      ? window.evaluateResult(c, result)
      : { status: "PEND", method: "POSITION", message: "Strategy pendiente" };
  }
};