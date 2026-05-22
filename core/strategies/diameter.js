window.STRATEGIES = window.STRATEGIES || {};

window.STRATEGIES.diameter = {
  type: "DIAMETER",
  match: () => false,
  evaluate: () => ({
    status: "PEND",
    method: "DIAMETER",
    message: "Strategy pendiente"
  })
};