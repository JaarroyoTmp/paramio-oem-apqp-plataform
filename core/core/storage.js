(function(){
 const RUNTIME_KEYS=['paramio_oem_project_runtime_core_v207','paramio_oem_project_runtime_core_v206','paramio_oem_project_state_latest_core_v207','paramio_oem_project_state_latest_core_v206','paramio_oem_project_runtime_core_v204','paramio_oem_project_state_latest_core_v204','paramio_oem_project_runtime_v167','paramio_oem_project_state_latest_v167'];
 const KCS_KEY='paramio_oem_kcs_selection_v223_exact';
 window.PARAMIO_VERSION='V223 Professional KCS exact';
 window.esc=function(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));};
 window.num=function(v){let n=parseFloat(String(v??'').replace(',','.').replace(/[^\d.-]/g,''));return Number.isFinite(n)?n:NaN;};
 window.fmt=function(v){return v==null?'':String(v).trim();};
 window.norm=function(v){return String(v??'').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();};
 window.normalizeProject=function(p){
   p=p||{};
   if(!p.characteristics&&p.stableState&&p.stableState.characteristics)p.characteristics=p.stableState.characteristics;
   if(!p.meta&&p.stableState&&p.stableState.meta)p.meta=p.stableState.meta;
   p.meta=p.meta||{};
   p.characteristics=Array.isArray(p.characteristics)?p.characteristics:[];
   p.manualResults=p.manualResults||{};
   p.pcdmisBlocks=p.pcdmisBlocks||{};
   p.pcdmisGlobalItems=p.pcdmisGlobalItems||{};
   p.kcsSelection=(p.kcsSelection&&typeof p.kcsSelection==='object')?p.kcsSelection:{};
   p.characteristics.forEach(c=>{if(c&&!c.results)c.results={};});
   return p;
 };
 window.getProjectSignature=function(p){p=p||{};const m=p.meta||{};return [m.reference||'',m.partName||'',m.revision||'',(p.characteristics||[]).length||0].join('|');};
 function cleanMap(map){const out={};Object.keys(map||{}).forEach(k=>{if(map[k])out[String(k)]=true;});return out;}
 function readDedicatedMap(p){
   const sig=window.getProjectSignature(p);
   for(const store of [localStorage,sessionStorage]){
     try{const raw=store.getItem(KCS_KEY);if(!raw)continue;const obj=JSON.parse(raw)||{};if(obj.signature===sig&&obj.items&&typeof obj.items==='object')return cleanMap(obj.items);}catch(e){}
   }
   return null;
 }
 window.loadKcsSelection=function(p){
   p=normalizeProject(p||{});
   const dedicated=readDedicatedMap(p);
   if(dedicated)return dedicated;
   // Only first migration: if no V223 exact selection exists, seed from project flags.
   const seed=cleanMap(p.kcsSelection||{});
   if(!Object.keys(seed).length){(p.characteristics||[]).forEach(c=>{if(c&&c.kcs)seed[String(c.number)]=true;});}
   return seed;
 };
 window.saveKcsSelection=function(p,map){
   p=normalizeProject(p||{});
   const exact=cleanMap(map||{});
   p.kcsSelection=Object.assign({},exact);
   (p.characteristics||[]).forEach(c=>{c.kcs=!!exact[String(c.number)];});
   const payload=JSON.stringify({signature:window.getProjectSignature(p),items:exact,updatedAt:new Date().toISOString()});
   try{localStorage.setItem(KCS_KEY,payload);}catch(e){}
   try{sessionStorage.setItem(KCS_KEY,payload);}catch(e){}
   saveProject(p);
   return true;
 };
 window.applyKcsSelectionToProject=function(p){
   if(!p)return p;
   p=normalizeProject(p);
   const map=loadKcsSelection(p);
   p.kcsSelection=Object.assign({},map);
   (p.characteristics||[]).forEach(c=>{c.kcs=!!map[String(c.number)];});
   return p;
 };
 window.saveProject=function(p){p=normalizeProject(p);p.savedAt=new Date().toISOString();p.parserVersion='CORE_V223';p.savedBy='V223 Professional KCS exact';const s=JSON.stringify(p);for(const k of RUNTIME_KEYS){try{localStorage.setItem(k,s);}catch(e){}try{sessionStorage.setItem(k,s);}catch(e){}}return true;};
 window.loadProject=function(){for(const store of [localStorage,sessionStorage]){for(const k of RUNTIME_KEYS){try{const raw=store.getItem(k);if(!raw)continue;const p=normalizeProject(JSON.parse(raw));if(p&&p.characteristics&&p.characteristics.length)return p;}catch(e){}}}let best=null,score=-1;for(const store of [localStorage,sessionStorage]){for(let i=0;i<store.length;i++){const k=store.key(i);if(!/paramio|oem/i.test(k))continue;try{const p=normalizeProject(JSON.parse(store.getItem(k)));const s=(p.characteristics?.length||0)+(p.linkedResults||0);if(p.characteristics?.length&&s>score){best=p;score=s;}}catch(e){}}}return best;};
 window.clearProject=function(){for(const store of [localStorage,sessionStorage]){Object.keys(store).forEach(k=>{if(/paramio|oem/i.test(k))store.removeItem(k);});}};
 window.renderShell=function(active){return `<aside class="side"><div class="brand"><img src="assets/logo_paramio.png" onerror="this.src='assets/paramio-logo.png';this.onerror=null" alt="Paramio"><div><b>Paramio</b><span>Quality Documentation</span></div></div><nav class="nav"><a class="${active==='home'?'active':''}" href="index.html">Inicio / Cargar</a><a class="${active==='diag'?'active':''}" href="diagnostico.html">Diagnóstico</a><a class="${active==='isir'?'active':''}" href="isir.html">ISIR</a><a class="${active==='dimensional'?'active':''}" href="dimensional.html">Dimensional</a><a class="${active==='kcs'?'active':''}" href="kcs.html">KCS</a><a class="${active==='plan'?'active':''}" href="control-plan.html">Plan de control</a><a class="${active==='flow'?'active':''}" href="flowchart.html">Flowchart</a></nav><div class="sideFoot"><b>CORE V223</b><br>KCS exacto + presentación profesional.</div></aside>`;};
 window.noDataHtml=function(){return `<div class="card"><h2>No hay datos cargados</h2><p>Primero ve a Inicio, carga Excel Inspection + PC-DMIS y pulsa <b>Procesar documentación</b>.</p><div class="actions"><a class="btn green" href="index.html">Ir a cargar Excel</a></div></div>`;};
 window.metaHtml=function(p){const m=(p||{}).meta||{};return `<div class="metaBox"><div><span>Cliente</span><b>${esc(m.client||'')}</b></div><div><span>Referencia</span><b>${esc(m.reference||'')}</b></div><div><span>Pieza</span><b>${esc(m.partName||'')}</b></div><div><span>Rev.</span><b>${esc(m.revision||'')}</b></div><div><span>Fecha</span><b>${esc(m.date||'')}</b></div></div>`;};
})();
