/* Layar: beranda, level, tantangan harian */
const ICON_ON='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 010 7"/><path d="M19 6a8.5 8.5 0 010 12"/></svg>',ICON_OFF='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M17 9l5 6"/><path d="M22 9l-5 6"/></svg>';
function starsHTML(n,sz){
  let h='<span class="stars">';
  for(let i=0;i<3;i++)h+='<svg viewBox="0 0 24 24" width="'+sz+'" height="'+sz+'" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z" fill="'+(i<n?'#ffd43b':'none')+'" stroke="'+(i<n?'#e6b800':'currentColor')+'" stroke-width="1.6" stroke-linejoin="round" opacity="'+(i<n?1:.35)+'"/></svg>';
  return h+'</span>';
}
const $$=q=>document.querySelectorAll(q);
function hideAll(){$$('.screen').forEach(e=>{e.hidden=true})}
function show(id){hideAll();$(id).hidden=false}
const resumable=()=>!over&&(score>0||pieces.some(x=>!x)||dealIdx>1);
const streakNow=()=>dly.last>=dayKey(new Date(Date.now()-864e5))?dly.streak:0;
const modeName=m=>m==='level'?t('mode_level')+' '+(lvl+1):m==='daily'?t('mode_r_daily'):m==='timed'?t('mode_r_timed'):t('mode_classic');
function showHome(){
  const st=Object.values(prog.stars).reduce((a,b)=>a+b,0);
  $('#homeInfo').textContent=t('home_info',{best,st,max:LEVELS.length*3,streak:streakNow()})+(tampered?'. '+t('tampered'):'');
  $('#homeAcc').textContent=accName()?t('home_acc_in',{name:accName()}):t('home_acc_out');
  show('#home');
}
function showStart(){
  const c=$('#hCont');c.hidden=!resumable();
  c.textContent=t('start_resume',{mode:modeName(mode)});
  show('#startScreen');
}
function showLevels(){
  const box=$('#lvls');box.innerHTML='';
  const total=Object.values(prog.stars).reduce((a,b)=>a+b,0);
  $('#lvInfo').textContent=t('lv_info',{total,max:LEVELS.length*3});
  LEVELS.forEach((L,i)=>{
    const b=document.createElement('button');b.className='lv';b.disabled=i>=prog.unlocked;
    const st=prog.stars[i]||0,nm=t('lv_card',{n:i+1});
    b.innerHTML=i>=prog.unlocked?nm+'<small>'+t('lv_locked')+'</small>':nm+'<span class="st">'+starsHTML(st,16)+'</span><small>'+lvDesc(L)+'</small>';
    b.onclick=()=>startMode('level',i);box.appendChild(b);
  });
  show('#lvlScreen');
}
function showDaily(){
  const now=new Date(),k=dayKey(now),played=dly.key===k;
  $('#dDate').textContent=now.toLocaleDateString(dateLoc(),{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  $('#dStreak').textContent=streakNow();
  $('#dBest').textContent=played?dly.best:0;
  const w=$('#week');w.innerHTML='';
  for(let i=6;i>=0;i--){
    const d=new Date(now.getTime()-i*864e5),sc=dly.hist[dayKey(d)];
    const e=document.createElement('div');
    if(sc!==undefined)e.classList.add('on');
    if(i===0)e.classList.add('today');
    const dn=dly.done[dayKey(d)];
    e.innerHTML=d.toLocaleDateString(dateLoc(),{weekday:'short'})+'<b>'+d.getDate()+'</b>'+(dn?CHECK:(sc!==undefined?sc:'-'));
    w.appendChild(e);
  }
  $('#dStart').textContent=t((dly.done[k]||(played&&dly.best>0))?'day_again':'day_start');
  show('#dayScreen');
}
