/* Papan peringkat online (Supabase) dan pengiriman skor */
/* ---- Papan peringkat online (Supabase) ---- */
const onlineOK=()=>!!(ONLINE.url&&ONLINE.key);
const isoDay=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const setMsg=t=>{$('#shareMsg').textContent=t;$('#lbMsg').textContent=t};
let pName='';try{pName=localStorage.getItem('blox-name')||''}catch(e){}
function devId(){
  let d=null;try{d=localStorage.getItem('blox-dev')}catch(e){}
  if(!d||!/^[0-9a-f-]{36}$/.test(d)){
    d=(window.crypto&&crypto.randomUUID)?crypto.randomUUID():'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c==='x'?r:(r&3|8)).toString(16)});
    try{localStorage.setItem('blox-dev',d)}catch(e){}
  }
  return d;
}
async function sb(path,opt){
  const c=new AbortController(),tm=setTimeout(()=>c.abort(),8000);
  const h={apikey:ONLINE.key,'Content-Type':'application/json'};
  if(ONLINE.key.startsWith('eyJ'))h.Authorization='Bearer '+ONLINE.key;
  try{
    const r=await fetch(ONLINE.url.replace(/\/$/,'')+path,Object.assign({signal:c.signal,headers:h},opt));
    const txt=await r.text();
    if(!r.ok)throw new Error(txt.slice(0,120)||('HTTP '+r.status));
    return txt?JSON.parse(txt):null;
  }finally{clearTimeout(tm)}
}
async function submitPend(){
  if(!pend||!onlineOK())return;
  if(!pName){setMsg('Isi nama di Papan peringkat untuk mengirim skor.');return}
  const p=pend;
  try{
    await sb('/rest/v1/rpc/submit_score',{method:'POST',body:JSON.stringify({p_device:devId(),p_name:pName,p_mode:p.mode,p_day:p.day,p_score:p.score,p_moves:p.moves,p_lines:p.lines,p_secs:p.secs})});
    if(pend===p)pend=null;
    $('#toLb').hidden=false;
    setMsg('Skor terkirim ke papan peringkat.');
  }catch(e){setMsg('Gagal mengirim skor: '+(e.name==='AbortError'?'koneksi lambat':e.message))}
}
let lbTab='';
async function loadLb(tab){
  const L=$('#lbList'),info=$('#lbInfo');L.innerHTML='';
  if(!onlineOK()){info.textContent='Papan peringkat belum diaktifkan. Ikuti PANDUAN-ONLINE.md untuk menghubungkan Supabase.';return}
  info.textContent='Memuat...';
  const path=tab==='timedall'?'/rest/v1/leaderboard_best?select=name,score&mode=eq.timed&order=score.desc&limit=20'
    :'/rest/v1/leaderboard?select=name,score&mode=eq.'+(tab==='daily'?'daily':'timed')+'&day=eq.'+isoDay()+'&order=score.desc&limit=20';
  try{
    const rows=await sb(path,{method:'GET'});
    if(tab!==lbTab)return;
    info.textContent=(tab==='daily'?'Tantangan harian, hari ini':tab==='timed'?'Mode waktu, hari ini':'Mode waktu, semua waktu');
    if(!rows||!rows.length){info.textContent+=': belum ada skor.';return}
    rows.forEach((r,i)=>{
      const d=document.createElement('div'),a=document.createElement('span'),b=document.createElement('b');
      d.className='lbr'+(pName&&r.name===pName?' me':'');
      a.textContent=(i+1)+'. '+r.name;b.textContent=r.score;
      d.appendChild(a);d.appendChild(b);L.appendChild(d);
    });
  }catch(e){info.textContent='Gagal memuat: '+(e.name==='AbortError'?'koneksi lambat':e.message)}
}
function showLb(){
  $('#lbName').value=pName;setMsg('');
  lbTab=lbTab||(pend&&pend.mode==='timed'?'timed':'daily');
  $$('.tab').forEach(b=>b.classList.toggle('sel',b.dataset.t===lbTab));
  show('#lbScreen');
  if(pend&&pName)submitPend().then(()=>loadLb(lbTab));else loadLb(lbTab);
}
function saveName(){
  const v=$('#lbName').value.trim();
  if(!/^[\p{L}\p{N} _.-]{2,16}$/u.test(v)){setMsg('Nama 2-16 karakter: huruf, angka, spasi, titik, atau strip.');return}
  pName=v;try{localStorage.setItem('blox-name',v)}catch(e){}
  setMsg('Nama disimpan.');
  if(pend)submitPend().then(()=>loadLb(lbTab));else loadLb(lbTab);
}
