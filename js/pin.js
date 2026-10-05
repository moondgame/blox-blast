/* Kunci PIN 4 angka: mencegah orang lain membuka game dengan santai. Bukan enkripsi. */
let pinCfg=secGet('blox-pin',null),pinMode='unlock',pinBuf='',pinTmp='',pinFail=0,pinUntil=0,lockPending=false,forgotArm=false;
const pinOn=()=>!!(pinCfg&&typeof pinCfg.h==='string'&&typeof pinCfg.salt==='string');
const pinHash=(pin,salt)=>h53(SALT+'pin'+salt+pin);
const PINBK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 5H9l-6 7 6 7h12z"/><path d="M13 9l4 6M17 9l-4 6"/></svg>';
function lockText(t,d){$('#lockT').textContent=t;$('#lockD').textContent=d||''}
function lockDots(){$$('#lockDots i').forEach((e,i)=>e.classList.toggle('on',i<pinBuf.length))}
function showLock(m){
  pinMode=m;pinBuf='';pinTmp='';forgotArm=false;
  lockText(m==='unlock'?'Masukkan PIN':m==='set1'?'Buat PIN baru':'Masukkan PIN untuk mematikan',m==='unlock'?'Game terkunci.':'4 angka.');
  $('#lockCancel').hidden=m==='unlock';
  $('#lockForgot').hidden=m!=='unlock';
  $('#lockForgot').textContent='Lupa PIN? Hapus data game';
  lockDots();$('#lock').hidden=false;
}
function pinKey(k){
  if(k==='del'){pinBuf=pinBuf.slice(0,-1);lockDots();return}
  if(pinBuf.length>=4)return;
  pinBuf+=k;lockDots();
  if(pinBuf.length===4)setTimeout(pinDone,120);
}
function pinDone(){
  const pin=pinBuf;pinBuf='';lockDots();
  if(pinMode==='set1'){pinTmp=pin;pinMode='set2';lockText('Ulangi PIN','Masukkan PIN yang sama.');return}
  if(pinMode==='set2'){
    if(pin!==pinTmp){pinMode='set1';pinTmp='';lockText('Buat PIN baru','PIN tidak sama. Coba lagi.');return}
    const salt=Math.random().toString(36).slice(2,10);
    pinCfg={salt,h:pinHash(pin,salt)};secSet('blox-pin',pinCfg);
    $('#lock').hidden=true;if(!$('#setScreen').hidden)showSettings();return;
  }
  const now=Date.now();
  if(now<pinUntil){lockText('PIN ditolak','Terlalu banyak salah. Tunggu '+Math.ceil((pinUntil-now)/1000)+' detik.');return}
  if(pinCfg&&pinHash(pin,pinCfg.salt)===pinCfg.h){
    pinFail=0;lockPending=false;
    if(pinMode==='off'){pinCfg=null;try{localStorage.removeItem('blox-pin')}catch(e){}}
    $('#lock').hidden=true;if(!$('#setScreen').hidden)showSettings();return;
  }
  pinFail++;
  if(pinFail>=5){pinFail=0;pinUntil=now+30000;lockText('PIN salah','Terlalu banyak salah. Tunggu 30 detik.')}
  else lockText('PIN salah','Coba lagi ('+pinFail+'/5).');
}
function initLock(){
  const k=$('#lockKeys');k.innerHTML='';
  ['1','2','3','4','5','6','7','8','9','','0','del'].forEach(v=>{
    const b=document.createElement('button');
    if(v===''){b.className='kx';b.disabled=true;b.setAttribute('aria-hidden','true')}
    else{
      b.className='alt kk';b.setAttribute('aria-label',v==='del'?'Hapus':v);
      if(v==='del')b.innerHTML=PINBK;else b.textContent=v;
      b.onclick=()=>pinKey(v);
    }
    k.appendChild(b);
  });
  $('#lockCancel').onclick=()=>{$('#lock').hidden=true};
  $('#lockForgot').onclick=()=>{
    const f=$('#lockForgot');
    if(!forgotArm){forgotArm=true;f.textContent='Tekan lagi untuk menghapus semua data game';return}
    try{Object.keys(localStorage).filter(x=>x.startsWith('blox-')).forEach(x=>localStorage.removeItem(x))}catch(e){}
    location.reload();
  };
  $('#sPin').onclick=()=>showLock(pinOn()?'off':'set1');
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){if(pinOn())lockPending=true}
    else if(lockPending&&pinOn())showLock('unlock');
  });
  if(pinOn())showLock('unlock');
}
