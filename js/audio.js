/* Efek suara, getar, dan musik latar */
let muted=false,ac=null,musicOn=true;
try{muted=localStorage.getItem('blox-mute')==='1';musicOn=localStorage.getItem('blox-music')!=='0'}catch(e){}
function tone(f,d,t='sine',v=.08,at=0){
  if(muted)return;
  try{
    ac=ac||new (window.AudioContext||window.webkitAudioContext)();
    if(ac.state==='suspended')ac.resume();
    const o=ac.createOscillator(),g=ac.createGain(),st=ac.currentTime+at;
    o.type=t;o.frequency.value=f;
    g.gain.setValueAtTime(v,st);g.gain.exponentialRampToValueAtTime(.0001,st+d);
    o.connect(g);g.connect(ac.destination);o.start(st);o.stop(st+d);
  }catch(e){}
}
const vib=p=>{try{if(!muted&&navigator.vibrate)navigator.vibrate(p)}catch(e){}};
const sfx={
  place(){tone(300,.1,'triangle');vib(10)},
  clear(n){for(let i=0;i<Math.min(n+2,5);i++)tone(440*Math.pow(1.25,i),.18,'sine',.09,i*.07);vib([20,30,20])},
  bomb(){tone(110,.28,'sawtooth',.1);tone(55,.35,'square',.07,.04);vib(60)},
  gift(){[660,880,1100].forEach((f,i)=>tone(f,.15,'sine',.08,i*.08));vib([15,25,15])},
  shuf(){tone(520,.07,'triangle');tone(700,.07,'triangle',.07,.08)},
  undo(){tone(380,.12,'triangle')},
  over(){[330,260,200].forEach((f,i)=>tone(f,.3,'sawtooth',.06,i*.18));vib(200)}
};
let mtimer=null,mstep=0;
const MSC=[261.63,293.66,329.63,392,440,523.25,587.33,659.25],MEL=[0,2,4,2,5,4,2,1,0,2,4,5,7,5,4,2],MBS=[0,3,4,3];
function musicTick(){
  if(muted||!musicOn||document.hidden)return;
  const i=mstep++%16;
  tone(MSC[MEL[i]],.55,'sine',.03);
  if(i%4===0)tone(MSC[MBS[i/4]]/2,1.5,'triangle',.045);
}
function startMusic(){if(!mtimer)mtimer=setInterval(musicTick,430)}
function setMusic(on){musicOn=on;try{localStorage.setItem('blox-music',on?'1':'0')}catch(e){}if(on)startMusic()}
