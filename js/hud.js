/* Skor, penunjuk target, dan notifikasi */
function updateScore(){
  let v,l='Terbaik';
  ev('score',score);
  $('#score').textContent=score;
  if(mode==='classic'){if(score>best){best=score;secSet('blox-best',best)}v=best}
  else if(mode==='daily'){if(score>dly.best){dly.best=score;dly.hist[dly.key]=score;saveDaily()}v=dly.best;l='Rekor hari ini'}
  else if(mode==='timed'){if(score>bestT){bestT=score;secSet('blox-bt',bestT)}v=bestT;l='Terbaik waktu'}
  else{v=lvl+1;l='Level'}
  $('#best').textContent=v;$('#blab').textContent=l;
}
function updateGoal(){
  let t,f=0,ico='';
  if(mode==='classic')t='Klasik: main sampai papan penuh';
  else if(mode==='daily'){
    const left=Object.values(targets);
    t='Hapus semua kotak bergambar: '+(5-left.length)+'/5';f=(5-left.length)/5;
    ico=left.map(k=>'<span class="gi">'+tiSvg(k)+'</span>').join('');
  }
  else if(mode==='timed'){const t0=Math.ceil(timeLeft);t='Waktu '+Math.floor(t0/60)+':'+String(t0%60).padStart(2,'0')+'. Hapus garis untuk +3 detik';f=Math.max(0,Math.min(1,timeLeft/TMAX))}
  else{
    const L=LEVELS[lvl],parts=[],fr=[];
    if(L.l){parts.push('garis '+Math.min(linesCleared,L.l)+'/'+L.l);fr.push(Math.min(1,linesCleared/L.l))}
    if(L.gems){const left=Object.keys(targets).length;parts.push('gambar '+(L.gems-left)+'/'+L.gems);fr.push((L.gems-left)/L.gems);ico=Object.values(targets).map(k=>'<span class="gi">'+tiSvg(k)+'</span>').join('')}
    if(L.ice){const left=Object.keys(ice).length,rem=Object.values(ice).reduce((a,b)=>a+b,0);parts.push('es '+(L.ice-left)+'/'+L.ice);fr.push((2*L.ice-rem)/(2*L.ice))}
    t='Level '+(lvl+1)+': '+parts.join(', ')+'. Sisa '+movesLeft+' blok';
    if(L.t){const t0=Math.ceil(timeLeft);t+=', waktu '+Math.floor(t0/60)+':'+String(t0%60).padStart(2,'0')}
    f=fr.length?fr.reduce((a,b)=>a+b,0)/fr.length:0;
  }
  $('#gtxt').textContent=t;$('#gico').innerHTML=ico;$('#gfill').style.width=(f*100)+'%';
}
function toast(t){toastEl.textContent=t;toastEl.classList.remove('show');void toastEl.offsetWidth;toastEl.classList.add('show')}

