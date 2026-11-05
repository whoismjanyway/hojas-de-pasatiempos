/* Hojas de pasatiempos: catálogo de juegos y dibujo de las hojas.
   Todo se dibuja en milímetros sobre una hoja A4 a través de un "backend":
   SVG para la vista previa y la impresión directa, jsPDF para el PDF descargable. */
(function(){
"use strict";
const LEVEL_IDS=["super-facil","facil","medio","medio-dificil","dificil","extremo","super-extremo"];
const TX={
  es:{levels:["Súper fácil","Fácil","Medio","Medio-difícil","Difícil","Extremo","Súper extremo"],answers:"Soluciones",mix:"Mezcla de juegos",
    theme:"Tema",across:"Horizontales",down:"Verticales",clues:"pistas",words:"palabras",hint:"Pista",letters:"letras",challenges:"retos",
    no:"No.",making:"Generando…",name:"Nombre",cut:"Corta por aquí",level:"Nivel",culprit:"Culpable",people:"personas",suspects:"sospechosos",
    clueList:"Pistas",answer:"Respuesta"},
  en:{levels:["Super easy","Easy","Medium","Medium-hard","Hard","Extreme","Super extreme"],answers:"Answers",mix:"Puzzle mix",
    theme:"Theme",across:"Across",down:"Down",clues:"clues",words:"words",hint:"Hint",letters:"letters",challenges:"challenges",
    no:"No.",making:"Making…",name:"Name",cut:"Cut here",level:"Level",culprit:"Culprit",people:"people",suspects:"suspects",
    clueList:"Clues",answer:"Answer"}
};
const GAMES={
  sudoku:{ui:"Sudoku",tag:"Números del 1 al 9",file:"sudoku",name:{es:"Sudoku",en:"Sudoku"},per:{A4:[1,2,4,6],A5:[1,2,4]},small:true,
    desc:["Unas 50 pistas","Solo hay que buscar el único lugar","Pares señaladores","Pares escondidos","Tríos y X-Wing","XY-Wing","Requiere cadenas"],
    rule:{es:()=>"Completa cada fila, cada columna y cada caja de 3×3 con los números del 1 al 9, sin repetir.",
          en:()=>"Fill every row, column and 3×3 box with the digits 1 to 9."}},
  maze:{ui:"Laberinto",tag:"Encuentra la salida",file:"laberinto",name:{es:"Laberinto",en:"Maze"},per:{A4:[1,2,4,6],A5:[1,2,4]},small:true,
    desc:["6×6","9×9","12×12","15×15","19×19","24×24","30×30"],
    rule:{es:()=>"Traza un camino desde la entrada (arriba a la izquierda) hasta la salida (abajo a la derecha).",
          en:()=>"Draw a path from the opening at the top left to the exit at the bottom right."}},
  wordsearch:{ui:"Sopa de letras",tag:"Palabras escondidas",file:"sopa-de-letras",word:true,name:{es:"Sopa de letras",en:"Word search"},
    per:{A4:[1,2,4],A5:[1,2]},perHard:{from:5,A4:[1,2],A5:[1]},
    desc:["8×8, 6 palabras","10×10, 8 palabras","11×11, con diagonales","12×12, también al revés","14×14, con letras ocultas","15×15, solo pistas","16×16, dos temas y trampas"],
    rule:{es:L=>L>=5?"Aquí no están las palabras: lee cada pista, adivina la palabra (el número dice cuántas letras tiene) y búscala en la sopa. Pueden ir en cualquier dirección, incluso al revés, y hay pedazos de palabras para despistar.":
            "Encuentra en la sopa todas las palabras de la lista. "+(L<=1?"Están escritas de izquierda a derecha, de arriba abajo"+(L===1?" o en diagonal.":"."):L===2?"Pueden ir en horizontal, en vertical o en diagonal.":L===3?"Pueden ir en cualquier dirección, incluso al revés.":"A cada palabra le faltan letras: complétala y búscala. Pueden ir en cualquier dirección."),
          en:L=>L>=5?"The words are not listed: read each clue, work out the word (the number tells you how many letters it has) and find it in the grid. Words run in any direction, even backwards, and some fragments are there to trick you.":
            "Find every word from the list in the grid. "+(L<=1?"Words read left to right, top to bottom"+(L===1?" or diagonally.":"."):L===2?"Words run across, down or diagonally.":L===3?"Words can run in any direction, even backwards.":"Each word is missing some letters: fill them in, then find the word. Words run in any direction.")}},
  crossword:{ui:"Crucigrama",tag:"Pistas y casillas",file:"crucigrama",word:true,name:{es:"Crucigrama",en:"Crossword"},per:{A4:[1,2,4],A5:[1,2]},
    desc:["5 palabras, con la primera letra","7 palabras, con ayudas","9 palabras, pocas ayudas","11 palabras","13 palabras","15 palabras","17 palabras"],
    rule:{es:L=>"Lee las pistas y escribe cada respuesta a partir de su número: las horizontales de izquierda a derecha y las verticales de arriba abajo. Escribe sin acentos."+(L<=2?" Algunas letras ya están puestas.":""),
          en:L=>"Read the clues and write each answer starting at its number: across answers go left to right, down answers top to bottom."+(L<=2?" Some letters are already filled in.":"")}},
  crossnum:{ui:"Cruci-números",tag:"Operaciones en cruz",file:"cruci-numeros",name:{es:"Cruci-números",en:"Cross numbers"},per:{A4:[1,2,4,6],A5:[1,2,4]},small:true,
    desc:["2×2, sumas","2×2, sumas y restas","3×3, sumas y restas","3×3, con multiplicación","3×3, las cuatro operaciones","3×3, casi vacío","3×3, vacío"],
    rule:{es:L=>"Escribe un número del 1 al 9 en cada casilla vacía, sin repetir ninguno. Cada fila y cada columna debe dar su resultado. Las operaciones se hacen en orden: de izquierda a derecha y de arriba abajo."+(L>=4?" Todas las divisiones son exactas.":""),
          en:L=>"Write a number from 1 to 9 in each empty square, using each number only once. Every row and column must equal its result. Work the operations in order: left to right and top to bottom."+(L>=4?" Every division comes out even.":"")}},
  cipher:{ui:"Mensaje secreto",tag:"Descifra la clave",file:"mensaje-secreto",word:true,name:{es:"Mensaje secreto",en:"Secret message"},per:{A4:[1,2,4,6],A5:[1,2,4]},
    desc:["Clave A = 1, frase corta","Clave A = 1, frase larga","Clave revuelta","Letras cambiadas","Solo una pista","Clave incompleta","Clave casi vacía"],
    rule:{es:L=>["Cada número es una letra. Usa la clave y escribe la letra debajo de cada número para descubrir el mensaje.","Cada número es una letra. Usa la clave y escribe la letra debajo de cada número para descubrir el mensaje.",
            "Cada número es una letra, pero la clave está revuelta. Usa la tabla para descubrir el mensaje.",
            "Cada letra del mensaje se cambió por otra. Busca cada letra en la fila de abajo de la tabla y escribe la que está arriba.",
            "Cada letra se recorrió el mismo número de lugares en el alfabeto. Usa la pista para saber cuántos y descifra el mensaje.",
            "Cada número es una letra, pero a la clave le faltan algunos. Descifra lo que puedas y adivina las letras que faltan por el contexto.",
            "Cada número es una letra, pero a la clave le faltan muchos. Descifra lo que puedas y adivina las letras que faltan por el contexto."][L],
          en:L=>["Each number stands for a letter. Use the key and write the letter under each number to reveal the message.","Each number stands for a letter. Use the key and write the letter under each number to reveal the message.",
            "Each number stands for a letter, but the key is scrambled. Use the table to reveal the message.",
            "Each letter in the message was swapped for another. Find each letter in the bottom row of the table and write the one above it.",
            "Each letter was shifted the same number of places along the alphabet. Use the hint to work out how many, then decode the message.",
            "Each number stands for a letter, but some are missing from the key. Decode what you can and guess the rest from context.",
            "Each number stands for a letter, but many are missing from the key. Decode what you can and guess the rest from context."][L]}},
  logic:{ui:"Acertijo de lógica",tag:"Deduce con pistas",file:"acertijo-logica",word:true,name:{es:"Acertijo de lógica",en:"Logic puzzle"},per:{A4:[1,2],A5:[1]},
    desc:["3 personas, 1 categoría","3 personas, 2 categorías","4 personas, 2 categorías","4 personas, 3 categorías","Con posiciones en fila","5 personas en fila","5 personas, pistas indirectas"],
    rule:{es:()=>"Cada persona tiene una sola opción de cada categoría y nadie repite. Lee las pistas y usa la cuadrícula: marca con una X lo que no puede ser y con un círculo lo que sí es.",
          en:()=>"Each person has exactly one option from each category and nobody repeats. Read the clues and use the grid: mark an X for what cannot be and a circle for what must be."}},
  mystery:{ui:"Misterio",tag:"¿Quién fue?",file:"misterio",word:true,name:{es:"Misterio",en:"Mystery"},per:{A4:[1,2],A5:[1]},
    desc:["3 sospechosos","3 sospechosos, 3 categorías","4 sospechosos","4 sospechosos con horario","Pistas más difíciles","5 sospechosos","5 sospechosos, pistas indirectas"],
    rule:{es:()=>"Lee la historia y las pistas. Usa la cuadrícula para descubrir qué hizo cada sospechoso (X para lo que no, círculo para lo que sí); la última pista señala al culpable.",
          en:()=>"Read the story and the clues. Use the grid to work out what each suspect did (X for no, circle for yes); the last clue points to the culprit."}},
  escape:{ui:"Escape room",tag:"5 retos y un código",file:"escape-room",word:true,solo:true,name:{es:"Escape room",en:"Escape room"},per:{A4:[1],A5:[1]},
    desc:["Retos muy fáciles","Retos fáciles","Retos medios","Retos medio-difíciles","Retos difíciles","Retos extremos","Retos súper extremos"],
    rule:{es:()=>"Resuelve los cinco retos: cada uno te da un código. Al final, escribe los códigos en orden para escapar.",
          en:()=>"Solve the five challenges: each one gives you a code. Then write the codes in order to escape."}}
};
const GAME_KEYS=Object.keys(GAMES),MIX_KEYS=GAME_KEYS.filter(k=>!GAMES[k].solo);
const PAPER={
  A4:{w:210,h:297,m:12,layouts:{1:[1,1],2:[1,2],4:[2,2],6:[2,3]},title:15,rpt:8},
  A5:{w:210,h:148.5,sheet:{w:210,h:297},m:10,layouts:{1:[1,1],2:[2,1],4:[2,2]},title:12,rpt:7}
};
/* Puzzles per sheet each game allows on a given paper and level. */
function perFor(game,paper,level){const G=GAMES[game];return (G.perHard&&level>=G.perHard.from?G.perHard:G.per)[paper];}
function allowedPer(cfg){const games=cfg.game==="mix"?cfg.mix:[cfg.game];
  return [1,2,4,6].filter(v=>PAPER[cfg.paper].layouts[v]&&games.every(g=>perFor(g,cfg.paper,cfg.level).includes(v)));}

/* ---------- drawing helpers (mm) ---------- */
const INK="#111111",SOFT="#8a8a8a",THIN="#6b6b6b",RED="#C8372D";
const ptFor=mm=>mm/0.3528;
function gridLines(D,x,y,s,n,thin,thick,every){
  const u=s/n;
  for(let i=1;i<n;i++){const heavy=every&&i%every===0;D.line(x+i*u,y,x+i*u,y+s,heavy?thick:thin,heavy?INK:THIN);D.line(x,y+i*u,x+s,y+i*u,heavy?thick:thin,heavy?INK:THIN);}
  D.rect(x,y,s,s,0.8,INK);
}
function digit(D,v,cx,cy,u,given){D.text(String(v),cx,cy,ptFor(u*0.58),{align:"center",baseline:"middle",bold:given,color:given?INK:SOFT});}
function wrap(D,text,pt,maxW,bold){const out=[];let line="";for(const w of text.split(" ")){const t=line?line+" "+w:w;if(D.measure(t,pt,bold)>maxW&&line){out.push(line);line=w;}else line=t;}if(line)out.push(line);return out;}
const square=(x,y,w,h)=>{const s=Math.min(w,h);return [x+(w-s)/2,y+(h-s)/2,s];};

function wsGrid(D,x0,y0,s,z,ans){const n=z.n,u=s/n;
  if(ans)for(const p of z.words){const L=p.w.length-1;D.poly([[x0+(p.c+0.5)*u,y0+(p.r+0.5)*u],[x0+(p.c+p.dc*L+0.5)*u,y0+(p.r+p.dr*L+0.5)*u]],u*0.74,"#D4D4D4");}
  D.rect(x0,y0,s,s,0.5,INK);
  for(let i=0;i<n*n;i++)D.text(z.grid[i],x0+(i%n+0.5)*u,y0+(((i/n)|0)+0.55)*u,ptFor(u*0.56),{align:"center",baseline:"middle"});
}
function cwGrid(D,x0,y0,u,z,ans){const C=z.cols,nums=new Map(z.nums);
  for(let i=0;i<z.cells.length;i++){const ch=z.cells[i];if(!ch)continue;const cx=x0+(i%C)*u,cy=y0+((i/C)|0)*u;
    D.fill(cx,cy,u,u,"#FFFFFF");D.rect(cx,cy,u,u,0.35,INK);
    if(nums.has(i))D.text(String(nums.get(i)),cx+u*0.07,cy+u*0.06,ptFor(u*0.26),{baseline:"top",color:"#333333"});
    if(ans||z.reveal[i])D.text(ch,cx+u/2,cy+u*0.6,ptFor(u*0.5),{align:"center",baseline:"middle",bold:z.reveal[i],color:z.reveal[i]?INK:"#333333"});}
}
function clueBlock(D,list,f,colW){const lh=f*0.3528*1.32,items=[];let n=0;
  for(const o of list){const pre=o.n+". ",pw=D.measure(pre,f,true),lines=wrap(D,o.q,f,Math.max(8,colW-pw));items.push({pre,pw,lines});n+=lines.length;}
  return {items,h:lh*(n+1.3),lh};}
function drawClues(D,x,y,title,B,f){D.text(title,x,y,f,{bold:true,baseline:"top"});let yy=y+B.lh*1.3;
  for(const it of B.items){D.text(it.pre,x,yy,f,{bold:true,baseline:"top"});for(const l of it.lines){D.text(l,x+it.pw,yy,f,{baseline:"top"});yy+=B.lh;}}}


/* ---- sopa de letras: the list under or beside the grid shows words, words with hidden letters, or only clues ---- */
function wsItems(z){
  if(z.list==="clues")return z.words.map(p=>p.q+" ("+p.w.length+")");
  if(z.list==="mask")return z.words.map(p=>p.mask);
  return z.words.map(p=>p.w);
}
/* Wraps each item to colW and splits the items into `cols` columns of similar height. */
function listLayout(D,items,f,colW,cols,bullet){
  const mm=f*0.3528,lh=mm*1.36,gapItem=bullet?mm*0.35:0,bw=bullet?D.measure("• ",f):0;
  const wrapped=items.map(t=>wrap(D,t,f,Math.max(5,colW-bw)));
  const total=wrapped.reduce((s,l)=>s+l.length*lh+gapItem,0),target=total/cols;
  const out=[];let cur=[],acc=0;
  wrapped.forEach(ls=>{const ih=ls.length*lh+gapItem;if(cur.length&&acc+ih>target*1.05&&out.length<cols-1){out.push(cur);cur=[];acc=0;}cur.push(ls);acc+=ih;});
  out.push(cur);
  const h=Math.max(...out.map(c=>c.reduce((s,ls)=>s+ls.length*lh+gapItem,0)));
  return {out,h,lh,gapItem,bw,colW,f};
}
function drawList(D,x,y,L,gap){
  L.out.forEach((col,ci)=>{let yy=y;const cx=x+ci*(L.colW+gap);
    for(const ls of col){if(L.bw)D.text("•",cx,yy,L.f,{baseline:"top"});
      ls.forEach(l=>{D.text(l,cx+L.bw,yy,L.f,{baseline:"top"});yy+=L.lh;});yy+=L.gapItem;}});
}
function wsDraw(D,x,y,w,h,z){
  const n=z.n,T=TX[z.lang],title=T.theme+": "+z.theme,items=wsItems(z),clue=z.list==="clues";
  let best=null;
  const consider=c=>{if(c.s<=0)return;c.sc=c.s/n+c.f*(clue?0.35:0.15);if(!best||c.sc>best.sc)best=c;};
  for(const f of clue?[9,8.5,8,7.5,7,6.5,6.2]:[10,9,8.5,8,7.5,7,6.5,6,5.5]){
    const mm=f*0.3528,gap=mm*2.2,titleH=mm*1.8,maxW=Math.max(...items.map(s=>D.measure(s,f)));
    for(let cols=1;cols<=4;cols++){const colW=(w-(cols-1)*gap)/cols;if(!clue&&maxW>colW)continue;if(clue&&colW<38)continue;
      const L=listLayout(D,items,f,colW,cols,clue),lh=titleH+L.h;consider({mode:"below",f,s:Math.min(w,h-lh-3),L,gap,titleH,lw:w,lh});}
    if(clue){for(const share of [0.36,0.44,0.52]){const lw=w*share,L=listLayout(D,items,f,lw,1,true),lh=titleH+L.h;
        if(lh<=h)consider({mode:"right",f,s:Math.min(h,w-lw-4),L,gap,titleH,lw,lh});}}
    else for(let cols=1;cols<=3;cols++){const colW=maxW+gap*0.6,lw=Math.max(cols*colW-gap*0.6+gap*(cols-1)*0.4,D.measure(title,f,true)),L=listLayout(D,items,f,colW,cols,false),lh=titleH+L.h;
        if(lh<=h)consider({mode:"right",f,s:Math.min(h,w-lw-4),L,gap:gap*0.4,titleH,lw,lh});}
  }
  if(!best){const f=5.5,L=listLayout(D,items,f,w,2,clue);best={mode:"below",f,s:Math.max(10,h-L.h-6),L,gap:3,titleH:f*0.3528*1.8,lw:w,lh:L.h};}
  const b=best,s=b.s;
  const drawL=(lx,ly)=>{D.text(title,lx,ly,b.f,{bold:true,baseline:"top"});drawList(D,lx,ly+b.titleH,b.L,b.gap);};
  if(b.mode==="below"){const bh=s+3+b.lh,y0=y+(h-bh)/2,x0=x+(w-s)/2,used=b.L.out.length*(b.L.colW+b.gap)-b.gap,lx=x+(w-Math.min(w,used))/2;
    wsGrid(D,x0,y0,s,z,false);drawL(lx,y0+s+3);return [Math.min(x0,lx),y0,Math.max(s,used),bh];}
  const bw=s+4+b.lw,x0=x+(w-bw)/2,bh=Math.max(s,b.lh),y0=y+(h-bh)/2;
  wsGrid(D,x0,y0,s,z,false);drawL(x0+s+4,y0);return [x0,y0,bw,bh];
}
function wsAnswer(D,x,y,w,h,z){
  /* with hidden or clue-only lists, the answer page also spells out the words */
  if(z.list==="words"){const [x0,y0,s]=square(x,y,w,h);wsGrid(D,x0,y0,s,z,true);return [x0,y0,s,s];}
  const f=Math.max(5.5,Math.min(8,w/28)),lh=f*0.3528*1.35,lines=wrap(D,z.words.map(p=>p.w).join(", "),f,w),th=lines.length*lh+2;
  const s=Math.min(w,h-th),x0=x+(w-s)/2,y0=y+(h-s-th)/2;
  wsGrid(D,x0,y0,s,z,true);lines.forEach((l,i)=>D.text(l,x+w/2,y0+s+2+i*lh,f,{baseline:"top",align:"center",color:"#333333"}));
  return [Math.min(x0,x),y0,Math.max(s,w),s+th];
}

/* Each drawer gets a box (x,y,w,h) and returns the rectangle it actually used. */
const DRAW={
  sudoku(D,x,y,w,h,z,ans){const [x0,y0,s]=square(x,y,w,h),u=s/9;
    for(let i=1;i<9;i++)if(i%3){D.line(x0+i*u,y0,x0+i*u,y0+s,0.18,THIN);D.line(x0,y0+i*u,x0+s,y0+i*u,0.18,THIN);}
    for(let i=3;i<9;i+=3){D.line(x0+i*u,y0,x0+i*u,y0+s,0.6,INK);D.line(x0,y0+i*u,x0+s,y0+i*u,0.6,INK);}
    D.rect(x0,y0,s,s,0.9,INK);
    for(let i=0;i<81;i++){const g=z.givens[i],v=ans?z.solution[i]:g;if(v)digit(D,v,x0+(i%9+0.5)*u,y0+(((i/9)|0)+0.53)*u,u,!!g);}
    return [x0,y0,s,s];
  },
  maze(D,x,y,w,h,z,ans){const [x0,y0,s]=square(x,y,w,h),n=z.n,u=s/n,lw=Math.max(0.25,Math.min(0.7,u*0.1));
    if(ans){const pts=z.path.map(i=>[x0+(i%n+0.5)*u,y0+(((i/n)|0)+0.5)*u]);pts.unshift([x0+u/2,y0]);pts.push([x0+s-u/2,y0+s]);D.poly(pts,Math.max(0.4,u*0.28),RED);}
    D.line(x0+u,y0,x0+s,y0,lw,INK);D.line(x0,y0+s,x0+s-u,y0+s,lw,INK);D.line(x0,y0,x0,y0+s,lw,INK);D.line(x0+s,y0,x0+s,y0+s,lw,INK);
    for(let i=0;i<n*n;i++){const r=(i/n)|0,c=i%n;
      if(c<n-1&&z.right[i])D.line(x0+(c+1)*u,y0+r*u,x0+(c+1)*u,y0+(r+1)*u,lw,INK);
      if(r<n-1&&z.down[i])D.line(x0+c*u,y0+(r+1)*u,x0+(c+1)*u,y0+(r+1)*u,lw,INK);}
    return [x0,y0,s,s];
  },
  wordsearch(D,x,y,w,h,z,ans){return ans?wsAnswer(D,x,y,w,h,z):wsDraw(D,x,y,w,h,z);},
  crossword(D,x,y,w,h,z,ans){const R=z.rows,C=z.cols;
    if(ans){const u=Math.min(w/C,h/R),x0=x+(w-u*C)/2,y0=y+(h-u*R)/2;cwGrid(D,x0,y0,u,z,true);return [x0,y0,u*C,u*R];}
    const T=TX[z.lang];let best=null;
    const consider=c=>{if(c.u<3)return;c.sc=Math.min(c.u,8)+c.f*0.8;if(!best||c.sc>best.sc)best=c;};
    for(const f of [10,9,8.5,8,7.5,7,6.5,6,5.5,5]){
      {const cw=(w-5)/2,A=clueBlock(D,z.across,f,cw),B=clueBlock(D,z.down,f,cw),lh=Math.max(A.h,B.h);consider({mode:"below",f,u:Math.min(w/C,(h-lh-4)/R),A,B,cw,lh});}
      for(const share of [0.42,0.5,0.58]){const gw=w*share,cw=w-gw-5,A=clueBlock(D,z.across,f,cw),B=clueBlock(D,z.down,f,cw),lh=A.h+B.h+2;
        if(lh<=h)consider({mode:"right",f,u:Math.min(gw/C,h/R),A,B,cw,lh});}
      if(best&&best.f>=f+1.5)break;
    }
    if(!best){const f=5,cw=(w-5)/2,A=clueBlock(D,z.across,f,cw),B=clueBlock(D,z.down,f,cw),lh=Math.max(A.h,B.h);best={mode:"below",f,u:Math.max(2,Math.min(w/C,(h-lh-4)/R)),A,B,cw,lh};}
    const b=best,gw=b.u*C,gh=b.u*R;
    if(b.mode==="below"){const bh=gh+4+b.lh,y0=y+(h-bh)/2;cwGrid(D,x+(w-gw)/2,y0,b.u,z,false);
      drawClues(D,x,y0+gh+4,T.across,b.A,b.f);drawClues(D,x+b.cw+5,y0+gh+4,T.down,b.B,b.f);return [x,y0,w,bh];}
    const bw=gw+5+b.cw,x0=x+(w-bw)/2,bh=Math.max(gh,b.lh),y0=y+(h-bh)/2;cwGrid(D,x0,y0,b.u,z,false);
    drawClues(D,x0+gw+5,y0,T.across,b.A,b.f);drawClues(D,x0+gw+5,y0+b.A.h+2,T.down,b.B,b.f);return [x0,y0,bw,bh];
  },
  crossnum(D,x,y,w,h,z,ans){return drawCN(D,x,y,w,h,z,ans);},
  cipher(D,x,y,w,h,z,ans){const T=TX[z.lang],showKey=!ans&&z.table,showHint=!ans&&z.hint;
    const top=showKey?keyH(w,z.table,9)+4:showHint?9:0;
    const lay=msgLayout(z.enc,w,h-top,Math.min(9.5,w/6))||msgLayout(z.enc,w,1e9,2.5);
    const H=top+lay.lines.length*lay.lh,y0=y+Math.max(0,(h-H)/2);
    if(showKey)keyTable(D,x,y0,w,z.table,9);
    if(showHint)D.text(T.hint+": "+z.hint[0]+" = "+z.hint[1],x+w/2,y0+3,10,{align:"center",baseline:"middle",bold:true});
    drawMsg(D,x,y0+top,w,lay,z.enc,z.words,ans);return [x,y0,w,H];},
  escape(D,x,y,w,h,z,ans){return ans?escAnswer(D,x,y,w,h,z):escSheet(D,x,y,w,h,z);},
  logic(D,x,y,w,h,z,ans){return ans?lgAnswer(D,x,y,w,h,z):lgSheet(D,x,y,w,h,z);},
  mystery(D,x,y,w,h,z,ans){return ans?lgAnswer(D,x,y,w,h,z):lgSheet(D,x,y,w,h,z);}
};
/* ---- cruci-números grid: numbers on even cells, operators between them, results on the right and bottom ---- */
const opGlyph=o=>o==="-"?"–":o;
function drawCN(D,x,y,w,h,z,ans){
  const n=z.n,m=2*n,u=Math.min(w,h)/m,x0=x+(w-u*m)/2,y0=y+(h-u*m)/2,DARK="#2A2A2A";
  const res=(v,cx,cy)=>{D.fill(cx,cy,u,u,"#F1F1F1");D.rect(cx,cy,u,u,0.35,INK);
    D.text("= "+v,cx+u/2,cy+u*0.55,ptFor(u*(String(v).length>2?0.3:0.37)),{align:"center",baseline:"middle",bold:true});};
  for(let r=0;r<m;r++)for(let c=0;c<m;c++){
    const cx=x0+c*u,cy=y0+r*u,lastC=c===m-1,lastR=r===m-1;
    if(lastC&&lastR)continue;
    if(lastC){if(r%2)D.fill(cx,cy,u,u,DARK);else res(z.rows[r/2],cx,cy);continue;}
    if(lastR){if(c%2)D.fill(cx,cy,u,u,DARK);else res(z.cols[c/2],cx,cy);continue;}
    if(r%2&&c%2){D.fill(cx,cy,u,u,DARK);continue;}
    D.rect(cx,cy,u,u,0.35,INK);
    if(!(r%2)&&!(c%2)){const i=(r/2)*n+c/2,g=z.givens[i],v=ans?z.solution[i]:g;if(v)digit(D,v,cx+u/2,cy+u*0.53,u,!!g);}
    else{const op=r%2?z.vop[(c/2)*(n-1)+(r-1)/2]:z.hop[(r/2)*(n-1)+(c-1)/2];
      D.text(opGlyph(op),cx+u/2,cy+u*0.55,ptFor(u*0.5),{align:"center",baseline:"middle",color:"#333333"});}
  }
  D.rect(x0,y0,u*(m-1),u*(m-1),0.8,INK);
  return [x0,y0,u*m,u*m];
}
/* ---- secret-message helpers ---- */
function keyH(w,table,kwMax){const per=Math.ceil(table.length/2),kw=Math.min(kwMax,w/per);return 4*kw*0.82+1.5;}
function keyTable(D,x,y,w,table,kwMax){
  const per=Math.ceil(table.length/2),kw=Math.min(kwMax,w/per),kh=kw*0.82,x0=x+(w-kw*per)/2,ks=table.some(t=>t[1].length>1)?0.42:0.5;
  for(let b=0;b<2;b++)for(let j=0;j<per;j++){const i=b*per+j;if(i>=table.length)break;const cx=x0+j*kw,cy=y+b*(2*kh+1.5),t=table[i];
    D.fill(cx,cy,kw,kh,"#EDEDED");D.rect(cx,cy,kw,kh,0.3,INK);D.rect(cx,cy+kh,kw,kh,0.3,INK);
    D.text(t[0],cx+kw/2,cy+kh*0.55,ptFor(kh*0.5),{align:"center",baseline:"middle",bold:true});
    if(t[1])D.text(t[1],cx+kw/2,cy+kh*1.55,ptFor(kh*ks),{align:"center",baseline:"middle"});}
  return 4*kh+1.5;
}
function msgLayout(enc,w,hAvail,cuMax){
  for(let cu=cuMax;cu>=2.5;cu-=0.25){
    if(enc.some(wd=>wd.length*cu>w))continue;
    const gap=cu*0.8,lines=[];let cur=[],cw=0;
    enc.forEach((wd,i)=>{const ww=wd.length*cu;if(cur.length&&cw+gap+ww>w){lines.push(cur);cur=[];cw=0;}cw+=(cur.length?gap:0)+ww;cur.push(i);});
    if(cur.length)lines.push(cur);
    const lh=cu*2.15;if(lines.length*lh<=hAvail)return {cu,lines,lh,gap};
  }
  return null;
}
function drawMsg(D,x,y,w,lay,enc,plain,ans){
  const {cu,lines,lh,gap}=lay,cs=enc.some(wd=>wd.some(c=>c.length>1))?0.4:0.48;
  lines.forEach((ln,li)=>{
    const lw=ln.reduce((s,wi,k)=>s+enc[wi].length*cu+(k?gap:0),0);let cx=x+(w-lw)/2;const cy=y+li*lh;
    for(const wi of ln){
      enc[wi].forEach((code,k)=>{const bx=cx+k*cu;
        D.text(code,bx+cu/2,cy+cu*0.42,ptFor(cu*cs),{align:"center",baseline:"middle",bold:true});
        D.rect(bx+cu*0.08,cy+cu*0.78,cu*0.84,cu,0.3,INK);
        if(ans&&plain)D.text(plain[wi][k],bx+cu/2,cy+cu*1.33,ptFor(cu*0.6),{align:"center",baseline:"middle",color:"#333333"});});
      cx+=enc[wi].length*cu+gap;}
  });
  return lines.length*lh;
}
/* ---- escape room: one full page with five challenges and a final code ---- */
const ESC={
  es:{t:["1. SOPA DE LETRAS","2. CANDADO MATEMÁTICO","3. MENSAJE SECRETO","4. CRUCI-NÚMEROS","5. ADIVINANZA","6. CÓDIGO FINAL"],
    d:[()=>"Una palabra de la lista NO está escondida en la sopa. Esa palabra es el código 1.",
       ()=>"Resuelve cada operación y busca el resultado en la tabla. Las letras, en orden, forman el código 2.",
       L=>L>=5?"La clave va al revés: sigue la cuenta de la pista. La palabra es el código 3.":L>=3?"La clave no empieza en 1. Descifra la palabra: es el código 3.":"Cada número es una letra. Descifra la palabra: es el código 3.",
       ()=>"Usa números del 1 al 9 sin repetir y opera en orden. Los números que escribiste, de izquierda a derecha y de arriba abajo, son el código 4.",
       ()=>"Resuelve la adivinanza. La respuesta es el código 5.",
       ()=>"Escribe los cinco códigos en orden para abrir el candado."],
    code:"CÓDIGO",answer:"Respuesta",done:"¡ESCAPASTE!",res:"Resultado",let:"Letra",fin:"Código final",miss:"falta"},
  en:{t:["1. WORD SEARCH","2. MATH LOCK","3. SECRET MESSAGE","4. CROSS NUMBERS","5. RIDDLE","6. FINAL CODE"],
    d:[()=>"One word on the list is NOT hidden in the grid. That word is code 1.",
       ()=>"Solve each problem and find the answer in the table. The letters, in order, spell code 2.",
       L=>L>=5?"The key runs backwards: follow the pattern in the hint. The word is code 3.":L>=3?"The key does not start at 1. Decode the word: it is code 3.":"Each number stands for a letter. Decode the word: it is code 3.",
       ()=>"Use numbers 1 to 9, each only once, and work in order. The numbers you wrote, left to right and top to bottom, are code 4.",
       ()=>"Solve the riddle. The answer is code 5.",
       ()=>"Write the five codes in order to open the lock."],
    code:"CODE",answer:"Answer",done:"YOU ESCAPED!",res:"Answer",let:"Letter",fin:"Final code",miss:"missing"}
};
function boxes(D,x,y,len,cb){for(let i=0;i<len;i++)D.rect(x+i*cb,y,cb,cb,0.45,INK);return len*cb;}
function escSheet(D,x,y,w,h,z){
  const E=ESC[z.lang],T=TX[z.lang],L=z.level,wide=w>h*1.2,cols=wide?3:2,rows=wide?2:3,gp=3;
  const pw=(w-gp*(cols-1))/cols,ph=(h-gp*(rows-1))/rows;
  const fs=Math.max(5,Math.min(8.5,Math.min(pw/88,ph/72)*7.8)),mm=fs*0.3528,pad=2.4,cb=Math.min(5.5,mm*2.4);
  for(let k=0;k<6;k++){
    const px=x+(k%cols)*(pw+gp),py=y+((k/cols)|0)*(ph+gp),ax=px+pad,aw=pw-2*pad;
    D.rect(px,py,pw,ph,0.6,INK);
    const hh=mm*2.1,tw=D.measure(E.t[k],fs,true)+4;
    D.fill(px+pad,py+pad,tw,hh,"#111111");D.text(E.t[k],px+pad+2,py+pad+hh*0.55,fs,{bold:true,baseline:"middle",color:"#FFFFFF"});
    let cy=py+pad+hh+1.6;const df=fs*0.9;
    for(const l of wrap(D,E.d[k](L),df,aw)){D.text(l,ax,cy,df,{baseline:"top",color:"#333333"});cy+=df*0.3528*1.3;}
    cy+=1.5;
    const codeH=k<5?cb+3:0,ay=cy,ah=py+ph-pad-codeH-ay;
    if(k===0){/* word search + word list */
      const ws=z.ws,lf=fs,lw=Math.max(...ws.list.map(s=>D.measure(s,lf)))+3,s=Math.max(10,Math.min(ah,aw-lw-2));
      wsGrid(D,ax,ay,s,{n:ws.n,grid:ws.grid,words:[]},false);
      ws.list.forEach((wd,i)=>{const ly=ay+i*mm*1.7;D.text("•",ax+s+2.5,ly,lf,{baseline:"top"});D.text(wd,ax+s+5,ly,lf,{baseline:"top"});});
    }else if(k===1){/* math lock */
      const P=z.lock.probs,R=z.lock.rows,lh=Math.min(mm*2.2,ah/Math.max(P.length,R.length+1)),bf=Math.min(fs*1.05,ptFor(lh*0.62));
      P.forEach((p,i)=>D.text(String.fromCharCode(65+i)+".  "+p[0].replace(/ - /g," – ")+" = ______",ax,ay+i*lh+lh/2,bf,{baseline:"middle"}));
      const tw2=Math.max(D.measure(E.res+" = "+E.let,bf*0.85,true),D.measure("888 = W",bf))+4,tx=ax+aw-tw2;
      D.fill(tx,ay,tw2,lh,"#EDEDED");D.rect(tx,ay,tw2,lh*(R.length+1),0.4,INK);
      D.text(E.res+" = "+E.let,tx+tw2/2,ay+lh/2,bf*0.85,{align:"center",baseline:"middle",bold:true});
      R.forEach((r,i)=>{D.line(tx,ay+(i+1)*lh,tx+tw2,ay+(i+1)*lh,0.2,"#999999");D.text(r[0]+"  =  "+r[1],tx+tw2/2,ay+(i+1.5)*lh,bf,{align:"center",baseline:"middle"});});
    }else if(k===2){/* secret word */
      const sc=z.sec;let top=0;
      if(sc.table)top=keyTable(D,ax,ay,aw,sc.table,6.5)+2;
      else{D.text(T.hint+": "+sc.hint.map(p=>p[0]+" = "+p[1]).join(", ")+"…",ax+aw/2,ay+mm,fs,{align:"center",baseline:"middle",bold:true});top=mm*2.6;}
      const lay=msgLayout([sc.enc],aw,ah-top,Math.min(9,aw/sc.enc.length))||msgLayout([sc.enc],aw,1e9,2.5);
      drawMsg(D,ax,ay+top+Math.max(0,(ah-top-lay.lh)/2),aw,lay,[sc.enc],null,false);
    }else if(k===3){drawCN(D,ax,ay,aw,ah,z.cn,false);
    }else if(k===4){/* riddle */
      const rf=fs*1.15,lines=wrap(D,z.rid.q,rf,aw-6),lh=rf*0.3528*1.4,bh=lines.length*lh+4;
      D.fill(ax,ay,aw,bh,"#F4F4F4");D.rect(ax,ay,aw,bh,0.3,"#888888");
      lines.forEach((l,i)=>D.text(l,ax+3,ay+2+i*lh,rf,{baseline:"top"}));
      const ry=Math.min(ay+bh+mm*2.2,ay+ah-1);D.text(E.answer+":",ax,ry,fs,{bold:true,baseline:"middle"});
      const lx=ax+D.measure(E.answer+":",fs,true)+2;D.line(lx,ry+mm*0.6,ax+aw,ry+mm*0.6,0.3,INK);
    }else{/* final code */
      const lens=z.codes.map(c=>c.length),doneH=mm*3.4;let lay=null;
      for(let c=6;c>=2;c-=0.25){const rowsArr=[];let cur=[],cw=0;
        lens.forEach((n,i)=>{const gw=n*c;if(cur.length&&cw+c*1.4+gw>aw){rowsArr.push(cur);cur=[];cw=0;}cw+=(cur.length?c*1.4:0)+gw;cur.push(i);});
        rowsArr.push(cur);const rh=c+mm*1.6+2.5;if(rowsArr.length*rh<=ah-doneH){lay={c,rowsArr,rh};break;}}
      if(!lay)lay={c:2,rowsArr:[[0,1,2,3,4]],rh:2+mm*1.6+2.5};
      lay.rowsArr.forEach((ri,r)=>{const rw=ri.reduce((s,i,j)=>s+lens[i]*lay.c+(j?lay.c*1.4:0),0);let bx=ax+(aw-rw)/2;const by=ay+r*lay.rh;
        for(const i of ri){D.text(String(i+1),bx+lens[i]*lay.c/2,by+mm*0.6,fs*0.85,{align:"center",baseline:"middle",bold:true,color:"#555555"});
          boxes(D,bx,by+mm*1.5,lens[i],lay.c);bx+=lens[i]*lay.c+lay.c*1.4;}});
      D.text(E.done,px+pw/2,py+ph-pad-doneH/2,fs*1.7,{align:"center",baseline:"middle",bold:true});
    }
    if(k<5){const ry=py+ph-pad-cb,lab=E.code+" "+(k+1)+":";D.text(lab,ax,ry+cb/2,fs,{bold:true,baseline:"middle"});
      const bx=ax+D.measure(lab,fs,true)+2,len=z.codes[k].length;boxes(D,bx,ry,len,Math.min(cb,(ax+aw-bx)/len));}
  }
  return [x,y,w,h];
}
function escAnswer(D,x,y,w,h,z){
  const E=ESC[z.lang],c=z.codes,P=z.lock.probs;
  const items=[E.t[0]+": "+c[0]+" ("+E.miss+")",E.t[1]+": "+P.map((p,i)=>String.fromCharCode(65+i)+" = "+p[1]).join(", ")+" = "+c[1],
    E.t[2]+": "+c[2],E.t[3]+": "+c[3],E.t[4]+": "+c[4],E.fin+": "+c.join(" · ")];
  for(let f=10;f>=5;f-=0.5){const lh=f*0.3528*1.45,lines=items.map(t=>wrap(D,t,f,w));const n=lines.reduce((s,l)=>s+l.length,0)+0.6;
    if(n*lh<=h||f<=5){let yy=y;lines.forEach((ls,i)=>{if(i===5)yy+=lh*0.6;ls.forEach(l=>{D.text(l,x,yy,f,{baseline:"top",bold:i===5});yy+=lh;});});return [x,y,w,yy-y];}}
}
/* ---- acertijos de lógica y misterios ---- */
/* Classic stepped grid: column groups are the categories; row groups are the names, then the categories from last to second. */
function lgGrid(D,z,u){
  const n=z.n,k=z.cats.length,lf=Math.max(4.6,Math.min(10,ptFor(u*0.52))),mm=lf*0.3528;
  const rows=[{titulo:z.persona,labels:z.names}].concat(z.cats.slice(1).reverse());
  const lw=Math.max(...[].concat(...rows.map(r=>r.labels)).map(s=>D.measure(s,lf)))+2;
  const th=Math.max(...[].concat(...z.cats.map(c=>c.labels)).map(s=>D.measure(s,lf)))+2;
  const titleH=mm*1.7,sideW=mm*1.7;
  return {n,k,u,lf,mm,rows,lw,th,titleH,sideW,W:sideW+lw+k*n*u,H:titleH+th+k*n*u};
}
function lgGridDraw(D,x,y,G,z){
  const {n,k,u,lf,mm,rows,lw,th,titleH,sideW}=G,gx=x+sideW+lw,gy=y+titleH+th;
  z.cats.forEach((c,ci)=>{const cx=gx+ci*n*u;
    D.text(c.titulo,cx+n*u/2,y+titleH*0.45,lf,{align:"center",baseline:"middle",bold:true});
    c.labels.forEach((lab,vi)=>D.text(lab,cx+(vi+0.5)*u+mm*0.35,gy-1,lf,{angle:90}));});
  rows.forEach((rg,ri)=>{const ry=gy+ri*n*u,spans=k-ri,tw=D.measure(rg.titulo,lf,true);
    if(tw<=n*u+1)D.text(rg.titulo,x+sideW*0.5+mm*0.35,ry+n*u/2+tw/2,lf,{angle:90,bold:true});
    rg.labels.forEach((lab,vi)=>D.text(lab,gx-1.2,ry+(vi+0.5)*u,lf,{align:"right",baseline:"middle"}));
    for(let cg=0;cg<spans;cg++){const bx=gx+cg*n*u;
      for(let i=1;i<n;i++){D.line(bx+i*u,ry,bx+i*u,ry+n*u,0.18,THIN);D.line(bx,ry+i*u,bx+n*u,ry+i*u,0.18,THIN);}
      D.rect(bx,ry,n*u,n*u,0.6,INK);}});
}
function lgItems(z){const T=TX[z.lang],out=[];
  if(z.game==="mystery"){out.push({t:z.titulo,bold:true,size:1.25});out.push({t:z.intro,gapAfter:0.5});}
  else out.push({t:z.intro,gapAfter:0.5});
  out.push({t:T.clueList,bold:true});
  z.clues.forEach((c,i)=>out.push({t:c,num:(i+1)+"."}));
  if(z.game==="mystery"){out.push({t:z.evidencia,bold:true,gapBefore:0.5});out.push({t:z.pregunta,ask:true,gapBefore:0.6});}
  return out;}
function textBlock(D,items,f,W){
  const mm=f*0.3528,lh=mm*1.38,numW=D.measure("00.",f,true)+1.2,lines=[];let h=0;
  for(const it of items){const fs=f*(it.size||1),ind=it.num?numW:0;h+=(it.gapBefore||0)*lh;
    const ls=wrap(D,it.t,fs,W-ind,it.bold);ls.forEach((l,i)=>{lines.push({y:h,t:l,fs,bold:it.bold,x:ind,num:i===0?it.num:null,ask:it.ask&&i===ls.length-1});h+=lh*(it.size||1);});
    if(it.ask)h+=lh*1.2;h+=(it.gapAfter||0)*lh;}
  return {h,draw(x,y){for(const l of lines){if(l.num)D.text(l.num,x,y+l.y,l.fs,{baseline:"top",bold:true});
    D.text(l.t,x+l.x,y+l.y,l.fs,{baseline:"top",bold:l.bold});
    if(l.ask){const ly=y+l.y+lh*2.1;D.line(x,ly,x+Math.min(W,70),ly,0.3,INK);}}}};
}
function lgSheet(D,x,y,w,h,z){
  const items=lgItems(z),cache={};let best=null;
  const tb=(f,W)=>{const k=f+"|"+Math.round(W);return cache[k]||(cache[k]=textBlock(D,items,f,W));};
  /* text and grid weigh the same; past 10 pt and 6.5 mm cells nothing gets more readable */
  const score=(f,u)=>Math.min(f,10)/10+Math.min(u,6.5)/6.5+(f+u)*0.001;
  for(const f of [12,11,10.5,10,9.5,9,8.5,8,7.5,7,6.5,6]){
    for(const u of [11,10,9,8,7,6.5,6,5.5,5,4.6,4.2,3.8,3.4]){const G=lgGrid(D,z,u);if(G.W>w||G.H>h)continue;
      const sc=score(f,u);if(best&&sc<=best.sc)continue;
      const sw=w-G.W-6;if(sw>=45){const T=tb(f,sw);if(T.h<=h){best={sc,mode:"side",G,T,tw:sw};continue;}}
      const T2=tb(f,w);if(T2.h+5+G.H<=h)best={sc,mode:"stack",G,T:T2,tw:w};}
  }
  if(!best){const G=lgGrid(D,z,3.2),T=tb(5.5,w);best={mode:"stack",G,T,tw:w};}
  const b=best;
  if(b.mode==="side"){const bh=Math.max(b.T.h,b.G.H),y0=y+(h-bh)/2;b.T.draw(x,y0);lgGridDraw(D,x+w-b.G.W,y0,b.G,z);return [x,y0,w,bh];}
  const bh=b.T.h+5+b.G.H,y0=y+(h-bh)/2;b.T.draw(x,y0);lgGridDraw(D,x+(w-b.G.W)/2,y0+b.T.h+5,b.G,z);return [x,y0,w,bh];
}
function lgAnswer(D,x,y,w,h,z){
  const T=TX[z.lang],head=[z.persona].concat(z.cats.map(c=>c.titulo));
  const rows=z.names.map((nm,p)=>[nm].concat(z.cats.map((c,ci)=>c.labels[z.sol[ci][p]])));
  const myst=z.game==="mystery",top=myst?T.culprit+": "+z.names[z.culprit]:null;
  for(let f=10;f>=4.5;f-=0.5){
    const mm=f*0.3528,rh=mm*1.75,colW=head.map((hd,ci)=>Math.max(D.measure(hd,f,true),...rows.map(r=>D.measure(r[ci],f)))+3);
    const tw=colW.reduce((s,v)=>s+v,0),topH=myst?mm*2.2:0,th=topH+rh*(rows.length+1);
    if((tw>w||th>h)&&f>4.5)continue;
    const x0=x,y0=y+(h-th)/2;
    if(myst)D.text(top,x0,y0,f*1.1,{baseline:"top",bold:true,color:RED});
    const ty=y0+topH;
    D.fill(x0,ty,tw,rh,"#EDEDED");
    rows.forEach((r,ri)=>{if(myst&&ri===z.culprit)D.fill(x0,ty+(ri+1)*rh,tw,rh,"#F7E1DE");});
    let cx=x0;head.forEach((hd,ci)=>{D.text(hd,cx+1.5,ty+rh/2,f,{baseline:"middle",bold:true});
      rows.forEach((r,ri)=>D.text(r[ci],cx+1.5,ty+(ri+1.5)*rh,f,{baseline:"middle",bold:ci===0}));cx+=colW[ci];});
    for(let i=1;i<=rows.length;i++)D.line(x0,ty+i*rh,x0+tw,ty+i*rh,0.2,"#999999");
    D.rect(x0,ty,tw,rh*(rows.length+1),0.4,INK);
    return [x0,y0,Math.max(tw,myst?D.measure(top,f*1.1,true):0),th];
  }
}

function drawPuzzle(D,x,y,w,h,z,ans,lang){
  if(!z){const [x0,y0,s]=square(x,y,w,h);D.rect(x0,y0,s,s,0.3,"#BBBBBB");D.text(TX[lang].making,x0+s/2,y0+s/2,9,{align:"center",baseline:"middle",color:"#999999"});return [x0,y0,s,s];}
  return DRAW[z.game](D,x,y,w,h,z,ans);
}
function infoOf(z,T){switch(z.game){
  case "sudoku":return z.count+" "+T.clues;
  case "maze":case "wordsearch":return z.n+"×"+z.n;
  case "crossword":return (z.across.length+z.down.length)+" "+T.words;
  case "crossnum":return z.n+"×"+z.n;
  case "cipher":return z.words.join("").length+" "+T.letters;
  case "logic":return z.n+" "+T.people;
  case "mystery":return z.n+" "+T.suspects;
  case "escape":return "5 "+T.challenges;}return "";}

/* ---------- pages: every function takes a config, so saved prints can be redrawn exactly ---------- */
const gameAt=(cfg,i)=>cfg.game==="mix"?cfg.assign[i]:cfg.game;
function ansGrid(cfg){const games=cfg.game==="mix"?cfg.mix:[cfg.game],small=games.every(g=>GAMES[g].small);
  return cfg.paper==="A4"?(small?[3,4]:[2,3]):(small?[4,2]:[3,1]);}
/* mode: "all" (puzzles, then answers if cfg.answers), "puzzles" or "answers" */
function buildPages(cfg,mode){
  const P=PAPER[cfg.paper],per=cfg.per,n=per*cfg.pages,pages=[];mode=mode||"all";
  if(mode!=="answers")for(let p=0;p<cfg.pages;p++){const items=[];for(let j=0;j<per;j++){const i=p*per+j;items.push({no:i+1,g:gameAt(cfg,i),z:cfg.pool[i]});}pages.push({kind:"puzzles",items,grid:P.layouts[per]});}
  if(mode==="answers"||(mode==="all"&&cfg.answers)){const ag=ansGrid(cfg),k=ag[0]*ag[1];
    for(let s=0;s<n;s+=k){const items=[];for(let i=s;i<Math.min(n,s+k);i++)items.push({no:i+1,g:gameAt(cfg,i),z:cfg.pool[i]});pages.push({kind:"answers",items,grid:ag});}}
  return pages;
}
function drawPage(D,cfg,page,no,total){
  const P=PAPER[cfg.paper],m=P.m,mix=cfg.game==="mix",ans=page.kind==="answers",lang=cfg.lang,T=TX[lang];
  const name=mix?T.mix:GAMES[cfg.game].name[lang],title=ans?T.answers+": "+name:name,lvl=T.levels[cfg.level];
  D.text(title,m,m+5,P.title,{bold:true,baseline:"middle"});
  D.text(lvl,m+D.measure(title,P.title,true)+3,m+5.4,P.title*0.62,{baseline:"middle",color:"#555555"});
  if(!ans){const lab=T.name+":",x2=P.w-m,x1=x2-Math.min(62,P.w*0.3);
    D.text(lab,x1,m+5.6,8.5,{baseline:"middle",color:"#444444"});D.line(x1+D.measure(lab,8.5)+1.5,m+7.2,x2,m+7.2,0.3,"#666666");}
  D.line(m,m+10,P.w-m,m+10,0.4,INK);
  let ty=m+12.5;
  if(!ans){
    const lh=P.rpt*0.3528*1.35,seen=[];
    for(const it of page.items)if(!seen.includes(it.g))seen.push(it.g);
    for(const g of seen){const G=GAMES[g],txt=(mix?G.name[lang]+": ":"")+G.rule[lang](cfg.level);
      for(const l of wrap(D,txt,P.rpt,P.w-2*m)){D.text(l,m,ty,P.rpt,{baseline:"top",color:"#333333"});ty+=lh;}}
    ty+=1;
  }
  D.text(no+" / "+total,P.w/2,P.h-m/2,8,{align:"center",baseline:"middle",color:"#777777"});
  if(P.sheet){D.dash(6,P.h,P.sheet.w-6,P.h,0.25,"#9A9A9A");D.text(T.cut,6,P.h-1.2,6,{color:"#9A9A9A"});}
  const top=ty+2,bottom=P.h-m-4,labelH=ans?5:7,gap=ans?6:(cfg.paper==="A5"?6:8);
  const [cols,rows]=page.grid,cw=(P.w-2*m)/cols,ch=(bottom-top)/rows,bw=cw-gap,bh=ch-gap-labelH;
  page.items.forEach((it,k)=>{
    const col=k%cols,row=(k/cols)|0,bx=m+col*cw+gap/2,by=top+row*ch+gap/2;
    const r=drawPuzzle(D,bx,by,bw,bh,it.z,ans,lang);
    const lpt=Math.max(7,Math.min(10,Math.min(r[2],80)*0.11)),ly=r[1]+r[3]+labelH*0.62;
    D.text(T.no+" "+it.no+(ans&&mix?", "+GAMES[it.g].name[lang]:""),r[0],ly,lpt,{bold:true,baseline:"middle"});
    if(!ans){const info=mix?GAMES[it.g].name[lang]:(it.z?infoOf(it.z,T):"");
      if(info)D.text(info,r[0]+r[2],ly,lpt,{align:"right",baseline:"middle",color:"#666666"});}
  });
  return [bw,bh];
}

/* ---------- backends ---------- */
const FONT="Helvetica, Arial, sans-serif";
let measureCtx=null;
function svgBackend(){
  if(!measureCtx)measureCtx=document.createElement("canvas").getContext("2d");
  const o=[],n=v=>Math.round(v*100)/100,esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const pts=a=>a.map(p=>n(p[0])+","+n(p[1])).join(" ");
  return{o,
    line(x1,y1,x2,y2,w,col){o.push(`<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${col}" stroke-width="${n(w)}" stroke-linecap="square"/>`);},
    dash(x1,y1,x2,y2,w,col){o.push(`<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${col}" stroke-width="${n(w)}" stroke-dasharray="2 1.5"/>`);},
    rect(x,y,w,h,lw,col){o.push(`<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="none" stroke="${col}" stroke-width="${n(lw)}"/>`);},
    fill(x,y,w,h,col){o.push(`<rect x="${n(x)}" y="${n(y)}" width="${n(w+0.05)}" height="${n(h+0.05)}" fill="${col}"/>`);},
    poly(p,w,col){o.push(`<polyline points="${pts(p)}" fill="none" stroke="${col}" stroke-width="${n(w)}" stroke-linecap="round" stroke-linejoin="round"/>`);},
    shape(p,lw,st,fi){o.push(`<polygon points="${pts(p)}" fill="${fi||"none"}" stroke="${st||"none"}" stroke-width="${n(lw)}" stroke-linejoin="round"/>`);},
    circle(x,y,r,lw,st,fi){if(r>0)o.push(`<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="${fi||"none"}" stroke="${st||"none"}" stroke-width="${n(lw)}"/>`);},
    text(s,x,y,pt,op){const fs=pt*0.3528,b=op.baseline||"alphabetic",dy=b==="middle"?fs*0.35:b==="top"?fs*0.76:0;
      const a=`font-size="${n(fs)}"${op.bold?' font-weight="700"':""} fill="${op.color||INK}"${op.align==="center"?' text-anchor="middle"':op.align==="right"?' text-anchor="end"':""}`;
      if(op.angle)o.push(`<text transform="translate(${n(x)} ${n(y)}) rotate(${-op.angle})" y="${n(dy)}" ${a}>${esc(s)}</text>`);
      else o.push(`<text x="${n(x)}" y="${n(y+dy)}" ${a}>${esc(s)}</text>`);},
    measure(s,pt,b){measureCtx.font=(b?"700 ":"400 ")+(pt*3.528)+"px "+FONT;return measureCtx.measureText(String(s)).width/10;}
  };
}
function pdfBackend(doc){
  doc.setLineCap("square");
  const style=(st,fi)=>st&&fi?"FD":st?"S":"F";
  const set=(st,fi,lw)=>{if(st){doc.setDrawColor(st);doc.setLineWidth(lw);}if(fi)doc.setFillColor(fi);};
  return{
    line(x1,y1,x2,y2,w,col){doc.setDrawColor(col);doc.setLineWidth(w);doc.line(x1,y1,x2,y2);},
    dash(x1,y1,x2,y2,w,col){doc.setLineDashPattern([2,1.5],0);doc.setDrawColor(col);doc.setLineWidth(w);doc.line(x1,y1,x2,y2);doc.setLineDashPattern([],0);},
    rect(x,y,w,h,lw,col){doc.setDrawColor(col);doc.setLineWidth(lw);doc.rect(x,y,w,h,"S");},
    fill(x,y,w,h,col){doc.setFillColor(col);doc.rect(x,y,w+0.05,h+0.05,"F");},
    poly(pts,w,col){doc.setDrawColor(col);doc.setLineWidth(w);doc.setLineCap("round");doc.setLineJoin("round");
      const segs=[];for(let i=1;i<pts.length;i++)segs.push([pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]]);
      doc.lines(segs,pts[0][0],pts[0][1],[1,1],"S",false);doc.setLineCap("square");doc.setLineJoin("miter");},
    shape(pts,lw,st,fi){if(!st&&!fi)return;set(st,fi,lw);doc.setLineJoin("round");
      const segs=[];for(let i=1;i<pts.length;i++)segs.push([pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]]);
      doc.lines(segs,pts[0][0],pts[0][1],[1,1],style(st,fi),true);doc.setLineJoin("miter");},
    circle(x,y,r,lw,st,fi){if(r<=0||(!st&&!fi))return;set(st,fi,lw);doc.circle(x,y,r,style(st,fi));},
    text(s,x,y,pt,o){doc.setFont("helvetica",o.bold?"bold":"normal");doc.setFontSize(pt);doc.setTextColor(o.color||INK);
      const opt={align:o.align||"left",baseline:o.baseline||"alphabetic"};if(o.angle)opt.angle=o.angle;doc.text(String(s),x,y,opt);},
    measure(s,pt,b){doc.setFont("helvetica",b?"bold":"normal");doc.setFontSize(pt);return doc.getTextWidth(String(s));}
  };
}
/* One A4 page as an SVG string (vector, so it prints sharp at any size). */
function pageSVG(cfg,page,no,total){
  const D=svgBackend();drawPage(D,cfg,page,no,total);
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 297" width="210mm" height="297mm" font-family="'+FONT+'" class="hoja" role="img"><rect width="210" height="297" fill="#ffffff"/>'+D.o.join("")+"</svg>";
}
function makePdf(cfg,mode){
  const pages=buildPages(cfg,mode),doc=new window.jspdf.jsPDF({unit:"mm",format:"a4",orientation:"portrait"});
  const D=pdfBackend(doc);pages.forEach((pg,i)=>{if(i)doc.addPage();drawPage(D,cfg,pg,i+1,pages.length);});
  return doc;
}
window.Hojas={LEVEL_IDS,TX,GAMES,GAME_KEYS,MIX_KEYS,PAPER,perFor,allowedPer,buildPages,pageSVG,makePdf};
})();
