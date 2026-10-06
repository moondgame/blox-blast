/* Skor, penunjuk target, dan notifikasi */
function updateScore(){
  let v,l=t('hud_best');
  ev('score',score);
  $('#score').textContent=score;
  if(mode==='classic'){if(score>best){best=score;secSet('blox-best',best)}v=best}
  else if(mode==='daily'){if(score>dly.best){dly.best=score;dly.hist[dly.key]=score;saveDaily()}v=dly.best;l=t('hud_daybest')}
  else if(mode==='timed'){if(score>bestT){bestT=score;secSet('blox-bt',bestT)}v=bestT;l=t('hud_timedbest')}
  else{v=lvl+1;l=t('hud_level')}
  $('#best').textContent=v;$('#blab').textContent=l;
}
function updateGoal(){
  let tx,f=0,ico='';
  if(mode==='classic')tx=t('hud_classic');
  else if(mode==='daily'){
    const left=Object.values(targets);
    tx=t('hud_daily',{n:5-left.length});f=(5-left.length)/5;
    ico=left.map(k=>'<span class="gi">'+tiSvg(k)+'</span>').join('');
  }
  else if(mode==='timed'){const t0=Math.ceil(timeLeft);tx=t('hud_timed',{time:Math.floor(t0/60)+':'+String(t0%60).padStart(2,'0')});f=Math.max(0,Math.min(1,timeLeft/TMAX))}
  else{
    const L=LEVELS[lvl],parts=[],fr=[];
    if(L.l){parts.push(t('hud_lines',{a:Math.min(linesCleared,L.l),b:L.l}));fr.push(Math.min(1,linesCleared/L.l))}
    if(L.gems){const left=Object.keys(targets).length;parts.push(t('hud_gems',{a:L.gems-left,b:L.gems}));fr.push((L.gems-left)/L.gems);ico=Object.values(targets).map(k=>'<span class="gi">'+tiSvg(k)+'</span>').join('')}
    if(L.ice){const left=Object.keys(ice).length,rem=Object.values(ice).reduce((a,b)=>a+b,0);parts.push(t('hud_ice',{a:L.ice-left,b:L.ice}));fr.push((2*L.ice-rem)/(2*L.ice))}
    tx=t('hud_level_line',{n:lvl+1,parts:parts.join(', '),left:movesLeft});
    if(L.t){const t0=Math.ceil(timeLeft);tx+=t('hud_time_suffix',{time:Math.floor(t0/60)+':'+String(t0%60).padStart(2,'0')})}
    f=fr.length?fr.reduce((a,b)=>a+b,0)/fr.length:0;
  }
  $('#gtxt').textContent=tx;$('#gico').innerHTML=ico;$('#gfill').style.width=(f*100)+'%';
}
function toast(t){toastEl.textContent=t;toastEl.classList.remove('show');void toastEl.offsetWidth;toastEl.classList.add('show')}

