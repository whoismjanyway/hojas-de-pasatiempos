/* Hojas de pasatiempos: la página. Carga el contenido de datos/, pide los juegos al motor
   (en segundo plano), muestra la vista previa, imprime y guarda el historial. */
(function(){
"use strict";
const H=window.Hojas,{GAMES,GAME_KEYS,MIX_KEYS,TX,PAPER,LEVEL_IDS}=H;
const $=id=>document.getElementById(id);
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]];}return a;};
const store={get(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v;}catch(e){return d;}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true;}catch(e){return false;}}};

/* ---------- small drawings of each game for the picker ---------- */
const S='<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
const T=(x,y,t,s)=>'<text x="'+x+'" y="'+y+'" font-size="'+(s||7)+'" font-family="Lexend,sans-serif" font-weight="600" fill="currentColor" stroke="none" text-anchor="middle">'+t+'</text>';
const GLYPH={
  sudoku:S+'<rect x="3" y="3" width="26" height="26"/><path d="M11.7 3v26M20.3 3v26M3 11.7h26M3 20.3h26" stroke-width="1"/>'+T(7.4,10,"5")+T(16,18.6,"3")+T(24.6,27.2,"8")+'</svg>',
  maze:S+'<path d="M8 3H29V29H3V8"/><path d="M9 9h14v7M9 9v14h8M16 15v8M23 22v7"/></svg>',
  wordsearch:S+'<path d="M6.5 7.5l19 17" stroke-width="5.5" opacity=".22"/>'+T(7,10,"G")+T(16,10,"S")+T(25,10,"P")+T(7,19,"R")+T(16,19,"A")+T(25,19,"E")+T(7,28,"L")+T(16,28,"M")+T(25,28,"O")+'</svg>',
  crossword:S+'<path d="M3 11h8v8H3zM11 11h8v8h-8zM19 11h8v8h-8zM11 3h8v8h-8zM11 19h8v8h-8z" stroke-width="1.3"/>'+T(5.6,15.6,"1",5)+T(13.6,7.6,"2",5)+'</svg>',
  crossnum:S+'<rect x="3" y="3" width="9" height="9"/><rect x="20" y="3" width="9" height="9"/><rect x="3" y="20" width="9" height="9"/><rect x="20" y="20" width="9" height="9"/><path d="M14 7.5h4M16 5.5v4M7.5 14v4M24.5 14v4"/>'+T(16,27.5,"=",8)+'</svg>',
  cipher:S+T(7,10,"12",6)+T(16,10,"5",6)+T(25,10,"3",6)+'<rect x="3" y="13" width="8" height="10"/><rect x="12" y="13" width="8" height="10"/><rect x="21" y="13" width="8" height="10"/>'+T(16,20.8,"E",7)+'<path d="M4 28h24" stroke-dasharray="2 2"/></svg>',
  logic:S+'<rect x="3" y="3" width="26" height="26"/><path d="M16 3v26M3 16h26" stroke-width="1"/><path d="M6.5 6.5l6 6M12.5 6.5l-6 6M19.5 19.5l6 6M25.5 19.5l-6 6"/><circle cx="22.5" cy="9.5" r="3.4"/><circle cx="9.5" cy="22.5" r="3.4"/></svg>',
  mystery:S+'<circle cx="13" cy="13" r="8"/><path d="M19 19l9 9" stroke-width="2.6"/>'+T(13,16.2,"?",9)+'</svg>',
  escape:S+'<rect x="6" y="14" width="20" height="15" rx="2"/><path d="M10.5 14V9.5a5.5 5.5 0 0 1 11 0V14"/><circle cx="16" cy="20.5" r="2"/><path d="M16 22.5v3"/></svg>',
  mix:S+'<rect x="3" y="3" width="11" height="11"/><path d="M5.5 5.5v6M8.5 5.5v6M11.5 5.5v6" stroke-width="1"/><circle cx="23.5" cy="8.5" r="5.5"/><path d="M3 24l5-5 5 5-5 5z"/><path d="M19 19h10v10H19z"/>'+T(24,26.4,"?",7)+'</svg>'
};

/* ---------- state ---------- */
const PREFS="hojas-pasatiempos-v2",RECENT="hojas-pasatiempos-recientes",HKEY="hojas-pasatiempos-historial",HMAX=30;
const state={game:"sudoku",level:2,lang:"es",paper:"A4",per:4,perWant:4,pages:2,answers:true,mix:MIX_KEYS.slice(),assign:[],pool:[],pageIdx:0};
(function(){const s=store.get(PREFS,{})||{};
  if(s.game==="mix"||GAMES[s.game])state.game=s.game;
  if(s.level>=0&&s.level<=6)state.level=s.level;
  if(s.lang==="es"||s.lang==="en")state.lang=s.lang;
  if(PAPER[s.paper])state.paper=s.paper;
  if([1,2,4,6].includes(s.perWant))state.per=state.perWant=s.perWant;
  if(s.pages>=1&&s.pages<=10)state.pages=s.pages;
  if(typeof s.answers==="boolean")state.answers=s.answers;
  if(Array.isArray(s.mix)){const m=s.mix.filter(k=>GAMES[k]);if(m.length)state.mix=m;}})();
const remember=()=>store.set(PREFS,{game:state.game,level:state.level,lang:state.lang,paper:state.paper,perWant:state.perWant,pages:state.pages,answers:state.answers,mix:state.mix});
const need=()=>state.per*state.pages;
function ensureAssign(){while(state.assign.length<need())state.assign.push(...shuffle(state.mix.slice()));}
const gameAt=i=>state.game==="mix"?state.assign[i]:state.game;
const CFG_KEYS=["game","level","lang","paper","per","pages","answers","mix","assign","pool"];
function cfgNow(){const c={};CFG_KEYS.forEach(k=>c[k]=Array.isArray(state[k])?state[k].slice():state[k]);c.assign=c.assign.slice(0,need());c.pool=c.pool.slice(0,need());return c;}
const ready=()=>inflight<0&&state.pool.slice(0,need()).filter(Boolean).length===need();

/* ---------- words and riddles used recently, so new sheets bring new content ---------- */
let recent=store.get(RECENT,{es:[],en:[]});if(!recent||!Array.isArray(recent.es))recent={es:[],en:[]};
function rememberUsed(lang,keys){if(!keys||!keys.length)return;recent[lang]=recent[lang].concat(keys).slice(-600);store.set(RECENT,recent);}

/* ---------- content and generation ---------- */
let DATA=null,worker=null,local=null,token=0,inflight=-1,fails=0;
function startWorker(){
  if(worker){worker.terminate();worker=null;}inflight=-1;
  try{worker=new Worker("js/motor.js");worker.postMessage({init:DATA});worker.onmessage=e=>{if(!e.data.ready)onResult(e.data);};
    worker.onerror=()=>{if(worker){worker.terminate();worker=null;}inflight=-1;pump();};}
  catch(e){worker=null;}
}
function pump(){
  if(!DATA)return;
  ensureAssign();if(inflight>=0)return;
  let i=-1;for(let k=0;k<need();k++)if(!state.pool[k]){i=k;break;}
  if(i<0){done();return;}
  setBusy(true);
  const g=gameAt(i);setStatus("Generando "+(i+1)+" de "+need()+": "+GAMES[g].ui.toLowerCase()+"…");
  const used=[].concat(...state.pool.filter(Boolean).map(z=>z.used||[]));
  const msg={tok:token,i,game:g,level:state.level,lang:state.lang,avoid:recent[state.lang].concat(used)};inflight=i;
  if(worker)worker.postMessage(msg);
  else setTimeout(()=>{if(!local)local=window.crearMotor(DATA);let z=null;try{z=local.generate(msg.game,msg.level,msg.lang,msg.avoid);}catch(e){}onResult({tok:msg.tok,i:msg.i,z});},20);
}
function onResult(d){
  if(d.tok!==token)return;inflight=-1;
  if(d.z){state.pool[d.i]=d.z;fails=0;}
  else if(++fails>3){setStatus("No se pudo generar este juego con esta configuración. Prueba con otro nivel o pulsa «Juegos nuevos».");setBusy(false);return;}
  render();pump();
}
function done(){setBusy(false);
  const games=[...new Set(state.pool.slice(0,need()).map(z=>GAMES[z.game].ui))];
  setStatus(need()===1?"Juego listo para imprimir.":need()+" juegos listos para imprimir"+(state.game==="mix"?": "+games.join(", ")+".":"."));}
function regenerate(){token++;state.pool=[];state.pageIdx=0;if(DATA)startWorker();render();pump();}
function setBusy(b){$("printBtn").disabled=b;$("pdfBtn").disabled=b;}
const setStatus=t=>{$("status").textContent=t;};

/* ---------- preview ---------- */
function render(){
  if(!DATA)return;
  ensureAssign();
  const cfg=cfgNow(),pages=H.buildPages(cfg,"all");
  state.pageIdx=Math.max(0,Math.min(state.pageIdx,pages.length-1));
  const sh=$("sheet");sh.classList.remove("empty");sh.innerHTML=H.pageSVG(cfg,pages[state.pageIdx],state.pageIdx+1,pages.length);
  $("pageLbl").textContent="Hoja "+(state.pageIdx+1)+" de "+pages.length;
  $("prev").disabled=state.pageIdx===0;$("next").disabled=state.pageIdx>=pages.length-1;
  const sheets=pages.length;
  $("meta").textContent=(state.paper==="A5"?"Se imprime en la mitad de arriba de una hoja A4; córtala por la línea punteada. ":"")+
    sheets+(sheets===1?" hoja":" hojas")+" en total. Imprime a tamaño real (100 %).";
}

/* ---------- printing: straight to the device's print dialog ---------- */
/* In-app browsers and Firefox on Android can't open a print dialog, so those get the viewer with a PDF to download. */
function canPrintDirect(){const ua=navigator.userAgent||"";
  if(typeof window.print!=="function")return false;
  if(/FBAN|FBAV|Instagram|Line\/|MicroMessenger|; wv\)|TikTok/i.test(ua))return false;
  if(/Android/i.test(ua)&&/Firefox/i.test(ua))return false;
  return true;}
function fillPrintArea(cfg,mode){const pages=H.buildPages(cfg,mode);
  $("printArea").innerHTML=pages.map((p,i)=>'<div class="pp">'+H.pageSVG(cfg,p,i+1,pages.length)+"</div>").join("");
  document.documentElement.classList.add("imprimiendo");}
function printCfg(cfg,mode){
  if(!canPrintDirect()){openViewer(cfg,mode,"Este navegador no puede abrir la impresión directa. Descarga el PDF y ábrelo para imprimir.");return;}
  fillPrintArea(cfg,mode);window.print();
}
/* Ctrl+P or the browser's own Print menu also prints the current sheets, not the page around them. */
window.addEventListener("beforeprint",()=>{if(!document.documentElement.classList.contains("imprimiendo")&&DATA&&ready())fillPrintArea(cfgNow(),"all");});
window.addEventListener("afterprint",()=>{document.documentElement.classList.remove("imprimiendo");$("printArea").innerHTML="";});

/* ---------- viewer: every page on screen, with Print and Download ---------- */
let viewCfg=null,viewMode="all",lastFocus=null;
const docTitle=c=>c.game==="mix"?"Mezcla: "+c.mix.map(k=>GAMES[k]?GAMES[k].ui:k).join(", "):GAMES[c.game].ui;
const n1=c=>c.per*c.pages;
function docMeta(c){const L=TX.es.levels[c.level].toLowerCase();
  return "Nivel "+L+", "+(c.lang==="es"?"en español":"en inglés")+", "+c.paper+", "+n1(c)+(n1(c)===1?" juego":" juegos")+(c.answers?" con soluciones":"");}
const fileName=(c,mode)=>(mode==="answers"?"soluciones-":"")+(c.game==="mix"?"mezcla":GAMES[c.game].file)+"-"+LEVEL_IDS[c.level]+"-"+c.lang+"-"+c.paper.toLowerCase()+".pdf";
function openViewer(cfg,mode,note){
  viewCfg=cfg;viewMode=mode;const pages=H.buildPages(cfg,mode);
  $("vTitle").textContent=(mode==="answers"?"Soluciones: ":"")+docTitle(cfg);
  $("vTitle").className=mode==="answers"?"solution":"";
  $("vMeta").textContent=note||docMeta(cfg)+".";
  $("vPages").innerHTML=pages.map((p,i)=>'<div class="sheet">'+H.pageSVG(cfg,p,i+1,pages.length)+"</div>").join("");
  lastFocus=document.activeElement;$("viewer").hidden=false;document.body.style.overflow="hidden";$("vPages").scrollTop=0;$("vPrint").focus();
}
function closeViewer(){$("viewer").hidden=true;$("vPages").innerHTML="";document.body.style.overflow="";if(lastFocus&&lastFocus.focus)lastFocus.focus();}
function downloadPdf(cfg,mode){
  if(!window.jspdf){setStatus("No se pudo cargar el generador de PDF. Revisa tu conexión y vuelve a intentarlo.");return;}
  const blob=H.makePdf(cfg,mode).output("blob"),url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download=fileName(cfg,mode);document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
$("vPrint").addEventListener("click",()=>printCfg(viewCfg,viewMode));
$("vDown").addEventListener("click",()=>downloadPdf(viewCfg,viewMode));
$("vClose").addEventListener("click",closeViewer);

/* ---------- history (this browser only) ---------- */
function loadHist(){const a=store.get(HKEY,[]);return Array.isArray(a)?a.filter(e=>e&&e.pool&&(e.game==="mix"?e.mix.every(k=>GAMES[k]):GAMES[e.game])):[];}
function saveHist(a){a=a.slice(0,HMAX);while(a.length&&!store.set(HKEY,a))a.pop();if(!a.length)try{localStorage.removeItem(HKEY);}catch(e){}}
function syncHistCount(){const n=loadHist().length;$("histCount").textContent=n?n:"";}
function addHist(cfg){const h=loadHist();h.unshift(Object.assign({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),at:Date.now()},cfg));saveHist(h);syncHistCount();}
const when=t=>new Date(t).toLocaleString("es-MX",{dateStyle:"medium",timeStyle:"short"});
function renderHist(){
  const h=loadHist(),ol=$("hList");ol.innerHTML="";$("hClear").hidden=!h.length;
  $("hNote").textContent=h.length?h.length+(h.length===1?" impresión guardada":" impresiones guardadas")+" (máximo "+HMAX+")":"";
  if(!h.length){ol.innerHTML='<li class="empty">Aquí aparecerá cada hoja que mandes a imprimir.</li>';return;}
  for(const e of h){const li=document.createElement("li");li.dataset.id=e.id;
    li.innerHTML='<div><div class="ht"></div><div class="hm"></div></div><div class="hb">'+
      '<button type="button" class="btn red" data-a="sol">Ver soluciones</button>'+
      '<button type="button" class="btn" data-a="view">Ver hojas</button>'+
      '<button type="button" class="btn primary" data-a="print">Imprimir otra vez</button>'+
      '<button type="button" class="btn quiet" data-a="use">Usar estos juegos</button>'+
      '<button type="button" class="btn quiet end" data-a="del" aria-label="Quitar del historial">Quitar</button></div>';
    li.querySelector(".ht").textContent=docTitle(e);
    li.querySelector(".hm").textContent=docMeta(e)+". Impreso el "+when(e.at);
    ol.appendChild(li);}
}
function openHist(){renderHist();lastFocus=document.activeElement;$("hist").hidden=false;$("hClose").focus();}
function closeHist(){$("hist").hidden=true;if(lastFocus&&lastFocus.focus)lastFocus.focus();}
function useEntry(e){
  token++;inflight=-1;if(DATA)startWorker();
  CFG_KEYS.forEach(k=>state[k]=Array.isArray(e[k])?e[k].slice():e[k]);state.perWant=e.per;state.pageIdx=0;
  syncAll();remember();render();pump();
}
$("histBtn").addEventListener("click",openHist);
$("hClose").addEventListener("click",closeHist);
$("hist").addEventListener("click",ev=>{if(ev.target===$("hist"))closeHist();});
$("hList").addEventListener("click",ev=>{
  const b=ev.target.closest("button[data-a]");if(!b)return;
  const id=b.closest("li").dataset.id,h=loadHist(),e=h.find(x=>x.id===id);if(!e)return;
  const a=b.dataset.a;
  if(a==="sol"){closeHist();openViewer(e,"answers");}
  else if(a==="view"){closeHist();openViewer(e,"all");}
  else if(a==="print"){closeHist();printCfg(e,"all");}
  else if(a==="use"){closeHist();useEntry(e);setStatus("Cargaste los juegos del "+when(e.at)+".");}
  else{saveHist(h.filter(x=>x.id!==id));renderHist();syncHistCount();}
});
$("hClear").addEventListener("click",()=>{if(!confirm("¿Borrar todo el historial de impresiones?"))return;try{localStorage.removeItem(HKEY);}catch(e){}renderHist();syncHistCount();});
document.addEventListener("keydown",ev=>{if(ev.key!=="Escape")return;if(!$("viewer").hidden)closeViewer();else if(!$("hist").hidden)closeHist();});

/* ---------- controls ---------- */
const gamesEl=$("games");
[...GAME_KEYS,"mix"].forEach(k=>{const G=GAMES[k];
  gamesEl.insertAdjacentHTML("beforeend",'<button type="button" class="game" role="radio" data-g="'+k+'">'+GLYPH[k]+'<span><b>'+(G?G.ui:"Mezcla")+'</b><small>'+(G?G.tag:"Tú eliges cuáles")+'</small></span></button>');});
function pickGame(k){state.game=k;if(k==="mix")state.assign=[];syncAll();remember();regenerate();}
gamesEl.addEventListener("click",e=>{const b=e.target.closest(".game");if(b)pickGame(b.dataset.g);});
function radioKeys(container,sel,onPick){container.addEventListener("keydown",e=>{
  const items=[...container.querySelectorAll(sel)],i=items.indexOf(document.activeElement);if(i<0)return;
  const d={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[e.key];if(!d)return;e.preventDefault();
  const j=(i+d+items.length)%items.length;items[j].focus();onPick(items[j]);});}
radioKeys(gamesEl,".game",b=>pickGame(b.dataset.g));

const mixEl=$("mixChecks");
GAME_KEYS.forEach(k=>mixEl.insertAdjacentHTML("beforeend",'<label><input type="checkbox" value="'+k+'" id="mx-'+k+'"> '+GAMES[k].ui+'</label>'));
mixEl.addEventListener("change",e=>{
  const next=GAME_KEYS.filter(k=>$("mx-"+k).checked);
  if(!next.length){e.target.checked=true;$("mixHint").textContent="La mezcla necesita al menos un juego.";return;}
  state.mix=next;state.assign=[];syncAll();remember();regenerate();
});

const scaleEl=$("scale");
TX.es.levels.forEach((nm,i)=>scaleEl.insertAdjacentHTML("beforeend",'<button type="button" role="radio" aria-label="'+(i+1)+": "+nm+'" data-l="'+i+'" style="--i:'+i+'">'+(i+1)+'<span></span></button>'));
function pickLevel(l){state.level=l;syncAll();remember();regenerate();}
scaleEl.addEventListener("click",e=>{const b=e.target.closest("button");if(b)pickLevel(+b.dataset.l);});
radioKeys(scaleEl,"button",b=>pickLevel(+b.dataset.l));

document.querySelectorAll('input[name="lang"]').forEach(r=>r.addEventListener("change",e=>{state.lang=e.target.value;remember();
  const games=state.game==="mix"?state.mix:[state.game];if(games.some(g=>GAMES[g].word))regenerate();else render();}));
document.querySelectorAll('input[name="paper"]').forEach(r=>r.addEventListener("change",e=>{state.paper=e.target.value;syncAll();remember();render();pump();}));
$("perSeg").addEventListener("change",e=>{state.per=state.perWant=+e.target.value;syncAll();remember();render();pump();});
function setPages(n){state.pages=Math.max(1,Math.min(10,n));syncAll();remember();render();pump();}
$("pgMinus").addEventListener("click",()=>setPages(state.pages-1));
$("pgPlus").addEventListener("click",()=>setPages(state.pages+1));
$("answers").addEventListener("change",e=>{state.answers=e.target.checked;remember();render();});
$("newBtn").addEventListener("click",regenerate);
$("prev").addEventListener("click",()=>{state.pageIdx--;render();});
$("next").addEventListener("click",()=>{state.pageIdx++;render();});
$("form").addEventListener("submit",e=>e.preventDefault());

$("printBtn").addEventListener("click",()=>{if(!ready())return;const cfg=cfgNow();addHist(cfg);printCfg(cfg,"all");
  setStatus("Se guardó en el historial. Ahí puedes volver a imprimirlo o ver las soluciones.");});
$("pdfBtn").addEventListener("click",()=>{if(!ready())return;const cfg=cfgNow();addHist(cfg);openViewer(cfg,"all");});

function syncAll(){
  gamesEl.querySelectorAll(".game").forEach(b=>{const on=b.dataset.g===state.game;b.setAttribute("aria-checked",on);b.tabIndex=on?0:-1;});
  $("mixBox").hidden=state.game!=="mix";
  GAME_KEYS.forEach(k=>{$("mx-"+k).checked=state.mix.includes(k);});
  $("mixHint").textContent=state.mix.includes("escape")?"El escape room ocupa una hoja completa, así que con él sale un juego por hoja.":"";
  scaleEl.querySelectorAll("button").forEach(b=>{const on=+b.dataset.l===state.level;b.setAttribute("aria-checked",on);b.tabIndex=on?0:-1;});
  $("lvName").textContent=TX.es.levels[state.level];
  $("lvDesc").textContent=state.game==="mix"?"":GAMES[state.game].desc[state.level];
  $("l-"+state.lang).checked=true;$("p-"+state.paper.toLowerCase()).checked=true;
  const al=H.allowedPer(state),lay=PAPER[state.paper].layouts;
  [1,2,4,6].forEach(v=>{$("per-"+v).disabled=!al.includes(v);});
  state.per=al.filter(v=>v<=state.perWant).pop()||al[0];$("per-"+state.per).checked=true;
  const blocked=[1,2,4,6].filter(v=>lay[v]&&!al.includes(v)),name=state.game==="mix"?"La mezcla":GAMES[state.game].ui;
  $("perHint").textContent=al.length===1?name+" usa la hoja completa.":blocked.length?name+" necesita más espacio: caben hasta "+al[al.length-1]+" por hoja en "+state.paper+".":"";
  $("pgOut").textContent=state.pages;$("answers").checked=state.answers;
}

/* ---------- start ---------- */
syncAll();syncHistCount();
const FILES=["palabras","adivinanzas","frases","logica","misterios"];
Promise.all(FILES.map(f=>fetch("datos/"+f+".json",{cache:"no-cache"}).then(r=>{if(!r.ok)throw new Error(f);return r.json();})))
  .then(list=>{DATA={};FILES.forEach((f,i)=>DATA[f]=list[i]);startWorker();render();pump();})
  .catch(()=>{const sh=$("sheet");sh.classList.add("empty");
    sh.textContent="No se pudo cargar el contenido de los juegos (la carpeta datos). Abre la página desde su dirección web, por ejemplo whoismjanyway.github.io/hojas-de-pasatiempos, en lugar de abrir el archivo directamente.";
    setStatus("Falta el contenido de los juegos.");});
window.__hojas={state,cfgNow,openViewer,printCfg,loadHist,fillPrintArea,regenerate,ready};
})();
