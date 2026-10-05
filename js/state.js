/* Elemen halaman, status game, dan data harian/progres */
const $=s=>document.querySelector(s);
const boardEl=$('#board'),trayEl=$('#tray'),endEl=$('#end'),toastEl=$('#toast');
const cells=[];
for(let i=0;i<64;i++){const d=document.createElement('div');d.className='cell';boardEl.appendChild(d);cells.push(d)}
let grid,pieces,score,streak,over,busy,best=0,drag=null;
let mode='classic',lvl=0,linesCleared=0,movesLeft=0,dealIdx=0,seed=0,R=Math.random,targets={},pw={bomb:1,shuffle:1,undo:1},meter=0,awardIdx=0,snap=null,bombOn=false,lastRes=null,tutI=0,pend=null,timeLeft=0,lastT=0,ice={},moves=0,playSecs=0;
best=Math.min(1e7,Math.max(0,+secGet('blox-best',0)||0));
let bestT=Math.min(1e7,Math.max(0,+secGet('blox-bt',0)||0));

const SAVE='blox-save';
const dayKey=d=>d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
let dly={key:0,best:0,streak:0,last:0,hist:{},done:{}},prog={unlocked:1,stars:{}};
dly=cleanDly(secGet('blox-daily',{}));prog=cleanProg(secGet('blox-prog',{}));
let ach=cleanAch(secGet('blox-ach',{})),mis=cleanMis(secGet('blox-mis',{}));
function saveDaily(){secSet('blox-daily',dly)}
function saveProg(){secSet('blox-prog',prog)}
function touchDaily(){
  const k=dayKey(new Date());
  if(dly.key!==k){
    const y=dayKey(new Date(Date.now()-864e5));
    dly.streak=dly.last===y?dly.streak+1:1;dly.last=k;dly.key=k;dly.best=0;dly.hist[k]=0;
    const ks=Object.keys(dly.hist).sort();while(ks.length>30)delete dly.hist[ks.shift()];
    saveDaily();
  }
}
