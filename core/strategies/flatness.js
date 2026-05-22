window.STRATEGIES = window.STRATEGIES || {};

window.STRATEGIES.flatness = {
  type: "FLATNESS",
  match: () => false,
  evaluate: () => ({
    status: "PEND",
    method: "FLATNESS",
    message: "Strategy pendiente"
  })
};