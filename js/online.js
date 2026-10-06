/* Papan peringkat online (Supabase): memuat daftar, mengirim skor, melaporkan */
const onlineOK=()=>!!(ONLINE.url&&ONLINE.key);
const isoDay=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const setMsg=m=>{$('#shareMsg').textContent=m;$('#lbMsg').textContent=m};
const errMsg=e=>e&&e.name==='AbortError'?t('err_slow'):(e&&e.message)||String(e);
/* Daftar kata terlarang sederhana untuk nama pemain (juga diperiksa di server). Tambahkan sesuai kebutuhan. */
const BADWORDS=/(kontol|memek|ngentot|jembut|pepek|bangsat|bajingan|anjing|jancok|jancuk|fuck|shit|bitch|cunt|nigg|porn)/i;
/* Panggilan ke Supabase. Memakai token akun jika sudah masuk; noAuth=true memaksa tanpa token. */
async function sb(path,opt,noAuth){
  const c=new AbortController(),tm=setTimeout(()=>c.abort(),8000);
  const h={apikey:ONLINE.key,'Content-Type':'application/json'};
  const tok=(!noAuth&&typeof getToken==='function')?await getToken():null;
  if(tok)h.Authorization='Bearer '+tok;
  else if(ONLINE.key.startsWith('eyJ'))h.Authorization='Bearer '+ONLINE.key;
  try{
    const r=await fetch(ONLINE.url.replace(/\/$/,'')+path,Object.assign({signal:c.signal,headers:h},opt));
    const txt=await r.text();
    if(!r.ok){
      let m=txt;try{const j=JSON.parse(txt);m=j.message||j.msg||j.error_description||txt}catch(e){}
      throw new Error(String(m||('HTTP '+r.status)).slice(0,160));
    }
    return txt?JSON.parse(txt):null;
  }finally{clearTimeout(tm)}
}
async function submitPend(){
  if(!pend||!onlineOK())return;
  if(!session){setMsg(t('lb_need_login'));return}
  if(profile&&profile.banned){setMsg(t('lb_banned'));return}
  const p=pend;
  try{
    await sb('/rest/v1/rpc/submit_score',{method:'POST',body:JSON.stringify({p_mode:p.mode,p_day:p.day,p_score:p.score,p_moves:p.moves,p_lines:p.lines,p_secs:p.secs})});
    if(pend===p)pend=null;
    $('#toLb').hidden=false;
    setMsg(t('lb_sent'));
  }catch(e){setMsg(t('lb_send_fail',{e:errMsg(e)}))}
}
let lbTab='';
async function loadLb(tab){
  const L=$('#lbList'),info=$('#lbInfo');L.innerHTML='';
  if(!onlineOK()){info.textContent=t('lb_off');return}
  info.textContent=t('lb_loading');
  const path=tab==='timedall'?'/rest/v1/leaderboard_best?select=id,name,score&mode=eq.timed&order=score.desc&limit=20'
    :'/rest/v1/leaderboard?select=id,name,score&mode=eq.'+(tab==='daily'?'daily':'timed')+'&day=eq.'+isoDay()+'&order=score.desc&limit=20';
  try{
    const rows=await sb(path,{method:'GET'});
    if(tab!==lbTab)return;
    info.textContent=t(tab==='daily'?'lb_h_daily':tab==='timed'?'lb_h_timed':'lb_h_all');
    if(!rows||!rows.length){info.textContent+=t('lb_empty');return}
    const me=accName();
    rows.forEach((r,i)=>{
      const d=document.createElement('div'),a=document.createElement('span'),b=document.createElement('b');
      const mine=me&&r.name===me,right=document.createElement('span');
      d.className='lbr'+(mine?' me':'');
      a.textContent=(i+1)+'. '+r.name;b.textContent=r.score;
      right.className='lbs';right.appendChild(b);
      if(session&&!mine&&r.id!==undefined){
        const rp=document.createElement('button');rp.className='rp';rp.textContent=t('lb_report');
        rp.setAttribute('aria-label',t('lb_report')+' '+r.name);rp.onclick=()=>reportRow(r.id,rp);right.appendChild(rp);
      }
      d.appendChild(a);d.appendChild(right);L.appendChild(d);
    });
  }catch(e){info.textContent=t('lb_fail',{e:errMsg(e)})}
}
function showLb(){
  setMsg('');
  lbTab=lbTab||(pend&&pend.mode==='timed'?'timed':'daily');
  $$('#lbScreen .tab').forEach(b=>b.classList.toggle('sel',b.dataset.t===lbTab));
  const nm=accName();
  $('#lbAcc').textContent=nm?t('lb_as',{name:nm}):t('lb_need_login');
  $('#lbLogin').hidden=!!session;
  show('#lbScreen');
  if(pend&&session)submitPend().then(()=>loadLb(lbTab));else loadLb(lbTab);
}
async function reportRow(id,btn){
  if(btn.dataset.arm!=='1'){btn.dataset.arm='1';btn.textContent=t('lb_sure');return}
  try{
    await sb('/rest/v1/rpc/report_score',{method:'POST',body:JSON.stringify({p_score_id:id})});
    btn.textContent=t('lb_reported');btn.disabled=true;setMsg(t('lb_report_ok'));
  }catch(e){btn.dataset.arm='';btn.textContent=t('lb_report');setMsg(t('lb_report_fail',{e:errMsg(e)}))}
}
