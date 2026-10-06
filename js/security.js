/* Keamanan data tersimpan: tanda tangan, validasi, dan pembersihan data */
/* ---- Keamanan data tersimpan: tanda tangan + validasi ---- */
const SALT='bbm-7f3a91c2';
function h53(str){let h1=0xdeadbeef,h2=0x41c6ce57;for(let i=0;i<str.length;i++){const c=str.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677)}h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return(4294967296*(2097151&h2)+(h1>>>0)).toString(36)}
let tampered=false,migrate=false;
try{migrate=localStorage.getItem('blox-sec')!=='1'}catch(e){}
function secSet(k,v){try{const d=JSON.stringify(v);localStorage.setItem(k,JSON.stringify({d,s:h53(SALT+k+d)}));if(typeof syncSoon==='function'&&SYNC_KEYS.includes(k))syncSoon()}catch(e){}}
function secGet(k,def){
  let raw=null;
  try{raw=localStorage.getItem(k)}catch(e){return def}
  if(raw===null)return def;
  try{
    const o=JSON.parse(raw);
    if(o&&typeof o.d==='string'&&typeof o.s==='string'){
      if(o.s===h53(SALT+k+o.d))return JSON.parse(o.d);
      tampered=true;return def;
    }
    if(migrate)return o;
    tampered=true;return def;
  }catch(e){tampered=true;return def}
}
const numIn=(x,a,b)=>Number.isFinite(x)&&x>=a&&x<=b;
const SHAPE_KEYS=SHAPES.map(x=>JSON.stringify(x));
function sane(d){
  if(!d||typeof d!=='object'||!Array.isArray(d.grid)||d.grid.length!==64)return false;
  if(!d.grid.every(v=>Number.isInteger(v)&&v>=0&&v<=COLORS.length))return false;
  if(!Array.isArray(d.pieces)||d.pieces.length!==3)return false;
  if(!d.pieces.every(p=>p===null||(p&&SHAPE_KEYS.includes(JSON.stringify(p.s))&&Number.isInteger(p.c)&&p.c>=1&&p.c<=COLORS.length)))return false;
  if(!['classic','daily','level','timed'].includes(d.mode||'classic'))return false;
  if(!numIn(d.score,0,1e7)||!numIn(d.streak,0,1e4)||!numIn(d.linesCleared||0,0,1e4)||!numIn(d.movesLeft||0,0,500)||!numIn(d.dealIdx||0,0,1e5)||!numIn(d.meter||0,0,9)||!numIn(d.timeLeft||0,0,400)||!numIn(d.moves||0,0,5000)||!numIn(d.playSecs||0,0,1e5))return false;
  if(d.mode==='level'&&(!LEVELS[d.lvl]||d.movesLeft>LEVELS[d.lvl].m))return false;
  if(d.pw&&!['bomb','shuffle','undo'].every(k=>numIn(d.pw[k],0,99)))return false;
  if(d.targets&&!Object.entries(d.targets).every(([k,v])=>numIn(+k,0,63)&&[0,1,2].includes(v)))return false;
  if(d.ice&&!Object.entries(d.ice).every(([k,v])=>numIn(+k,0,63)&&[1,2].includes(v)))return false;
  return true;
}
function cleanProg(p){
  const o={unlocked:1,stars:{}};
  if(p&&Number.isInteger(p.unlocked))o.unlocked=Math.min(LEVELS.length,Math.max(1,p.unlocked));
  if(p&&p.stars&&typeof p.stars==='object')Object.entries(p.stars).forEach(([k,v])=>{if(+k>=0&&+k<LEVELS.length&&[1,2,3].includes(v))o.stars[k]=v});
  return o;
}
function cleanDly(o){
  const d={key:0,best:0,streak:0,last:0,hist:{},done:{}},n=(x,m)=>numIn(x,0,m)?x:0;
  if(!o||typeof o!=='object')return d;
  d.key=n(o.key,99991231);d.best=n(o.best,1e7);d.streak=n(o.streak,9999);d.last=n(o.last,99991231);
  if(o.hist&&typeof o.hist==='object')Object.entries(o.hist).slice(-40).forEach(([k,v])=>{if(/^\d{8}$/.test(k))d.hist[k]=n(v,1e7)});
  if(o.done&&typeof o.done==='object')Object.keys(o.done).slice(-40).forEach(k=>{if(/^\d{8}$/.test(k))d.done[k]=true});
  return d;
}
const MT_KEYS=['lines','combo','multi','pu','score','level','daily'],PU3=['bomb','shuffle','undo'];
function cleanAch(o){
  const a={un:{},stats:{lines:0,combo:0,multi:0,clean:0,best:0,pu:{}},bonus:{bomb:0,shuffle:0,undo:0}};
  if(!o||typeof o!=='object')return a;
  if(o.un&&typeof o.un==='object')Object.keys(o.un).slice(0,50).forEach(k=>{if(/^[a-z0-9]{1,12}$/.test(k))a.un[k]=1});
  const s=o.stats||{};
  ['lines','combo','multi','clean','best'].forEach(k=>{a.stats[k]=numIn(s[k],0,1e7)?s[k]:0});
  PU3.forEach(k=>{a.stats.pu[k]=numIn((s.pu||{})[k],0,1e6)?s.pu[k]:0;a.bonus[k]=numIn((o.bonus||{})[k],0,5)?o.bonus[k]:0});
  return a;
}
function cleanMis(o){
  const m={key:0,list:[]};
  if(!o||!numIn(o.key,0,99991231)||!Array.isArray(o.list))return m;
  m.key=o.key;
  o.list.slice(0,3).forEach(x=>{if(x&&MT_KEYS.includes(x.t)&&numIn(x.g,1,9999)&&numIn(x.p,0,9999)&&PU3.includes(x.r))m.list.push({t:x.t,g:x.g,p:x.p,r:x.r,done:!!x.done})});
  return m;
}
