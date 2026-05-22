function workbookAllRows(wb){
  const rows = [];
  wb.SheetNames.forEach(name=>{
    const ws = wb.Sheets[name];
    rows.push(...XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }));
  });
  return rows;
}

function parseCsvText(text){
  return String(text || "")
    .split(/\r?\n/)
    .map(line => line.split(";").length > 1 ? line.split(";") : line.split(","));
}

function parseInspectionWorkbook(wb){
  const rows = workbookAllRows(wb);
  const chars = [];

  rows.forEach((r, i)=>{
    const joined = r.join(" ").trim();
    if(!joined) return;

    const number = Number(r[0]);
    if(!Number.isFinite(number)) return;

    chars.push({
      number,
      type: normalizeFeatureType(r[1] || ""),
      characteristic: String(r[2] || ""),
      specification: String(r[3] || ""),
      results: {}
    });
  });

  return chars;
}