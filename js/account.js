/* Akun (Supabase Auth) dan penyimpanan data pemain di cloud */
const AUTH_KEY='blox-auth',SYNC_KEYS=['blox-best','blox-bt','blox-daily','blox-prog','blox-ach','blox-mis'];
const USERNAME_RE=/^[A-Za-z0-9 _.-]{3,16}$/;
let session=null,profile=null,syncTimer=null,syncing=false,applying=false,refreshing=null,accMode='in',armDel=false,recoveryToken=null;
try{session=JSON.parse(localStorage.getItem(AUTH_KEY)||'null')}catch(e){}
if(session&&!(typeof session.access_token==='string'&&typeof session.refresh_token==='string'&&session.user))session=null;
const accName=()=>profile&&profile.username?profile.username:null;
const aMsg=m=>{$('#accMsg').textContent=m||''};
function saveSession(s){
  session=s;
  try{if(s)localStorage.setItem(AUTH_KEY,JSON.stringify(s));else localStorage.removeItem(AUTH_KEY)}catch(e){}
}
function toSession(r){
  if(!r||!r.access_token)return null;
  return{access_token:r.access_token,refresh_token:r.refresh_token||'',expires_at:r.expires_at||Math.floor(Date.now()/1000)+(r.expires_in||3600),
    user:{id:r.user&&r.user.id,email:r.user&&r.user.email}};
}
function authErr(m){
  const s=String(m||'').toLowerCase();
  if(s.includes('invalid login'))return t('err_login');
  if(s.includes('already registered')||s.includes('already been registered'))return t('err_exists');
  if(s.includes('not confirmed'))return t('err_unconfirmed');
  if(s.includes('banned'))return t('acc_banned');
  if(s.includes('rate limit')||s.includes('too many')||s.includes('over_email'))return t('err_rate');
  if(s.includes('password')&&(s.includes('weak')||s.includes('least')||s.includes('short')))return t('err_weak');
  return String(m).slice(0,160);
}
async function authFetch(path,body,method,token){
  const c=new AbortController(),tm=setTimeout(()=>c.abort(),10000);
  const h={apikey:ONLINE.key,'Content-Type':'application/json'};
  if(token)h.Authorization='Bearer '+token;
  let r,txt;
  try{
    r=await fetch(ONLINE.url.replace(/\/$/,'')+'/auth/v1'+path,{method:method||'POST',headers:h,body:body?JSON.stringify(body):undefined,signal:c.signal});
    txt=await r.text();
  }catch(e){clearTimeout(tm);throw Object.assign(new Error(t('acc_net')),{net:true})}
  clearTimeout(tm);
  let j=null;try{j=txt?JSON.parse(txt):null}catch(e){}
  if(!r.ok)throw new Error(authErr((j&&(j.msg||j.error_description||j.message||j.error))||txt||('HTTP '+r.status)));
  return j;
}
/* Token selalu dicek masa berlakunya; diperbarui otomatis. Gangguan jaringan tidak mengeluarkan akun. */
async function getToken(){
  if(!session)return null;
  if(session.expires_at-60>Date.now()/1000)return session.access_token;
  if(!refreshing)refreshing=(async()=>{
    try{
      const s=toSession(await authFetch('/token?grant_type=refresh_token',{refresh_token:session.refresh_token}));
      if(!s)throw new Error('x');
      saveSession(s);
    }catch(e){if(!e.net){saveSession(null);profile=null}}
    finally{refreshing=null}
  })();
  await refreshing;
  return session?session.access_token:null;
}
async function loadProfile(){
  try{profile=await sb('/rest/v1/rpc/my_profile',{method:'POST',body:'{}'})}catch(e){profile=null}
}
/* ---- Gabungkan data lokal dan cloud: selalu ambil yang terbaik, tidak pernah mengurangi progres ---- */
function collectLocal(){return{v:1,best,bestT,dly,prog,ach,mis}}
function mergeData(a,b){
  a=a||{};b=b||{};
  const o={v:1};
  o.best=Math.max(+a.best||0,+b.best||0);o.bestT=Math.max(+a.bestT||0,+b.bestT||0);
  const pa=cleanProg(a.prog),pb=cleanProg(b.prog);
  o.prog={unlocked:Math.max(pa.unlocked,pb.unlocked),stars:{}};
  new Set([...Object.keys(pa.stars),...Object.keys(pb.stars)]).forEach(k=>{o.prog.stars[k]=Math.max(pa.stars[k]||0,pb.stars[k]||0)});
  const da=cleanDly(a.dly),db=cleanDly(b.dly),base=da.key>db.key?da:db.key>da.key?db:null;
  o.dly={key:da.key,last:Math.max(da.last,db.last),streak:Math.max(da.streak,db.streak),best:Math.max(da.best,db.best),hist:{},done:{}};
  if(base){o.dly.key=base.key;o.dly.last=base.last;o.dly.streak=base.streak;o.dly.best=base.best}
  [da,db].forEach(d=>{
    Object.entries(d.hist).forEach(([k,v])=>{o.dly.hist[k]=Math.max(o.dly.hist[k]||0,v)});
    Object.keys(d.done).forEach(k=>{o.dly.done[k]=true});
  });
  const xa=cleanAch(a.ach),xb=cleanAch(b.ach);
  o.ach={un:Object.assign({},xa.un,xb.un),stats:{pu:{}},bonus:{}};
  ['lines','combo','multi','clean','best'].forEach(k=>{o.ach.stats[k]=Math.max(xa.stats[k],xb.stats[k])});
  PU3.forEach(k=>{o.ach.stats.pu[k]=Math.max(xa.stats.pu[k]||0,xb.stats.pu[k]||0);o.ach.bonus[k]=Math.max(xa.bonus[k]||0,xb.bonus[k]||0)});
  const ma=cleanMis(a.mis),mb=cleanMis(b.mis);
  if(ma.key!==mb.key)o.mis=ma.key>mb.key?ma:mb;
  else o.mis={key:ma.key,list:ma.list.map((m,i)=>{const n=mb.list[i];return n&&n.t===m.t&&n.g===m.g?{t:m.t,g:m.g,r:m.r,p:Math.max(m.p,n.p),done:m.done||n.done}:m})};
  return o;
}
function applyData(o){
  best=Math.max(best,+o.best||0);bestT=Math.max(bestT,+o.bestT||0);
  prog=cleanProg(o.prog);dly=cleanDly(o.dly);ach=cleanAch(o.ach);mis=cleanMis(o.mis);
  secSet('blox-best',best);secSet('blox-bt',bestT);saveProg();saveDaily();saveMeta();
  updateScore();
}
const setSyncText=m=>{$('#accSyncT').textContent=m};
async function syncNow(){
  if(!session||!onlineOK()||(profile&&profile.banned)||syncing)return;
  syncing=true;setSyncText(t('acc_syncing'));
  try{
    const cloud=await sb('/rest/v1/rpc/cloud_load',{method:'POST',body:'{}'});
    const merged=mergeData(collectLocal(),cloud);
    applying=true;applyData(merged);applying=false;
    await sb('/rest/v1/rpc/cloud_save',{method:'POST',body:JSON.stringify({p_data:merged})});
    setSyncText(t('acc_synced',{time:new Date().toLocaleTimeString(dateLoc(),{hour:'2-digit',minute:'2-digit'})}));
  }catch(e){applying=false;setSyncText(t('acc_sync_fail',{e:errMsg(e)}))}
  finally{syncing=false}
}
function syncSoon(){
  if(applying||!session)return;
  clearTimeout(syncTimer);syncTimer=setTimeout(()=>syncNow(),4000);
}
/* ---- Daftar, masuk, keluar ---- */
async function doSignUp(email,pass,user){
  if(!onlineOK())return aMsg(t('acc_offline'));
  if(pass.length<8)return aMsg(t('acc_pass_short'));
  if(!USERNAME_RE.test(user))return aMsg(t('acc_err_user'));
  if(BADWORDS.test(user))return aMsg(t('acc_err_badname'));
  let free=true;
  try{free=await sb('/rest/v1/rpc/username_available',{method:'POST',body:JSON.stringify({p_name:user})},true)}catch(e){return aMsg(errMsg(e))}
  if(free===false)return aMsg(t('acc_err_taken'));
  const r=await authFetch('/signup',{email,password:pass,data:{username:user}});
  if(r&&r.access_token){await onSession(toSession(r));aMsg(t('acc_welcome',{name:accName()||user}))}
  else aMsg(t('acc_check_mail'));
}
async function doSignIn(email,pass){
  if(!onlineOK())return aMsg(t('acc_offline'));
  const s=toSession(await authFetch('/token?grant_type=password',{email,password:pass}));
  if(!s)throw new Error(t('err_login'));
  await onSession(s);
  aMsg(profile&&profile.banned?t('acc_banned'):t('acc_welcome',{name:accName()||''}));
}
async function onSession(s){
  saveSession(s);await loadProfile();
  if(!(profile&&profile.banned))await syncNow();
  $('#accPass').value='';hidePw();showAccount();
}
async function restoreSession(){
  await loadProfile();
  if(profile&&profile.banned)return;
  await syncNow();refreshUi();
}
function wipeLocal(){
  try{['blox-best','blox-bt','blox-daily','blox-prog','blox-ach','blox-mis','blox-save',AUTH_KEY].forEach(k=>localStorage.removeItem(k))}catch(e){}
}
async function doSignOut(){
  try{if(session)await authFetch('/logout',null,'POST',await getToken())}catch(e){}
  saveSession(null);profile=null;wipeLocal();location.reload();
}
async function doDelete(){
  if(!armDel){armDel=true;$('#accDel').textContent=t('acc_delete2');return}
  armDel=false;
  try{
    await sb('/rest/v1/rpc/delete_my_account',{method:'POST',body:'{}'});
    saveSession(null);profile=null;wipeLocal();aMsg(t('acc_deleted'));setTimeout(()=>location.reload(),900);
  }catch(e){aMsg(errMsg(e));$('#accDel').textContent=t('acc_delete')}
}
async function doForgot(email){
  if(!email)return aMsg(t('acc_err_fields'));
  let p='/recover';
  if(location.hostname.endsWith('.github.io'))p+='?redirect_to='+encodeURIComponent(location.href.split('#')[0]);
  try{await authFetch(p,{email})}catch(e){if(e.net)return aMsg(e.message)}
  aMsg(t('acc_reset_sent'));
}
async function doSetPass(){
  const p=$('#accNew').value;
  if(p.length<8)return aMsg(t('acc_pass_short'));
  try{
    await authFetch('/user',{password:p},'PUT',recoveryToken);
    recoveryToken=null;$('#accNew').value='';hidePw();accMode='in';aMsg(t('acc_pass_saved'));showAccount();
  }catch(e){aMsg(e.message)}
}
/* Tautan dari email (konfirmasi pendaftaran atau reset password) membawa token di bagian # alamat */
async function handleAuthHash(){
  const h=location.hash;
  if(!h||h.length<10)return false;
  const q=new URLSearchParams(h.slice(1)),at=q.get('access_token');
  if(!at)return false;
  try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}
  if(q.get('type')==='recovery'){recoveryToken=at;showAccount('rec');return true}
  try{
    const u=await authFetch('/user',null,'GET',at);
    await onSession({access_token:at,refresh_token:q.get('refresh_token')||'',expires_at:+q.get('expires_at')||Math.floor(Date.now()/1000)+(+q.get('expires_in')||3600),user:{id:u.id,email:u.email}});
  }catch(e){}
  return true;
}
/* ---- Layar akun ---- */
/* Tombol mata: ikon mata = tekan untuk menampilkan, mata dicoret = tekan untuk menyembunyikan */
const EYE_ON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>';
const EYE_OFF='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.9 17.9A10.9 10.9 0 0112 19C5 19 1 12 1 12a18.5 18.5 0 015.1-5.9M9.9 5.1A10.9 10.9 0 0112 5c7 0 11 7 11 7a18.5 18.5 0 01-2.2 3.2M14.1 14.1a3 3 0 11-4.2-4.2"/><path d="M1 1l22 22"/></svg>';
const EYES=[['#eyePass','#accPass'],['#eyeNew','#accNew']];
function paintEyes(){
  EYES.forEach(([b,i])=>{
    const btn=$(b),shown=$(i).type==='text';
    btn.innerHTML=shown?EYE_OFF:EYE_ON;
    btn.setAttribute('aria-label',t(shown?'acc_hide':'acc_show'));
    btn.setAttribute('aria-pressed',shown?'true':'false');
  });
}
function hidePw(){EYES.forEach(([b,i])=>{$(i).type='password'});paintEyes()}
function showAccount(m){
  if(m)accMode=m;
  const inn=!!session,rec=accMode==='rec';
  $('#accOut').hidden=inn||rec;$('#accRec').hidden=!rec;$('#accIn').hidden=!inn||rec;
  $('#tabIn').classList.toggle('sel',accMode!=='up');$('#tabUp').classList.toggle('sel',accMode==='up');
  $('#accUser').hidden=accMode!=='up';
  $('#accGo').textContent=t(accMode==='up'?'acc_signup':'acc_login');
  $('#accPass').autocomplete=accMode==='up'?'new-password':'current-password';
  if(!onlineOK())aMsg(t('acc_offline'));
  if(inn){
    $('#accWho').textContent=t('acc_in_as',{name:accName()||(session.user&&session.user.email)||''})+(session.user&&session.user.email?' ('+session.user.email+')':'')+(profile&&profile.role==='admin'?' - Admin':'');
    $('#accAdminBtn').hidden=!(profile&&profile.role==='admin'&&!profile.banned);
    $('#accDel').textContent=t('acc_delete');armDel=false;
  }
  paintEyes();
  show('#accScreen');
}
function initAccount(){
  $('#sAcc').onclick=()=>{hidePw();showAccount()};
  $('#lbLogin').onclick=()=>{hidePw();showAccount('in')};
  EYES.forEach(([b,i])=>{$(b).onclick=()=>{$(i).type=$(i).type==='password'?'text':'password';paintEyes()}});
  hidePw();
  $('#tabIn').onclick=()=>{accMode='in';aMsg('');showAccount()};
  $('#tabUp').onclick=()=>{accMode='up';aMsg('');showAccount()};
  $('#accGo').onclick=async()=>{
    const email=$('#accEmail').value.trim(),pass=$('#accPass').value,user=$('#accUser').value.trim();
    if(!email||!pass)return aMsg(t('acc_err_fields'));
    aMsg(t('acc_wait'));
    try{if(accMode==='up')await doSignUp(email,pass,user);else await doSignIn(email,pass)}catch(e){aMsg(e.message)}
  };
  $('#accForgot').onclick=()=>doForgot($('#accEmail').value.trim());
  $('#accSetPass').onclick=doSetPass;
  $('#accSync').onclick=()=>syncNow();
  $('#accLogout').onclick=doSignOut;
  $('#accDel').onclick=doDelete;
  $('#accAdminBtn').onclick=()=>showAdmin();
  if(onlineOK())handleAuthHash().then(h=>{if(!h&&session)restoreSession()});
}
