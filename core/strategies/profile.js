window.STRATEGIES = window.STRATEGIES || {};

window.STRATEGIES.profile = {
  type: "PROFILE",
  match: () => false,
  evaluate: () => ({
    status: "PEND",
    method: "PROFILE",
    message: "Strategy pendiente"
  })
};