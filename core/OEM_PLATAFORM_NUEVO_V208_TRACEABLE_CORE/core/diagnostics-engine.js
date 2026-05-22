(function(){
  function csvEscape(v){return '"'+String(v??'').replace(/"/g,'""')+'"';}
  window.diagnosticSummary=function(p,piece='1'){
    const traces=traceProject(p,piece);
    const by={};
    traces.forEach(t=>{by[t.status]=(by[t.status]||0)+1;});
    return {
      total:traces.length,
      ok:by.OK||0,
      nok:by.NOK||0,
      pending:(by.SIN_BLOQUE_PCDMIS||0)+(by.SIN_MEDIDA_NUMERICA||0)+(by.SIN_REGLA||0),
      sinBloque:by.SIN_BLOQUE_PCDMIS||0,
      sinMedida:by.SIN_MEDIDA_NUMERICA||0,
      sinRegla:by.SIN_REGLA||0,
      byStatus:by,
      traces
    };
  };
  window.exportTraceCsv=function(p,piece='1'){
    p=p||loadProject();
    const traces=traceProject(p,piece);
    const rows=[['Cota','Pieza','Tipo Inspection','Strategy','Estado','Confianza','Modo validacion','Candidatas','Seleccionadas','Motivo','Seleccion RAW','Descartes']];
    traces.forEach(t=>{
      rows.push([
        t.balloon,t.piece,t.inspectionType,t.strategy,t.status,t.confidence,t.validationMode,t.candidatesFound,t.selectedCount,t.reason,
        t.selected.map(s=>`fila ${s.rowIndex} ${s.axis}/${s.role} D=${s.nominal} E=${s.measured} ${s.validation?s.validation.status:''}`).join(' | '),
        t.discarded.map(d=>`fila ${d.rowIndex} ${d.axis}/${d.role}: ${d.discardReason}`).join(' | ')
      ]);
    });
    const csv=rows.map(r=>r.map(csvEscape).join(';')).join('\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='diagnostico_trazable_v208.csv';a.click();URL.revokeObjectURL(a.href);
  };
})();
