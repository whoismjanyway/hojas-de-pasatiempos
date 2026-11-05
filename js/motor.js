/* Hojas de pasatiempos: generador de juegos.
   Se usa como Web Worker (js/motor.js) o directamente en la página (window.crearMotor).
   Todo el contenido (palabras, frases, adivinanzas, misterios) llega desde datos/*.json. */
function crearMotor(DATA){
"use strict";
const R=n=>(Math.random()*n)|0;
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=R(i+1);const t=a[i];a[i]=a[j];a[j]=t;}return a;}
const pop=m=>{let c=0;while(m){m&=m-1;c++}return c};
const lowbit=m=>31-Math.clz32(m&-m);
function combos(arr,k,fn){const pick=[];return (function rec(s){if(pick.length===k)return fn(pick);for(let i=s;i<arr.length;i++){pick.push(arr[i]);if(rec(i+1))return true;pick.pop();}return false;})(0);}
const range=n=>[...Array(n).keys()];
const r2=v=>Math.round(v*100)/100;
const rnd=(a,b)=>a+Math.random()*(b-a);

/* ================= SUDOKU ================= */
const ROWS=[],COLS=[],BOXES=[],BOX=new Array(81),PEERS=[],ISPEER=[];
for(let k=0;k<9;k++){ROWS.push([]);COLS.push([]);BOXES.push([]);}
for(let i=0;i<81;i++){const r=(i/9)|0,c=i%9,b=((r/3)|0)*3+((c/3)|0);BOX[i]=b;ROWS[r].push(i);COLS[c].push(i);BOXES[b].push(i);}
const UNITS=ROWS.concat(COLS,BOXES),LINES=ROWS.concat(COLS);
for(let i=0;i<81;i++){const s=new Set([...ROWS[(i/9)|0],...COLS[i%9],...BOXES[BOX[i]]]);s.delete(i);PEERS.push([...s]);const f=new Uint8Array(81);s.forEach(p=>f[p]=1);ISPEER.push(f);}

function sdFull(){
  const a=new Array(81).fill(0),Rm=new Array(9).fill(0),Cm=new Array(9).fill(0),Bm=new Array(9).fill(0);
  (function rec(i){
    if(i===81)return true;
    const r=(i/9)|0,c=i%9,b=BOX[i];
    for(const d of shuffle([1,2,3,4,5,6,7,8,9])){
      const bit=1<<d;if((Rm[r]|Cm[c]|Bm[b])&bit)continue;
      a[i]=d;Rm[r]|=bit;Cm[c]|=bit;Bm[b]|=bit;
      if(rec(i+1))return true;
      Rm[r]^=bit;Cm[c]^=bit;Bm[b]^=bit;a[i]=0;
    }
    return false;
  })(0);
  return a;
}
function sdCount(g,limit){
  const a=g.slice(),Rm=new Array(9).fill(0),Cm=new Array(9).fill(0),Bm=new Array(9).fill(0);
  for(let i=0;i<81;i++)if(a[i]){const r=(i/9)|0,c=i%9,b=BOX[i],bit=1<<a[i];if((Rm[r]|Cm[c]|Bm[b])&bit)return 0;Rm[r]|=bit;Cm[c]|=bit;Bm[b]|=bit;}
  let count=0;
  (function rec(){
    let best=-1,bm=0,bn=10;
    for(let i=0;i<81;i++)if(!a[i]){const m=~(Rm[(i/9)|0]|Cm[i%9]|Bm[BOX[i]])&0x3FE,n=pop(m);if(n<bn){bn=n;best=i;bm=m;if(n===0)return;}}
    if(best<0){count++;return;}
    const r=(best/9)|0,c=best%9,b=BOX[best];let m=bm;
    while(m){const bit=m&-m;m^=bit;a[best]=lowbit(bit);Rm[r]|=bit;Cm[c]|=bit;Bm[b]|=bit;rec();Rm[r]^=bit;Cm[c]^=bit;Bm[b]^=bit;a[best]=0;if(count>=limit)return;}
  })();
  return count;
}
/* Human-style grader: returns the hardest technique needed (1..10) or 99 if those are not enough. */
function sdGrade(g){
  const grid=g.slice(),cand=new Array(81).fill(0);let empty=0;
  for(let i=0;i<81;i++)if(!grid[i]){cand[i]=0x3FE;empty++;}
  for(let i=0;i<81;i++)if(grid[i]){const nb=~(1<<grid[i]);for(const p of PEERS[i])cand[p]&=nb;}
  const place=(i,d)=>{grid[i]=d;cand[i]=0;empty--;const nb=~(1<<d);for(const p of PEERS[i])cand[p]&=nb;};
  const elim=(cells,mask)=>{let ch=false;for(const i of cells)if(!grid[i]&&(cand[i]&mask)){cand[i]&=~mask;ch=true;}return ch;};
  function nakedSingle(){for(let i=0;i<81;i++)if(!grid[i]){const m=cand[i];if(m&&!(m&(m-1))){place(i,lowbit(m));return true;}}return false;}
  function hiddenSingle(){for(const u of UNITS)for(let d=1;d<=9;d++){const b=1<<d;let pos=-1,n=0;for(const i of u){if(grid[i]===d){n=-99;break;}if(!grid[i]&&(cand[i]&b)){n++;pos=i;}}if(n===1){place(pos,d);return true;}}return false;}
  function locked(){
    for(let b=0;b<9;b++)for(let d=1;d<=9;d++){const bit=1<<d;const ps=BOXES[b].filter(i=>!grid[i]&&(cand[i]&bit));if(ps.length<2)continue;
      const r=(ps[0]/9)|0;if(ps.every(i=>((i/9)|0)===r)&&elim(ROWS[r].filter(i=>BOX[i]!==b),bit))return true;
      const c=ps[0]%9;if(ps.every(i=>i%9===c)&&elim(COLS[c].filter(i=>BOX[i]!==b),bit))return true;}
    for(const L of LINES)for(let d=1;d<=9;d++){const bit=1<<d;const ps=L.filter(i=>!grid[i]&&(cand[i]&bit));if(ps.length<2)continue;const b=BOX[ps[0]];
      if(ps.every(i=>BOX[i]===b)&&elim(BOXES[b].filter(i=>!L.includes(i)),bit))return true;}
    return false;
  }
  function nakedSub(k){for(const u of UNITS){const E=u.filter(i=>!grid[i]);if(E.length<=k)continue;const C=E.filter(i=>pop(cand[i])<=k);
    if(combos(C,k,set=>{let m=0;for(const i of set)m|=cand[i];if(pop(m)!==k)return false;return elim(E.filter(i=>!set.includes(i)),m);}))return true;}return false;}
  function hiddenSub(k){for(const u of UNITS){const E=u.filter(i=>!grid[i]);if(E.length<=k)continue;const pos={},ds=[];
    for(let d=1;d<=9;d++){let m=0;E.forEach((i,j)=>{if(cand[i]&(1<<d))m|=1<<j;});const n=pop(m);if(n>=2&&n<=k){pos[d]=m;ds.push(d);}}
    if(combos(ds,k,set=>{let m=0,dm=0;for(const d of set){m|=pos[d];dm|=1<<d;}if(pop(m)!==k)return false;let ch=false;E.forEach((i,j)=>{if(((m>>j)&1)&&(cand[i]&~dm)){cand[i]&=dm;ch=true;}});return ch;}))return true;}return false;}
  function fish(k){
    for(let d=1;d<=9;d++){const bit=1<<d;
      for(const A of [ROWS,COLS]){const lines=[],pm={};
        for(let a=0;a<9;a++){let m=0;A[a].forEach((i,j)=>{if(!grid[i]&&(cand[i]&bit))m|=1<<j;});const n=pop(m);if(n>=2&&n<=k){lines.push(a);pm[a]=m;}}
        if(combos(lines,k,set=>{let m=0;for(const a of set)m|=pm[a];if(pop(m)!==k)return false;let ch=false;
          for(let j=0;j<9;j++)if((m>>j)&1)for(let a=0;a<9;a++)if(!set.includes(a)){const i=A[a][j];if(!grid[i]&&(cand[i]&bit)){cand[i]&=~bit;ch=true;}}
          return ch;}))return true;}}
    return false;
  }
  function xyWing(){
    for(let p=0;p<81;p++){if(grid[p]||pop(cand[p])!==2)continue;const mp=cand[p];
      for(const a of PEERS[p]){if(grid[a]||pop(cand[a])!==2)continue;const x=cand[a]&mp;if(pop(x)!==1)continue;const c=cand[a]&~x,want=(mp&~x)|c;
        for(const b of PEERS[p]){if(b===a||grid[b]||cand[b]!==want)continue;let ch=false;
          for(let z=0;z<81;z++){if(z===p||z===a||z===b||grid[z])continue;if(ISPEER[a][z]&&ISPEER[b][z]&&(cand[z]&c)){cand[z]&=~c;ch=true;}}
          if(ch)return true;}}}
    return false;
  }
  const T=[[nakedSingle,1],[hiddenSingle,2],[locked,3],[()=>nakedSub(2),4],[()=>hiddenSub(2),5],[()=>nakedSub(3),6],[()=>hiddenSub(3),7],[()=>fish(2),8],[xyWing,9],[()=>fish(3),10]];
  let max=0;
  outer:while(empty>0){for(const [f,l] of T){if(f()){if(l>max)max=l;continue outer;}}return 99;}
  return max;
}
function sdSingles(g,hidden){
  const a=g.slice(),Rm=new Array(9).fill(0),Cm=new Array(9).fill(0),Bm=new Array(9).fill(0);let empty=0;
  for(let i=0;i<81;i++){if(a[i]){const bit=1<<a[i];Rm[(i/9)|0]|=bit;Cm[i%9]|=bit;Bm[BOX[i]]|=bit;}else empty++;}
  const cand=i=>~(Rm[(i/9)|0]|Cm[i%9]|Bm[BOX[i]])&0x3FE;
  const place=(i,d)=>{const bit=1<<d;a[i]=d;Rm[(i/9)|0]|=bit;Cm[i%9]|=bit;Bm[BOX[i]]|=bit;empty--;};
  while(empty){let moved=false;
    for(let i=0;i<81;i++)if(!a[i]){const m=cand(i);if(!m)return false;if(!(m&(m-1))){place(i,lowbit(m));moved=true;}}
    if(!moved&&hidden){for(const u of UNITS)for(let d=1;d<=9;d++){const bit=1<<d;let pos=-1,cnt=0;for(const i of u){if(a[i]===d){cnt=-99;break;}if(!a[i]&&(cand(i)&bit)){cnt++;pos=i;}}if(cnt===1){place(pos,d);moved=true;}}}
    if(!moved)return false;}
  return true;
}
function sdDig(sol,target,logic,sym){
  const p=sol.slice();let n=81;
  const groups=sym?shuffle(range(41)).map(i=>i===40?[40]:[i,80-i]):shuffle(range(81)).map(i=>[i]);
  for(const grp of groups){
    if(n-grp.length<target)continue;
    const saved=grp.map(i=>p[i]);grp.forEach(i=>p[i]=0);
    let keep=sdCount(p,2)===1;
    if(keep&&logic!=="any")keep=sdSingles(p,logic==="hidden");
    if(keep)n-=grp.length;else grp.forEach((i,k)=>p[i]=saved[k]);
  }
  return {p,n};
}
const sdTier=g=>g<=0?0:g===1?0:g===2?1:g===3?2:g<=5?3:g<=8?4:g<=10?5:6;
function sudoku(L){
  if(L===0){const sol=sdFull();const {p,n}=sdDig(sol,50,"naked",true);return {game:"sudoku",n:9,givens:p,solution:sol,count:n};}
  if(L===1){let z=null;for(let a=0;a<40;a++){const sol=sdFull();const {p,n}=sdDig(sol,36,"hidden",true);z={game:"sudoku",n:9,givens:p,solution:sol,count:n};if(sdGrade(p)===2)break;}return z;}
  let best=null;const t0=Date.now();
  for(let a=0;a<1500;a++){
    const sol=sdFull();const sym=L<6||a%2===0;
    const {p,n}=sdDig(sol,17,"any",sym);const g=sdGrade(p),d=Math.abs(sdTier(g)-L);
    if(!best||d<best.d||(d===best.d&&g>best.z.grade))best={d,z:{game:"sudoku",n:9,givens:p,solution:sol,count:n,grade:g}};
    if(d===0||Date.now()-t0>4000)break;
  }
  return best.z;
}

/* ================= MAZE ================= */
function maze(L){
  const n=[6,9,12,15,19,24,30][L],N=n*n;
  const right=new Array(N).fill(1),down=new Array(N).fill(1),seen=new Uint8Array(N);
  const st=[R(N)];seen[st[0]]=1;
  while(st.length){const i=st[st.length-1],r=(i/n)|0,c=i%n,opts=[];
    if(r>0&&!seen[i-n])opts.push(i-n);if(r<n-1&&!seen[i+n])opts.push(i+n);if(c>0&&!seen[i-1])opts.push(i-1);if(c<n-1&&!seen[i+1])opts.push(i+1);
    if(!opts.length){st.pop();continue;}
    const j=opts[R(opts.length)];
    if(j===i+1)right[i]=0;else if(j===i-1)right[j]=0;else if(j===i+n)down[i]=0;else down[j]=0;
    seen[j]=1;st.push(j);}
  const prev=new Array(N).fill(-1);prev[0]=0;const q=[0];
  while(q.length){const i=q.shift(),r=(i/n)|0,c=i%n;
    const go=j=>{if(prev[j]<0){prev[j]=i;q.push(j);}};
    if(c<n-1&&!right[i])go(i+1);if(c>0&&!right[i-1])go(i-1);if(r<n-1&&!down[i])go(i+n);if(r>0&&!down[i-n])go(i-n);}
  const path=[];for(let i=N-1;;i=prev[i]){path.push(i);if(i===0)break;}path.reverse();
  return {game:"maze",n,right,down,path};
}

/* ================= DATOS Y MEMORIA DE RECIENTES ================= */
function norm(s){return String(s).toUpperCase().replace(/Ñ/g,"\u0001").normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/\u0001/g,"Ñ").replace(/[^A-ZÑ]/g,"");}
const pick=a=>a[R(a.length)];
const THEMES=DATA.palabras.temas.map(t=>({id:t.id,es:t.es,en:t.en,
  items:t.palabras.map(f=>({es:{w:norm(f[0]),q:f[1]},en:{w:norm(f[2]),q:f[3]}}))}));
/* AV: keys used recently (sent by the page). USED: keys this puzzle uses, returned so the page can remember them. */
let AV=new Set(),USED=[];
const use=k=>{USED.push(k);};
/* Shuffles, then moves recently used items to the end so fresh ones are tried first. */
function fresh(arr,key){const a=shuffle(arr.slice());return a.filter(x=>!AV.has(key(x))).concat(a.filter(x=>AV.has(key(x))));}
function pickThemes(lang,count){
  const scored=THEMES.map(t=>({t,s:(AV.has("t:"+t.id)?6:0)+t.items.filter(e=>AV.has("w:"+e[lang].w)).length/t.items.length*10+Math.random()*3}));
  scored.sort((a,b)=>a.s-b.s);return scored.slice(0,count).map(x=>x.t);
}

/* ================= SOPA DE LETRAS ================= */
const DR8=[[0,1],[1,0],[1,1],[-1,1],[0,-1],[-1,0],[1,-1],[-1,-1]];
/* list: how the words are shown under the grid. words = the words; mask = some letters hidden; clues = only the clue. */
const WS=[{n:8,k:6,d:2,max:7,list:"words"},{n:10,k:8,d:3,list:"words"},{n:11,k:10,d:4,list:"words"},{n:12,k:12,d:8,list:"words"},
  {n:14,k:13,d:8,list:"mask"},{n:15,k:12,d:8,decoy:1,frag:3,list:"clues"},{n:16,k:14,d:8,decoy:1,frag:5,list:"clues",themes:2}];
const FILL={es:"AAAAAAAAAAAAEEEEEEEEEEEEEOOOOOOOOOSSSSSSRRRRRRRNNNNNNIIIIIIDDDDDLLLLLCCCCTTTTUUUUMMMPPBBGGVYQHFZJÑX",
            en:"EEEEEEEEEEEETTTTTTTTTAAAAAAAAOOOOOOOIIIIIIINNNNNNNSSSSSSHHHHHHRRRRRRDDDDLLLLCCCUUUMMWWFFGGYYPPBVKJXQZ"};
function wsCount(g,n,w){let c=0;
  for(let r=0;r<n;r++)for(let col=0;col<n;col++)if(g[r*n+col]===w[0])for(const [dr,dc] of DR8){let ok=true;
    for(let i=1;i<w.length;i++){const rr=r+dr*i,cc=col+dc*i;if(rr<0||cc<0||rr>=n||cc>=n||g[rr*n+cc]!==w[i]){ok=false;break;}}if(ok)c++;}
  return c;}
/* Candidate words from some themes: no palindromes, none inside another, fresh words first. */
function wsPool(items,lang,max){const pool=[];
  for(const e of fresh(items,e=>"w:"+e[lang].w)){const w=e[lang].w;
    if(w.length<3||w.length>max)continue;if(w===[...w].reverse().join(""))continue;
    if(pool.some(p=>p.w.includes(w)||w.includes(p.w)))continue;pool.push({w,q:e[lang].q});}
  return pool;}
function wsPlace(n,dirs,cand,k,L){const g=new Array(n*n).fill(""),placed=[];
  for(const e of cand){const w=e.w;if(placed.length>=k)break;const opts=[];let bestOv=0;
    for(const [dr,dc] of dirs)for(let r=0;r<n;r++)for(let c=0;c<n;c++){
      const er=r+dr*(w.length-1),ec=c+dc*(w.length-1);if(er<0||ec<0||er>=n||ec>=n)continue;
      let ov=0,ok=true;for(let i=0;i<w.length;i++){const ch=g[(r+dr*i)*n+c+dc*i];if(ch){if(ch!==w[i]){ok=false;break;}ov++;}}
      if(!ok||ov===w.length)continue;opts.push({r,c,dr,dc,ov});if(ov>bestOv)bestOv=ov;}
    if(!opts.length)continue;
    let choice=opts;if(L>=3&&bestOv>0&&Math.random()<0.7)choice=opts.filter(o=>o.ov>0);
    const o=pick(choice);for(let i=0;i<w.length;i++)g[(o.r+o.dr*i)*n+o.c+o.dc*i]=w[i];
    placed.push({w,q:e.q,r:o.r,c:o.c,dr:o.dr,dc:o.dc});}
  return {g,placed};}
/* Fragments (a word minus its last letter) make the hardest grids misleading. */
function wsFragments(g,n,placed,count){
  for(let t=0;t<count*12&&count>0;t++){
    const p=pick(placed);if(p.w.length<5)continue;const f=p.w.slice(0,p.w.length-1-R(2));const [dr,dc]=pick(DR8);
    const r=R(n),c=R(n),er=r+dr*(f.length-1),ec=c+dc*(f.length-1);if(er<0||ec<0||er>=n||ec>=n)continue;
    let ok=true;for(let i=0;i<f.length;i++){const ch=g[(r+dr*i)*n+c+dc*i];if(ch&&ch!==f[i]){ok=false;break;}}
    if(!ok)continue;for(let i=0;i<f.length;i++)g[(r+dr*i)*n+c+dc*i]=f[i];count--;}
}
function wsFill(g,n,placed,lang,decoy,absent){const letters=FILL[lang],wl=placed.map(p=>p.w).join("");
  for(let t=0;t<30;t++){
    const f=g.map(ch=>ch||(decoy&&Math.random()<0.5?wl[R(wl.length)]:letters[R(letters.length)]));
    if(placed.every(p=>wsCount(f,n,p.w)===1)&&(!absent||wsCount(f,n,absent)===0))return f;}
  return null;}
function maskWord(w){const keep=new Set([0]);const extra=Math.max(1,Math.round(w.length*0.3));
  while(keep.size<Math.min(w.length-1,1+extra))keep.add(R(w.length));
  return [...w].map((ch,i)=>keep.has(i)?ch:"_").join(" ");}
function wordsearch(L,lang){
  const P=WS[L],n=P.n,dirs=DR8.slice(0,P.d);
  for(let att=0;att<80;att++){
    const ths=pickThemes(lang,P.themes||1),items=[].concat(...ths.map(t=>t.items)),pool=wsPool(items,lang,P.max||n);
    if(pool.length<P.k)continue;
    const {g,placed}=wsPlace(n,dirs,pool.slice(0,P.k+6).sort((a,b)=>b.w.length-a.w.length),P.k,L);
    if(placed.length<P.k)continue;
    wsFragments(g,n,placed,P.frag||0);
    const f=wsFill(g,n,placed,lang,P.decoy);if(!f)continue;
    ths.forEach(t=>use("t:"+t.id));placed.forEach(p=>use("w:"+p.w));
    const words=placed.sort((a,b)=>a.w.localeCompare(b.w)).map(p=>Object.assign(p,{mask:P.list==="mask"?maskWord(p.w):null}));
    if(P.list==="clues")shuffle(words);
    return {game:"wordsearch",n,grid:f,words,list:P.list,theme:ths.map((t,i)=>i&&lang==="es"&&/^(El|La|Los|Las) /.test(t.es)?t.es.charAt(0).toLowerCase()+t.es.slice(1):t[lang]).join(lang==="es"?" y ":" and "),lang};
  }
  return null;
}

/* ================= CRUCIGRAMA ================= */
const CW=[{k:5,S:8,max:7,rev:"first"},{k:7,S:9,max:8,rev:0.3},{k:9,S:10,max:9,rev:0.15},{k:11,S:11,rev:0},{k:13,S:12,rev:0},{k:15,S:13,rev:0},{k:17,S:15,rev:0}];
function crossword(L,lang){
  const P=CW[L],S=P.S,max=P.max||S,seen=new Set(),all=[];
  for(const th of THEMES)for(const e of th.items){const x=e[lang];if(x.w.length<3||x.w.length>max||seen.has(x.w))continue;seen.add(x.w);all.push(x);}
  const key=(r,c)=>(r+50)*200+(c+50);
  let best=null;
  for(let att=0;att<40;att++){
    const ordered=fresh(all,x=>"w:"+x.w),freshN=ordered.filter(x=>!AV.has("w:"+x.w)).length;
    const pool=ordered.slice(0,Math.max(110,Math.min(freshN,160)));
    const G=new Map(),DR=new Map(),pl=[];let r0=0,r1=0,c0=0,c1=0;
    const put=(e,r,c,dr,dc)=>{const bit=dr?2:1;for(let i=0;i<e.w.length;i++){const k=key(r+dr*i,c+dc*i);G.set(k,e.w[i]);DR.set(k,(DR.get(k)||0)|bit);}
      r0=Math.min(r0,r);c0=Math.min(c0,c);r1=Math.max(r1,r+dr*(e.w.length-1));c1=Math.max(c1,c+dc*(e.w.length-1));pl.push({e,r,c,dr,dc});};
    const fits=(w,r,c,dr,dc)=>{const n=w.length,bit=dr?2:1;
      if(G.has(key(r-dr,c-dc))||G.has(key(r+dr*n,c+dc*n)))return -1;
      if(Math.max(r1,r+dr*(n-1))-Math.min(r0,r)+1>S||Math.max(c1,c+dc*(n-1))-Math.min(c0,c)+1>S)return -1;
      let x=0;for(let i=0;i<n;i++){const rr=r+dr*i,cc=c+dc*i,k=key(rr,cc),ch=G.get(k);
        if(ch!==undefined){if(ch!==w[i]||(DR.get(k)&bit))return -1;x++;}
        else if(G.has(key(rr+dc,cc+dr))||G.has(key(rr-dc,cc-dr)))return -1;}
      return x;};
    const first=pool.find(e=>e.w.length>=Math.min(max,Math.ceil(S*0.6)))||pool[0];
    const fd=R(2);put(first,0,0,fd,1-fd);const usedW=new Set([first.w]);
    for(let pass=0;pass<3&&pl.length<P.k;pass++)for(const e of pool){
      if(pl.length>=P.k)break;if(usedW.has(e.w))continue;
      const opts=[];let bx=0;
      for(const [k,ch] of G){const rs=((k/200)|0)-50,cs=k%200-50;
        for(let i=0;i<e.w.length;i++){if(e.w[i]!==ch)continue;
          for(const [dr,dc] of [[0,1],[1,0]]){const r=rs-dr*i,c=cs-dc*i,x=fits(e.w,r,c,dr,dc);if(x>0){opts.push({r,c,dr,dc,x});if(x>bx)bx=x;}}}}
      if(!opts.length)continue;
      const top=opts.filter(o=>o.x===bx),o=pick(top);put(e,o.r,o.c,o.dr,o.dc);usedW.add(e.w);}
    const stale=pl.filter(p=>AV.has("w:"+p.e.w)).length;
    const sc=pl.length*10-((r1-r0+1)*(c1-c0+1))/(S*S)-stale*2;
    if(!best||sc>best.sc)best={sc,pl,r0,c0,rows:r1-r0+1,cols:c1-c0+1,G};
    if(pl.length>=P.k&&att>=5)break;
  }
  const b=best,rows=b.rows,cols=b.cols,cells=new Array(rows*cols).fill("");
  for(const [k,ch] of b.G){const r=((k/200)|0)-50-b.r0,c=k%200-50-b.c0;cells[r*cols+c]=ch;}
  const ws=b.pl.map(p=>({w:p.e.w,q:p.e.q,r:p.r-b.r0,col:p.c-b.c0,down:!!p.dr})).sort((a,c)=>a.r-c.r||a.col-c.col);
  ws.forEach(w=>use("w:"+w.w));
  const starts=new Map();
  for(const w of ws){const i=w.r*cols+w.col;if(!starts.has(i))starts.set(i,starts.size+1);w.n=starts.get(i);}
  const reveal=new Array(rows*cols).fill(false);
  if(P.rev==="first")for(const w of ws)reveal[w.r*cols+w.col]=true;
  else if(P.rev)cells.forEach((ch,i)=>{if(ch&&Math.random()<P.rev)reveal[i]=true;});
  const byDir=d=>ws.filter(w=>w.down===d).sort((a,c)=>a.n-c.n).map(w=>({n:w.n,q:w.q,w:w.w}));
  return {game:"crossword",rows,cols,cells,reveal,nums:[...starts],across:byDir(false),down:byDir(true),lang};
}

/* ================= CRUCI-NÚMEROS ================= */
/* Numbers 1-9, each used once. Rows and columns are worked strictly in order (left to right, top to bottom). */
const CN=[{n:2,ops:"+",hide:2},{n:2,ops:"+-",hide:3},{n:3,ops:"+-",hide:4},{n:3,ops:"+-×",hide:5,need:"×"},{n:3,ops:"+-×÷",hide:6,need:"÷"},{n:3,ops:"+-×÷",hide:8,need:"÷"},{n:3,ops:"+-×÷",hide:9,need:"×"}];
function cnEval(v,o,strict){let a=v[0];
  for(let i=0;i<o.length;i++){const b=v[i+1];
    switch(o[i]){case "+":a+=b;break;case "-":a-=b;break;case "×":a*=b;break;default:if(a%b)return NaN;a/=b;}
    if(strict&&a<=0)return NaN;}
  return a;}
function cnSolve(n,giv,hop,vop,rows,cols,limit){
  const a=giv.slice(),used=new Set(giv.filter(Boolean)),out=[];
  const rowOk=r=>cnEval(a.slice(r*n,r*n+n),hop.slice(r*(n-1),(r+1)*(n-1)))===rows[r];
  const colOk=c=>cnEval(range(n).map(r=>a[r*n+c]),vop.slice(c*(n-1),(c+1)*(n-1)))===cols[c];
  const fin=i=>{const r=(i/n)|0,c=i%n;if(c===n-1&&!rowOk(r))return false;if(r===n-1&&!colOk(c))return false;return true;};
  (function rec(i){
    if(out.length>=limit)return;
    if(i===n*n){out.push(a.slice());return;}
    if(a[i]){if(fin(i))rec(i+1);return;}
    for(let d=1;d<=9;d++){if(used.has(d))continue;a[i]=d;used.add(d);if(fin(i))rec(i+1);used.delete(d);a[i]=0;if(out.length>=limit)return;}
  })(0);
  return out;}
function cnMake(n,ops,hide,need){
  for(let att=0;att<4000;att++){
    if(att===3000)need=null;
    const g=shuffle(range(9).map(i=>i+1)).slice(0,n*n);
    const hop=range(n*(n-1)).map(()=>ops[R(ops.length)]),vop=range(n*(n-1)).map(()=>ops[R(ops.length)]);
    if(need&&!hop.concat(vop).includes(need))continue;
    const rows=range(n).map(r=>cnEval(g.slice(r*n,r*n+n),hop.slice(r*(n-1),(r+1)*(n-1)),true));
    const cols=range(n).map(c=>cnEval(range(n).map(r=>g[r*n+c]),vop.slice(c*(n-1),(c+1)*(n-1)),true));
    if(rows.concat(cols).some(v=>!(v>0)||v>200))continue;
    const giv=new Array(n*n).fill(0);
    for(;;){const s=cnSolve(n,giv,hop,vop,rows,cols,2);if(s.length===1)break;
      const d=range(n*n).filter(i=>s[0][i]!==s[1][i]);const i=d[R(d.length)];giv[i]=g[i];}
    const hid=shuffle(range(n*n).filter(i=>!giv[i]));while(hid.length>hide){const i=hid.pop();giv[i]=g[i];}
    return {n,givens:giv,solution:g,hop,vop,rows,cols};
  }
  return null;}
function crossnum(L){const P=CN[L],z=cnMake(P.n,P.ops,P.hide,P.need);return z&&Object.assign({game:"crossnum"},z);}

/* ================= MENSAJE SECRETO ================= */
const ALPHA={es:"ABCDEFGHIJKLMNÑOPQRSTUVWXYZ",en:"ABCDEFGHIJKLMNOPQRSTUVWXYZ"};
/* Fixed sentences plus sentences built from templates, so the same message rarely comes back. */
function makePhrases(lang,count){const F=DATA.frases[lang],out=F.fijas.slice();
  for(let i=0;i<count;i++)out.push(pick(F.plantillas).replace(/\{(\w+)\}/g,(_,k)=>pick(F[k])));
  return [...new Set(out)];}
const CI=[{t:"num",min:6,max:16},{t:"num",min:12,max:26},{t:"shuf",min:14,max:32},{t:"caesar",min:16,max:34},{t:"hint",min:16,max:36},{t:"shuf",miss:0.3,min:18,max:40},{t:"shuf",miss:0.55,min:20,max:44}];
function cipher(L,lang){
  const P=CI[L],A=ALPHA[lang],N=A.length;
  const list=makePhrases(lang,120).map(s=>({s,w:s.split(/\s+/).map(norm).filter(Boolean)}));
  let c=list.filter(x=>{const l=x.w.join("").length;return l>=P.min&&l<=P.max;});if(!c.length)c=list;
  const chosen=fresh(c,x=>"p:"+x.s)[0];use("p:"+chosen.s);
  const words=chosen.w,k=2+R(N-3);
  const code=P.t==="num"?range(N).map(i=>String(i+1)):P.t==="shuf"?shuffle(range(N).map(i=>String(i+1))):range(N).map(i=>A[(i+k)%N]);
  const map={};[...A].forEach((ch,i)=>map[ch]=code[i]);
  let table=[...A].map((ch,i)=>[ch,code[i]]),hint=null;
  if(P.t==="hint"){table=null;hint=[A[0],code[0]];}
  if(P.miss){const inMsg=shuffle([...new Set(words.join(""))]);inMsg.slice(0,Math.round(inMsg.length*P.miss)).forEach(ch=>{table[A.indexOf(ch)][1]="";});}
  return {game:"cipher",lang,mode:P.t,table,hint,words,enc:words.map(w=>[...w].map(ch=>map[ch]))};
}

/* ================= ESCAPE ROOM ================= */
function mkProb(L){const r=(a,b)=>a+R(b-a+1);let a,b,c;
  switch(L){
    case 0:a=r(1,10);b=r(1,10);return [a+" + "+b,a+b];
    case 1:a=r(6,20);b=r(1,a-1);return Math.random()<0.5?[a+" + "+b,a+b]:[a+" - "+b,a-b];
    case 2:a=r(12,50);b=r(2,a-2);return Math.random()<0.5?[a+" + "+b,a+b]:[a+" - "+b,a-b];
    case 3:a=r(2,9);b=r(2,9);return [a+" × "+b,a*b];
    case 4:if(Math.random()<0.5){a=r(3,12);b=r(3,12);return [a+" × "+b,a*b];}a=r(40,99);b=r(11,a-5);return [a+" - "+b,a-b];
    case 5:a=r(2,9);b=r(2,9);c=r(2,20);return [a+" × "+b+" + "+c,a*b+c];
    default:if(Math.random()<0.5){a=r(3,9);b=r(3,9);c=r(2,a*b-2);return [a+" × "+b+" - "+c,a*b-c];}
      c=r(2,9);b=r(2,9);a=c*b;const d=r(2,30);return [a+" ÷ "+b+" + "+d,c+d];
  }}
function escape(L,lang){
  const A=ALPHA[lang],N=A.length,allWords=[];
  for(const t of THEMES)for(const e of t.items)allWords.push(e[lang].w);
  for(let att=0;att<60;att++){
    /* 1. word search: one listed word is missing from the grid */
    const n=[7,7,8,8,9,10,10][L],k=[4,4,4,5,5,6,6][L],dirs=DR8.slice(0,[2,2,4,4,8,8,8][L]);
    const th=pickThemes(lang,1)[0],pool=wsPool(th.items,lang,Math.min(n-1,8));
    if(pool.length<k+1)continue;
    const chosen=pool.slice(0,k+1),miss=chosen[k].w;
    const {g,placed}=wsPlace(n,dirs,chosen.slice(0,k).sort((a,b)=>b.w.length-a.w.length),k,L);
    if(placed.length<k)continue;
    const f=wsFill(g,n,placed,lang,L>=5,miss);if(!f)continue;
    const ws={n,grid:f,placed,list:chosen.map(e=>e.w).sort((a,b)=>a.localeCompare(b))};
    /* 2. math lock: answers map to letters that spell a word */
    const len=[3,3,3,4,4,5,5][L];
    const wc=fresh([...new Set(allWords.filter(w=>w.length===len&&new Set(w).size===len))],w=>"w:"+w);
    if(!wc.length)continue;
    const word=wc[0],probs=[],ans=new Set();let bad=false;
    for(const ch of word){let p,tries=0;do{p=mkProb(L);}while(ans.has(p[1])&&++tries<60);if(ans.has(p[1])){bad=true;break;}ans.add(p[1]);probs.push([p[0],p[1],ch]);}
    if(bad)continue;
    const rows=probs.map(p=>[p[1],p[2]]),extra=[2,2,2,3,3,4,4][L];
    for(let guard=0;rows.length<len+extra&&guard<300;guard++){const v=mkProb(L)[1],ch=A[R(N)];if(ans.has(v)||word.includes(ch)||rows.some(q=>q[1]===ch))continue;ans.add(v);rows.push([v,ch]);}
    rows.sort((a,b)=>a[0]-b[0]);
    /* 3. secret word */
    const sw=fresh(allWords.filter(w=>w.length>=4&&w.length<=(L<2?5:L<5?6:7)&&w!==word&&w!==miss),w=>"w:"+w);
    const sword=sw[0],rev=L>=5,start=L>=3&&!rev?3+R(7):1;
    const codeOf=i=>rev?N-i:start+i;
    const sec={mode:rev?"rev":start>1?"shift":"num",table:rev?null:[...A].map((ch,i)=>[ch,String(codeOf(i))]),
      hint:rev?[[A[0],N],[A[1],N-1],[A[2],N-2]]:null,enc:[...sword].map(ch=>String(codeOf(A.indexOf(ch)))),word:sword};
    /* 4. small cross numbers: the missing numbers in reading order */
    const cn=cnMake(2,["+","+-","+-","+-×","+-×÷","+-×÷","+-×÷"][L],[2,2,3,3,3,4,4][L],L>=4?"×":null);if(!cn)continue;
    const c4=range(4).filter(i=>!cn.givens[i]).map(i=>cn.solution[i]).join("");
    /* 5. riddle */
    const rd=fresh(DATA.adivinanzas[lang],x=>"r:"+norm(x[1]))[0];
    const rid={q:rd[0],a:norm(rd[1])};
    use("t:"+th.id);chosen.forEach(e=>use("w:"+e.w));use("w:"+word);use("w:"+sword);use("r:"+rid.a);
    return {game:"escape",lang,level:L,ws,lock:{probs,rows,word},sec,cn,rid,codes:[miss,word,sword,c4,rid.a]};
  }
  return null;
}

/* ================= ACERTIJOS DE LÓGICA Y MISTERIOS ================= */
/* A person is p (0..n-1). sol[c][p] is the value index person p has in category c.
   A reference is {c,v}: c=-1 means the person's name (v = person), otherwise value v of category c. */
const PERMS={};
function perms(n){if(PERMS[n])return PERMS[n];const out=[];
  (function rec(a,used){if(a.length===n){out.push(a.slice());return;}for(let i=0;i<n;i++)if(!used[i]){used[i]=1;a.push(i);rec(a,used);a.pop();used[i]=0;}})([],[]);
  return PERMS[n]=out;}
function lgSolve(n,k,clues,limit){
  const P=perms(n),perm=new Array(k),inv=new Array(k);let count=0,first=null;
  const need=clues.map(cl=>{let m=-1;for(const r of [cl.a,cl.b,cl.b2])if(r&&r.c>m)m=r.c;if(cl.o!=null&&cl.o>m)m=cl.o;return m;});
  const who=r=>r.c<0?r.v:inv[r.c][r.v];
  const holds=cl=>{const pa=who(cl.a),pb=who(cl.b);
    switch(cl.t){
      case "is":return pa===pb;
      case "not":return pa!==pb;
      case "or":{const pc=who(cl.b2);return pa===pb||pa===pc;}
      case "lt":return perm[cl.o][pa]<perm[cl.o][pb];
      case "next":return perm[cl.o][pa]+1===perm[cl.o][pb];
      default:return Math.abs(perm[cl.o][pa]-perm[cl.o][pb])===1;}};
  (function rec(c){
    if(c===k){count++;if(!first)first=perm.map(p=>p.slice());return;}
    for(const p of P){perm[c]=p;const iv=new Array(n);p.forEach((v,i)=>iv[v]=i);inv[c]=iv;
      let ok=true;for(let i=0;i<clues.length;i++)if(need[i]===c&&!holds(clues[i])){ok=false;break;}
      if(ok)rec(c+1);if(count>=limit)return;}
  })(0);
  return {count,first};
}
/* How often each kind of clue appears, by difficulty. */
const MIXES={easy:{is:5,not:2,or:0,lt:0,next:0,adj:0},mid:{is:3,not:3,or:1,lt:1,next:1,adj:1},
  hard:{is:1.5,not:3,or:2,lt:2,next:2,adj:2},expert:{is:0.6,not:3,or:2.5,lt:3,next:2,adj:2.5}};
function lgClues(n,k,sol,ord,mixName){
  const mix=MIXES[mixName],inv=sol.map(s=>{const iv=[];s.forEach((v,p)=>iv[v]=p);return iv;});
  const ref=(c,p)=>({c,v:c<0?p:sol[c][p]});
  const cats=range(k),catsAndName=[-1].concat(cats),plain=catsAndName.filter(c=>c!==ord);
  const types=Object.keys(mix).filter(t=>mix[t]>0&&(ord>=0||!["lt","next","adj"].includes(t)));
  const total=types.reduce((s,t)=>s+mix[t],0);
  const drawType=()=>{let x=Math.random()*total;for(const t of types){x-=mix[t];if(x<=0)return t;}return types[0];};
  const two=(arr)=>{const a=shuffle(arr.slice());return [a[0],a[1]];};
  function gen(){const t=drawType(),p=R(n);
    if(t==="is"){const [c1,c2]=two(catsAndName);if(mixName==="expert"&&(c1<0||c2<0)&&Math.random()<0.8)return null;return {t,a:ref(c1,p),b:ref(c2,p)};}
    if(t==="not"){let q=R(n);if(q===p)return null;const [c1,c2]=two(catsAndName);return {t,a:ref(c1,p),b:ref(c2,q)};}
    if(t==="or"){const c1=pick(catsAndName),c2=pick(cats.filter(c=>c!==c1));if(c2==null)return null;let q=R(n);if(q===p)return null;
      const bb=[ref(c2,p),ref(c2,q)];if(ord===c2)bb.sort((x,y)=>x.v-y.v);else if(Math.random()<0.5)bb.reverse();return {t,a:ref(c1,p),b:bb[0],b2:bb[1]};}
    const o=ord,rank=pp=>sol[o][pp];let q;
    if(t==="lt"){q=R(n);if(rank(p)>=rank(q))return null;}
    else if(t==="next"){if(rank(p)===n-1)return null;q=inv[o][rank(p)+1];}
    else{const opts=[rank(p)-1,rank(p)+1].filter(r=>r>=0&&r<n);q=inv[o][pick(opts)];}
    return {t,o,a:ref(pick(plain),p),b:ref(pick(plain),q)};}
  const keyOf=cl=>[cl.t,cl.o,cl.a.c,cl.a.v,cl.b.c,cl.b.v,cl.b2?cl.b2.c+"/"+cl.b2.v:""].join(",");
  for(let att=0;att<30;att++){
    const clues=[],keys=new Set();let guard=0;
    while(guard++<400){
      const cl=gen();if(!cl)continue;const kk=keyOf(cl);if(keys.has(kk))continue;
      if(cl.t==="is"&&cl.a.c===cl.b.c)continue;
      keys.add(kk);clues.push(cl);
      if(clues.length>=n&&lgSolve(n,k,clues,2).count===1)break;
    }
    if(lgSolve(n,k,clues,2).count!==1)continue;
    /* drop clues that are not needed, so every clue counts */
    for(const cl of shuffle(clues.slice())){const rest=clues.filter(x=>x!==cl);if(lgSolve(n,k,rest,2).count===1)clues.splice(clues.indexOf(cl),1);}
    return clues;
  }
  return null;
}
function lgText(cl,ctx){
  const {names,cats,L}=ctx,cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
  const fill=(tpl,v)=>tpl.replace("{v}",v);
  const phrase=r=>fill(cats[r.c].si,cats[r.c].vals[r.v][1]);
  const subj=r=>r.c<0?names[r.v]:L.quien+" "+phrase(r);
  let a=cl.a,b=cl.b;
  if((cl.t==="is"||cl.t==="not")&&b.c<0){const t=a;a=b;b=t;}
  let s;
  if(cl.t==="is")s=subj(a)+" "+phrase(b);
  else if(cl.t==="not")s=subj(a)+" "+fill(cats[b.c].no,cats[b.c].vals[b.v][1]);
  else if(cl.t==="or"){const v1=cats[b.c].vals[b.v][1],v2=cats[cl.b2.c].vals[cl.b2.v][1];
    let o=L.o;if(o==="o"&&/^h?o/i.test(v2))o="u";
    s=subj(a)+" "+fill(cats[b.c].si,v1+" "+o+" "+v2);}
  else{const oc=cats[cl.o],rel=cl.t==="lt"?oc.menor:cl.t==="next"?oc.justo:oc.lado;s=subj(a)+" "+rel+" "+subj(b);}
  return cap(s)+".";
}
/* Builds category objects with exactly n values: ordered categories keep their first n values in order. */
function lgCats(defs,n){return defs.map(d=>({titulo:d.titulo,si:d.si,no:d.no,orden:!!d.orden,menor:d.menor,justo:d.justo,lado:d.lado,
  vals:d.orden?d.valores.slice(0,n):shuffle(d.valores.slice()).slice(0,n)}));}
const LG=[{n:3,k:1,ord:0,mix:"easy"},{n:3,k:2,ord:0,mix:"easy"},{n:4,k:2,ord:0,mix:"mid"},{n:4,k:3,ord:0,mix:"mid"},
  {n:4,k:3,ord:1,mix:"hard"},{n:5,k:3,ord:1,mix:"hard"},{n:5,k:3,ord:1,mix:"expert"}];
function logicPuzzle(n,defs,mixName,lang){
  const L=DATA.logica[lang],cats=lgCats(defs,n),k=cats.length,ord=cats.findIndex(c=>c.orden);
  const names=shuffle(L.nombres.slice()).slice(0,n);
  for(let att=0;att<8;att++){
    const sol=cats.map(()=>shuffle(range(n)));
    const clues=lgClues(n,k,sol,ord,mixName);if(!clues)continue;
    const ctx={names,cats,L};
    return {names,cats:cats.map(c=>({titulo:c.titulo,labels:c.vals.map(v=>v[0]),orden:c.orden,vals:c.vals})),sol,ord,clues:shuffle(clues).map(cl=>lgText(cl,ctx)),ctx};
  }
  return null;
}
function logic(Lv,lang){
  const P=LG[Lv],D=DATA.logica[lang];
  const plain=shuffle(D.categorias.filter(c=>!c.orden)).slice(0,P.k-P.ord),ordC=D.categorias.filter(c=>c.orden);
  const defs=shuffle(plain.concat(P.ord?[pick(ordC)]:[]));
  const z=logicPuzzle(P.n,defs,P.mix,lang);if(!z)return null;
  return {game:"logic",lang,n:P.n,names:z.names,cats:z.cats.map(c=>({titulo:c.titulo,labels:c.labels,orden:c.orden})),sol:z.sol,
    persona:D.persona,intro:pick(D.intro).replace("{n}",String(P.n)),clues:z.clues};
}
const MY=[{n:3,k:2,mix:"easy",noOrd:1},{n:3,k:3,mix:"easy",noOrd:1},{n:4,k:2,mix:"mid",noOrd:1},{n:4,k:3,mix:"mid"},
  {n:4,k:3,mix:"hard"},{n:5,k:3,mix:"hard"},{n:5,k:3,mix:"expert"}];
function mystery(Lv,lang){
  const P=MY[Lv],D=DATA.misterios[lang],L=DATA.logica[lang];
  const th=fresh(D,m=>"m:"+m.titulo)[0];
  let defs=th.categorias.slice();
  if(P.noOrd&&defs.some(c=>!c.orden)){const plainDefs=defs.filter(c=>!c.orden);defs=plainDefs.length>=P.k?plainDefs:defs;}
  defs=shuffle(defs).slice(0,P.k);
  if(P.noOrd&&defs.length<P.k)return null;
  const z=logicPuzzle(P.n,defs,P.mix,lang);if(!z)return null;
  /* the culprit is pointed to by one of their attributes, so the grid must be solved first */
  const culprit=R(P.n),evCats=range(z.cats.length).filter(c=>!z.cats[c].orden),ec=pick(evCats.length?evCats:range(z.cats.length));
  const ev=th.evidencia.replace("{si}",z.cats[ec].vals.length?defs[ec].si.replace("{v}",z.cats[ec].vals[z.sol[ec][culprit]][1]):"");
  use("m:"+th.titulo);
  return {game:"mystery",lang,n:P.n,names:z.names,cats:z.cats.map(c=>({titulo:c.titulo,labels:c.labels,orden:c.orden})),sol:z.sol,
    persona:L.persona,titulo:th.titulo,intro:th.intro,pregunta:th.pregunta,evidencia:ev,clues:z.clues,culprit};
}

const GEN={sudoku,maze,wordsearch,crossword,crossnum,cipher,escape,logic,mystery};
return {generate(game,level,lang,avoid){
  AV=new Set(avoid||[]);USED=[];
  const z=GEN[game](level,lang);
  if(z)z.used=USED.slice();
  return z;
}};
}

if(typeof window==="undefined"&&typeof self!=="undefined"){
  /* running as a Web Worker: the page sends the content first, then one request per puzzle */
  let motor=null;
  self.onmessage=e=>{const d=e.data;
    if(d.init){motor=crearMotor(d.init);self.postMessage({ready:true});return;}
    let z=null,err=null;try{z=motor.generate(d.game,d.level,d.lang,d.avoid);}catch(x){err=String(x&&x.stack||x);}
    self.postMessage({tok:d.tok,i:d.i,z,err});};
}else if(typeof window!=="undefined")window.crearMotor=crearMotor;
