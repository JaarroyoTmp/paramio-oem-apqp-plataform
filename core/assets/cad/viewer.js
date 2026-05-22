
/* PARAMIO V240 CAD MODULAR VIEWER
   Módulo independiente. No toca motor dimensional, ISIR, KCS ni Plan de Control.
   Render real: STL ASCII/binario simple y OBJ básico. STEP/STP/IGES se asocian documentalmente.
*/
(function(){
  let host, infoBox, emptyBox;
  let canvas, ctx;
  let model = null;
  let angleX = -0.35, angleY = 0.65, zoom = 1;
  let autoRotate = false;
  let dragging = false, lastX = 0, lastY = 0;

  function $(id){ return document.getElementById(id); }
  function ext(name){ return String(name||'').split('.').pop().toLowerCase(); }

  function init(){
    host = $("cadCanvasHost");
    infoBox = $("cadInfo");
    emptyBox = $("cadEmpty");
    canvas = document.createElement("canvas");
    canvas.width = host.clientWidth || 800;
    canvas.height = host.clientHeight || 480;
    ctx = canvas.getContext("2d");
    host.appendChild(canvas);
    bind();
    resize();
    draw();
    setInterval(()=>{ if(autoRotate){ angleY += 0.015; draw(); } }, 30);
  }

  function bind(){
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousedown", e => { dragging=true; lastX=e.clientX; lastY=e.clientY; });
    window.addEventListener("mouseup", () => dragging=false);
    window.addEventListener("mousemove", e => {
      if(!dragging) return;
      angleY += (e.clientX-lastX)*0.008;
      angleX += (e.clientY-lastY)*0.008;
      lastX=e.clientX; lastY=e.clientY;
      draw();
    });
    canvas.addEventListener("wheel", e => {
      e.preventDefault();
      zoom *= e.deltaY < 0 ? 1.08 : 0.92;
      zoom = Math.max(.2, Math.min(8, zoom));
      draw();
    }, {passive:false});

    const input = $("cadFileInput");
    if(input){
      input.addEventListener("change", e=>{
        const f=e.target.files && e.target.files[0];
        if(f) loadFile(f);
      });
    }
  }

  function resize(){
    if(!canvas || !host) return;
    canvas.width = Math.max(320, host.clientWidth || 800);
    canvas.height = Math.max(320, host.clientHeight || 480);
    draw();
  }

  function setInfo(html){
    if(infoBox) infoBox.innerHTML = html;
  }

  function showEmpty(msg){
    if(emptyBox){
      emptyBox.style.display = "flex";
      emptyBox.innerHTML = msg || "CARGA STL / OBJ PARA VISTA 3D REAL";
    }
  }
  function hideEmpty(){ if(emptyBox) emptyBox.style.display = "none"; }

  function loadFile(file){
    const e = ext(file.name);
    if(["step","stp","iges","igs"].includes(e)){
      model = null;
      showEmpty("STEP / STP ASOCIADO<br><small>Archivo vinculado documentalmente. Para render 3D real exportar STL u OBJ.</small>");
      setInfo(`<b>Archivo:</b> ${escapeHtml(file.name)}<br><b>Formato:</b> ${e.toUpperCase()}<br><b>Tamaño:</b> ${Math.round(file.size/1024)} KB<br><br><div class="cad-warning">El navegador no interpreta STEP nativo sin kernel CAD. Queda asociado al proyecto y se usará como referencia documental.</div>`);
      draw();
      notifyParent(file, "associated");
      return;
    }

    if(e === "obj"){
      file.text().then(txt=>{
        model = parseOBJ(txt);
        fitModel();
        hideEmpty();
        setInfo(`<b>Archivo:</b> ${escapeHtml(file.name)}<br><b>Formato:</b> OBJ<br><b>Vértices:</b> ${model.vertices.length}<br><b>Caras:</b> ${model.faces.length}`);
        draw();
        notifyParent(file, "rendered");
      });
      return;
    }

    if(e === "stl"){
      file.arrayBuffer().then(buf=>{
        model = parseSTL(buf);
        fitModel();
        hideEmpty();
        setInfo(`<b>Archivo:</b> ${escapeHtml(file.name)}<br><b>Formato:</b> STL<br><b>Vértices:</b> ${model.vertices.length}<br><b>Caras:</b> ${model.faces.length}`);
        draw();
        notifyParent(file, "rendered");
      });
      return;
    }

    showEmpty("FORMATO NO SOPORTADO<br><small>Usar STL / OBJ para render, STEP/STP para asociación documental.</small>");
  }

  function notifyParent(file, status){
    try{
      parent.postMessage({type:"PARAMIO_CAD_FILE", name:file.name, size:file.size, status:status}, "*");
    }catch(e){}
  }

  function parseOBJ(txt){
    const verts=[], faces=[];
    txt.split(/\r?\n/).forEach(line=>{
      line=line.trim();
      if(line.startsWith("v ")){
        const p=line.split(/\s+/).slice(1).map(Number);
        if(p.length>=3 && p.every(Number.isFinite)) verts.push([p[0],p[1],p[2]]);
      }else if(line.startsWith("f ")){
        const idx=line.split(/\s+/).slice(1).map(x=>parseInt(x.split("/")[0],10)-1).filter(Number.isFinite);
        if(idx.length>=3){
          for(let i=1;i<idx.length-1;i++) faces.push([idx[0],idx[i],idx[i+1]]);
        }
      }
    });
    return {vertices:verts, faces};
  }

  function parseSTL(buf){
    const dv = new DataView(buf);
    const text = new TextDecoder("utf-8").decode(buf.slice(0, Math.min(buf.byteLength, 500)));
    if(text.trim().startsWith("solid") && text.includes("facet")){
      return parseAsciiSTL(new TextDecoder("utf-8").decode(buf));
    }
    const n = dv.getUint32(80, true);
    const verts=[], faces=[];
    let off=84;
    for(let i=0;i<n && off+50<=buf.byteLength;i++){
      off += 12; // normal
      const face=[];
      for(let j=0;j<3;j++){
        const x=dv.getFloat32(off,true), y=dv.getFloat32(off+4,true), z=dv.getFloat32(off+8,true);
        off += 12;
        verts.push([x,y,z]); face.push(verts.length-1);
      }
      faces.push(face);
      off += 2;
    }
    return {vertices:verts, faces};
  }

  function parseAsciiSTL(txt){
    const verts=[], faces=[];
    const re=/vertex\s+([\-0-9.eE+]+)\s+([\-0-9.eE+]+)\s+([\-0-9.eE+]+)/g;
    let m, tri=[];
    while((m=re.exec(txt))){
      verts.push([+m[1],+m[2],+m[3]]);
      tri.push(verts.length-1);
      if(tri.length===3){ faces.push(tri); tri=[]; }
    }
    return {vertices:verts, faces};
  }

  function fitModel(){
    if(!model || !model.vertices.length) return;
    let min=[Infinity,Infinity,Infinity], max=[-Infinity,-Infinity,-Infinity];
    model.vertices.forEach(v=>{ for(let i=0;i<3;i++){ min[i]=Math.min(min[i],v[i]); max[i]=Math.max(max[i],v[i]); } });
    const center=[(min[0]+max[0])/2,(min[1]+max[1])/2,(min[2]+max[2])/2];
    const size=Math.max(max[0]-min[0], max[1]-min[1], max[2]-min[2]) || 1;
    model.normVertices = model.vertices.map(v=>[(v[0]-center[0])/size,(v[1]-center[1])/size,(v[2]-center[2])/size]);
    angleX=-0.35; angleY=0.65; zoom=1.8;
  }

  function project(v){
    const x=v[0], y=v[1], z=v[2];
    const cy=Math.cos(angleY), sy=Math.sin(angleY), cx=Math.cos(angleX), sx=Math.sin(angleX);
    let x1=x*cy - z*sy, z1=x*sy + z*cy;
    let y1=y*cx - z1*sx, z2=y*sx + z1*cx;
    const scale=Math.min(canvas.width, canvas.height)*0.52*zoom;
    return [canvas.width/2 + x1*scale, canvas.height/2 - y1*scale, z2];
  }

  function draw(){
    if(!ctx || !canvas) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawBackground();
    if(!model || !model.normVertices || !model.faces.length){
      return;
    }

    const faces = model.faces.map(f=>{
      const pts=f.map(i=>project(model.normVertices[i]));
      const z=(pts[0][2]+pts[1][2]+pts[2][2])/3;
      return {pts,z};
    }).sort((a,b)=>a.z-b.z);

    faces.forEach(face=>{
      const p=face.pts;
      ctx.beginPath();
      ctx.moveTo(p[0][0],p[0][1]);
      ctx.lineTo(p[1][0],p[1][1]);
      ctx.lineTo(p[2][0],p[2][1]);
      ctx.closePath();
      const shade=Math.max(80, Math.min(210, 150 + face.z*80));
      ctx.fillStyle=`rgb(${shade},${shade+8},${shade+18})`;
      ctx.strokeStyle="rgba(20,40,70,.45)";
      ctx.lineWidth=1;
      ctx.fill();
      ctx.stroke();
    });
  }

  function drawBackground(){
    const g=ctx.createLinearGradient(0,0,canvas.width,canvas.height);
    g.addColorStop(0,"#122d59");
    g.addColorStop(1,"#071a3a");
    ctx.fillStyle=g;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle="rgba(255,255,255,.08)";
    for(let x=0;x<canvas.width;x+=40){
      ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke();
    }
    for(let y=0;y<canvas.height;y+=40){
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke();
    }
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));
  }

  window.ParamioCAD = {
    reset:function(){ fitModel(); draw(); },
    iso:function(){ angleX=-0.35; angleY=0.65; draw(); },
    toggleAuto:function(){ autoRotate=!autoRotate; },
    loadFile:loadFile
  };

  document.addEventListener("DOMContentLoaded", init);
})();
