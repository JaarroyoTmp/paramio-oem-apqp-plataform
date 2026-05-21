(function(){
  window.buildDiagnostics = function(project){
    const characteristics = project?.characteristics || [];
    const diagnostics = [];

    characteristics.forEach(c => {
      const results = c.results || {};
      const pieces = Object.keys(results);

      if(!pieces.length){
        diagnostics.push({
          balloon: c.number,
          type: c.type,
          characteristic: c.characteristic,
          status: "SIN_MEDICION",
          message: "No existe bloque PC-DMIS asociado"
        });
        return;
      }

      pieces.forEach(piece => {
        const evaluation = window.evaluateResult
          ? window.evaluateResult(c, results[piece])
          : { status: "PEND.", message: "Motor no disponible" };

        diagnostics.push({
          balloon: c.number,
          piece,
          type: c.type,
          characteristic: c.characteristic,
          status: evaluation.status,
          message: evaluation.message
        });
      });
    });

    return diagnostics;
  };
})();