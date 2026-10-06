/* Mode permainan: awal game, level, harian, waktu, hasil akhir */
function finish(title,msg,next){
  over=true;busy=false;
  $('#shareMsg').textContent='';$('#etitle').textContent=title;$('#final').textContent=msg;$('#estars').innerHTML='';
  $('#next').hidden=!next;$('#again').textContent=t(mode==='level'?'end_retry':'end_again');
  endEl.hidden=false;
  if(next)sfx.clear(3);else sfx.over();
  pend=(score>0&&(mode==='timed'||(mode==='daily'&&lastRes&&lastRes.win)))?{mode:mode==='timed'?'timed':'daily',day:isoDay(),score,moves,lines:linesCleared,secs:Math.round(playSecs)}:null;
  $('#toLb').hidden=!(pend&&onlineOK());
  if(pend)submitPend();
  save();
}
function win(){
  const L=LEVELS[lvl],r=movesLeft/L.m,st=r>=.4?3:r>=.15?2:1,last=lvl+1>=LEVELS.length;
  prog.stars[lvl]=Math.max(prog.stars[lvl]||0,st);
  prog.unlocked=Math.max(prog.unlocked,Math.min(LEVELS.length,lvl+2));saveProg();
  lastRes={win:true,st};ev('level',1);
  finish(t('lv_win'),t('score_line',{n:score})+(last?'\n'+t('all_done'):''),!last);
  $('#estars').innerHTML=starsHTML(st,30);
}
/* ---- Mode waktu ---- */
function tickTimer(){
  const now=Date.now(),dt=(now-lastT)/1000;lastT=now;
  const lv=mode==='level'&&LEVELS[lvl]&&LEVELS[lvl].t;
  if(over||document.hidden||dt>1||[...$$('.screen')].some(e=>!e.hidden)||!$('#lock').hidden)return;
  playSecs+=dt;
  if(mode!=='timed'&&!lv)return;
  timeLeft-=dt;
  if(timeLeft<=0){
    timeLeft=0;updateGoal();lastRes={win:false,timeUp:true};
    if(mode==='level')finish(t('lv_fail'),t('fail_time'),false);
    else finish(t('time_up'),t('your_score',{n:score}),false);
    return;
  }
  updateGoal();
}
function winDaily(){
  dly.done[dly.key]=true;saveDaily();
  lastRes={win:true};ev('daily',1);
  finish(t('daily_win'),t('score_line',{n:score})+'\n'+t('daily_best_line',{n:dly.best}),false);
  $('#estars').innerHTML='<svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10.5" fill="#51cf66"/><path d="M6.5 12.5l4 4 7-8" stroke="#fff" stroke-width="2.6"/></svg>';
}
function pickTargets(rng,n){
  const f=[];grid.forEach((v,i)=>{if(v)f.push(i)});
  for(let k=0;k<n&&f.length;k++){const j=Math.floor(rng()*f.length);targets[f.splice(j,1)[0]]=k%3}
}
function pickIce(rng,n){
  const f=[];grid.forEach((v,i)=>{if(v&&targets[i]===undefined)f.push(i)});
  for(let k=0;k<n&&f.length;k++){const j=Math.floor(rng()*f.length);ice[f.splice(j,1)[0]]=2}
}
function levelDone(){
  const L=LEVELS[lvl];
  return (!L.l||linesCleared>=L.l)&&(!L.gems||!Object.keys(targets).length)&&(!L.ice||!Object.keys(ice).length);
}
function lvDesc(L){
  const p=[];if(L.l)p.push(t('d_lines',{n:L.l}));if(L.gems)p.push(t('d_gems',{n:L.gems}));if(L.ice)p.push(t('d_ice',{n:L.ice}));
  return p.join(', ')+' / '+t('d_blocks',{n:L.m})+(L.t?' / '+t('d_sec',{n:L.t}):'');
}
function after(){
  renderBoard();updateScore();updateGoal();updatePw();checkAch();saveMeta();
  if(mode==='daily'&&!Object.keys(targets).length)return winDaily();
  if(mode==='level'){
    if(levelDone())return win();
    if(movesLeft<=0)return finish(t('lv_fail'),t('fail_moves'),false);
  }
  if(pieces.every(x=>!x))deal();
  renderTray();
  if(!pieces.some(p=>p&&canPlaceAny(p))){
    return finish(mode==='level'?t('lv_fail'):t('end_title'),mode==='daily'?t('score_line',{n:score})+'\n'+t('daily_best_line',{n:dly.best}):t('your_score',{n:score}),false);
  }
  save();
}
function prefill(n,rng){
  const rc=Array(N).fill(0),cc=Array(N).fill(0);let t=0;
  while(n>0&&t++<400){
    const i=Math.floor(rng()*64),r=(i/N)|0,c=i%N;
    if(grid[i]||rc[r]>=5||cc[c]>=5)continue;
    grid[i]=1+Math.floor(rng()*COLORS.length);rc[r]++;cc[c]++;n--;
  }
}
function startMode(m,l){
  resetPw();lastRes=null;mode=m;lvl=l||0;linesCleared=0;dealIdx=0;streak=0;score=0;over=false;busy=false;movesLeft=0;
  grid=Array(64).fill(0);targets={};ice={};moves=0;playSecs=0;
  if(m==='classic'){seed=0;R=Math.random}
  else if(m==='daily'){touchDaily();seed=dly.key;prefill(10,mulberry(seed+999));pickTargets(mulberry(seed+555),5)}
  else if(m==='timed'){seed=dayKey(new Date())+31337;timeLeft=T0;lastT=Date.now()}
  else{const L=LEVELS[lvl];seed=1000+lvl;movesLeft=L.m;prefill(L.p,mulberry(seed+999));if(L.gems)pickTargets(mulberry(seed+555),L.gems);if(L.ice)pickIce(mulberry(seed+333),L.ice);if(L.t){timeLeft=L.t;lastT=Date.now()}}
  PU3.forEach(k=>{pw[k]+=ach.bonus[k];ach.bonus[k]=0});saveMeta();
  deal();renderBoard();renderTray();updateScore();updateGoal();updatePw();
  endEl.hidden=true;hideAll();save();
}
function reset(){startMode(mode,lvl)}
