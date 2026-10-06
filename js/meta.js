/* Pencapaian dan misi harian */
const ACH=[
{id:'first',get n(){return t('a_first_n')},get d(){return t('a_first_d')},f:()=>ach.stats.lines>=1},
{id:'l50',get n(){return t('a_l50_n')},get d(){return t('a_l50_d')},f:()=>ach.stats.lines>=50},
{id:'l300',get n(){return t('a_l300_n')},get d(){return t('a_l300_d')},f:()=>ach.stats.lines>=300},
{id:'c3',get n(){return t('a_c3_n')},get d(){return t('a_c3_d')},f:()=>ach.stats.combo>=3},
{id:'c6',get n(){return t('a_c6_n')},get d(){return t('a_c6_d')},f:()=>ach.stats.combo>=6},
{id:'m3',get n(){return t('a_m3_n')},get d(){return t('a_m3_d')},f:()=>ach.stats.multi>=3},
{id:'s500',get n(){return t('a_s500_n')},get d(){return t('a_s500_d')},f:()=>ach.stats.best>=500},
{id:'s1500',get n(){return t('a_s1500_n')},get d(){return t('a_s1500_d')},f:()=>ach.stats.best>=1500},
{id:'clean',get n(){return t('a_clean_n')},get d(){return t('a_clean_d')},f:()=>ach.stats.clean>=1},
{id:'pu',get n(){return t('a_pu_n')},get d(){return t('a_pu_d')},f:()=>PU3.every(k=>(ach.stats.pu[k]||0)>0)},
{id:'lv5',get n(){return t('a_lv5_n')},get d(){return t('a_lv5_d')},f:()=>Object.keys(prog.stars).length>=5},
{id:'lv20',get n(){return t('a_lv20_n')},get d(){return t('a_lv20_d')},f:()=>Object.keys(prog.stars).length>=LEVELS.length},
{id:'star',get n(){return t('a_star_n')},get d(){return t('a_star_d')},f:()=>Object.values(prog.stars).includes(3)},
{id:'dd',get n(){return t('a_dd_n')},get d(){return t('a_dd_d')},f:()=>Object.keys(dly.done).length>=1},
{id:'d3',get n(){return t('a_d3_n')},get d(){return t('a_d3_d')},f:()=>streakNow()>=3}];
const MT=[
{t:'lines',tx:g=>t('mis_lines',{g}),mk:r=>[10,15,20][Math.floor(r()*3)]},
{t:'combo',tx:g=>t('mis_combo',{g}),mk:r=>3+Math.floor(r()*2)},
{t:'multi',tx:g=>t('mis_multi',{g}),mk:r=>3+Math.floor(r()*2)},
{t:'pu',tx:g=>t('mis_pu',{g}),mk:r=>2+Math.floor(r()*2)},
{t:'score',tx:g=>t('mis_score',{g}),mk:r=>[400,600,800][Math.floor(r()*3)]},
{t:'level',tx:g=>t('mis_level',{g}),mk:r=>1+Math.floor(r()*2)},
{t:'daily',tx:g=>t('mis_daily',{g}),mk:()=>1}];
const ADD=['lines','pu','level','daily'];
function saveMeta(){secSet('blox-ach',ach);secSet('blox-mis',mis)}
function ensureMis(){
  const k=dayKey(new Date());
  if(mis.key===k&&mis.list.length===3)return;
  const r=mulberry(k+777),idx=MT.map((_,i)=>i);
  for(let i=idx.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[idx[i],idx[j]]=[idx[j],idx[i]]}
  mis={key:k,list:idx.slice(0,3).map(i=>({t:MT[i].t,g:MT[i].mk(r),p:0,r:PU3[Math.floor(r()*3)],done:false}))};
  saveMeta();
}
function ev(ty,n,x){
  ensureMis();
  const st=ach.stats;
  if(ty==='lines')st.lines+=n;
  else if(ty==='combo')st.combo=Math.max(st.combo,n);
  else if(ty==='multi')st.multi=Math.max(st.multi,n);
  else if(ty==='clean')st.clean++;
  else if(ty==='score')st.best=Math.max(st.best,n);
  else if(ty==='pu')st.pu[x]=(st.pu[x]||0)+1;
  mis.list.forEach(m=>{
    if(m.t!==ty||m.done)return;
    m.p=ADD.includes(ty)?m.p+n:Math.max(m.p,n);
    if(m.p>=m.g){
      m.p=m.g;m.done=true;ach.bonus[m.r]=Math.min(5,(ach.bonus[m.r]||0)+1);
      setTimeout(()=>toast(t('mis_done_toast',{name:NAMA[m.r]})),1300);sfx.gift();
    }
  });
}
function checkAch(){
  let d=0;
  ACH.forEach(a=>{
    if(!ach.un[a.id]&&a.f()){ach.un[a.id]=1;d++;setTimeout(()=>toast(t('ach_toast',{name:a.n})),700+d*900);sfx.gift()}
  });
}
const IC_TROPHY='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4z"/><path d="M17 5h3v2a3 3 0 01-3 3M7 5H4v2a3 3 0 003 3"/></svg>';
const IC_LOCK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>';
function showAch(){
  ensureMis();checkAch();
  const mb=$('#missions');mb.innerHTML='';
  mis.list.forEach(m=>{
    const T=MT.find(x=>x.t===m.t),d=document.createElement('div');
    d.className='mis'+(m.done?' done':'');
    d.innerHTML=T.tx(m.g)+'<small>'+(m.done?t('mis_reward_done',{name:NAMA[m.r]}):t('mis_reward',{name:NAMA[m.r],p:m.p,g:m.g}))+'</small><div class="gbar"><div class="gf" style="width:'+Math.round(m.p/m.g*100)+'%"></div></div>';
    mb.appendChild(d);
  });
  const al=$('#achList');al.innerHTML='';
  $('#achH').textContent=t('ach_title',{a:ACH.filter(a=>ach.un[a.id]).length,b:ACH.length});
  ACH.forEach(a=>{
    const u=!!ach.un[a.id],d=document.createElement('div');
    d.className='ac '+(u?'un':'lock');
    d.innerHTML=(u?IC_TROPHY:IC_LOCK)+'<div><b>'+a.n+'</b><small>'+a.d+'</small></div>';
    al.appendChild(d);
  });
  show('#achScreen');
}
