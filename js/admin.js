/* Panel admin (Indonesia saja). Hanya tampil untuk akun berperan admin; setiap tindakan diperiksa lagi di server. */
let admTab='ov';
const isAdmin=()=>!!(profile&&profile.role==='admin'&&!profile.banned);
const admMsg=m=>{$('#admMsg').textContent=m||''};
const rpc=(name,args)=>sb('/rest/v1/rpc/'+name,{method:'POST',body:JSON.stringify(args||{})});
function aEl(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e}
function aBtn(label,fn,cls){const b=aEl('button','alt'+(cls?' '+cls:''),label);b.onclick=fn;return b}
/* Tombol konfirmasi dua kali untuk tindakan yang tidak bisa dibatalkan */
function aArm(label,fn,cls){
  const b=aEl('button','alt'+(cls?' '+cls:''),label);let armed=false;
  b.onclick=async()=>{
    if(!armed){armed=true;b.textContent='Yakin? '+label;setTimeout(()=>{armed=false;b.textContent=label},4000);return}
    armed=false;b.textContent=label;await fn();
  };
  return b;
}
function aRow(title,small,btns,tags){
  const d=aEl('div','arow'),b=aEl('b',null,title);
  (tags||[]).forEach(([txt,cls])=>b.appendChild(aEl('span','tag '+(cls||''),txt)));
  d.appendChild(b);if(small)d.appendChild(aEl('small',null,small));
  const bb=aEl('div','abtns');btns.forEach(x=>bb.appendChild(x));d.appendChild(bb);
  return d;
}
async function admDo(name,args,ok){
  try{await rpc(name,args);await loadAdmin();admMsg(ok||'Berhasil.')}catch(e){admMsg('Gagal: '+errMsg(e))}
}
function showAdmin(){
  if(!isAdmin())return;
  $$('#admTabs .tab').forEach(b=>b.classList.toggle('sel',b.dataset.at===admTab));
  show('#adminScreen');loadAdmin();
}
async function loadAdmin(){
  const body=$('#admBody');body.innerHTML='';admMsg('Memuat...');
  try{await({ov:admOverview,us:admUsers,sc:admScores,rp:admReports,lg:admLog}[admTab])(body);admMsg('')}
  catch(e){admMsg('Gagal: '+errMsg(e))}
}
async function admOverview(body){
  const o=await rpc('admin_overview');
  const lbl={players:'Pemain',banned:'Diblokir',admins:'Admin',scores:'Skor di papan peringkat',hidden:'Skor disembunyikan',reports:'Laporan terbuka'};
  const d=aEl('div','arow');
  Object.keys(lbl).forEach(k=>d.appendChild(aEl('b',null,lbl[k]+': '+(o&&o[k]!==undefined?o[k]:0))));
  body.appendChild(d);
  const day=isoDay(),r=aEl('div','arow');r.appendChild(aEl('small',null,'Kosongkan papan peringkat hari ini ('+day+'). Tidak bisa dibatalkan.'));
  const bb=aEl('div','abtns');
  bb.appendChild(aArm('Reset papan harian',()=>admDo('admin_reset_board',{p_mode:'daily',p_day:day}),'danger'));
  bb.appendChild(aArm('Reset papan waktu',()=>admDo('admin_reset_board',{p_mode:'timed',p_day:day}),'danger'));
  r.appendChild(bb);body.appendChild(r);
}
async function admUsers(body){
  const q=aEl('input','fld');q.placeholder='Cari nama pemain atau email';q.value=admUsers.q||'';
  const reason=aEl('input','fld');reason.placeholder='Alasan blokir (opsional)';reason.value=admUsers.reason||'';
  const go=aBtn('Cari',()=>{admUsers.q=q.value;admUsers.reason=reason.value;loadAdmin()});
  const f=aEl('div','admin-form');f.appendChild(q);f.appendChild(reason);f.appendChild(go);body.appendChild(f);
  const list=await rpc('admin_users',{p_search:q.value.trim(),p_limit:30})||[];
  if(!list.length)body.appendChild(aEl('p','sub','Tidak ada pemain.'));
  list.forEach(u=>{
    const tags=[];if(u.role==='admin')tags.push(['ADMIN']);if(u.banned)tags.push(['BLOKIR','ban']);
    const btns=[
      aArm(u.banned?'Buka blokir':'Blokir',()=>admDo('admin_set_ban',{p_user:u.id,p_ban:!u.banned,p_reason:reason.value.trim()||null}),u.banned?'':'danger'),
      aArm('Hapus nama',()=>admDo('admin_reset_name',{p_user:u.id})),
      aArm(u.role==='admin'?'Cabut admin':'Jadikan admin',()=>admDo('admin_set_role',{p_user:u.id,p_role:u.role==='admin'?'player':'admin'}))];
    body.appendChild(aRow(u.username,(u.email||'')+(u.ban_reason?' | alasan: '+u.ban_reason:''),btns,tags));
  });
}
async function admScores(body){
  const st=admScores.st=admScores.st||{mode:'daily',day:isoDay()};
  const f=aEl('div','admin-form');
  const sel=aEl('select','fld');[['daily','Harian'],['timed','Waktu']].forEach(([v,n])=>{const o=aEl('option',null,n);o.value=v;sel.appendChild(o)});sel.value=st.mode;
  const day=aEl('input','fld');day.type='date';day.value=st.day;
  const uname=aEl('input','fld');uname.placeholder='Nama pemain (persis)';uname.value=st.u||'';
  const sc=aEl('input','fld');sc.type='number';sc.min='0';sc.placeholder='Skor';sc.value=st.s||'';
  f.appendChild(sel);f.appendChild(day);
  f.appendChild(aBtn('Muat daftar',()=>{st.mode=sel.value;st.day=day.value;st.u=uname.value;st.s=sc.value;loadAdmin()}));
  f.appendChild(aEl('small',null,'Tambah atau ubah skor pemain (membuat entri jika belum ada):'));
  f.appendChild(uname);f.appendChild(sc);
  f.appendChild(aArm('Simpan skor',()=>{st.mode=sel.value;st.day=day.value;admDo('admin_set_score',{p_username:uname.value.trim(),p_mode:sel.value,p_day:day.value,p_score:parseInt(sc.value,10)})}));
  body.appendChild(f);
  const list=await rpc('admin_scores',{p_mode:st.mode,p_day:st.day,p_limit:50})||[];
  if(!list.length)body.appendChild(aEl('p','sub','Belum ada skor.'));
  list.forEach(r=>{
    const tags=[];if(r.hidden)tags.push(['DISEMBUNYIKAN','hid']);
    const btns=[
      aBtn('Isi form',()=>{uname.value=r.username;sc.value=r.score;st.u=r.username;st.s=r.score}),
      aBtn(r.hidden?'Tampilkan':'Sembunyikan',()=>admDo('admin_set_hidden',{p_score_id:r.id,p_hidden:!r.hidden})),
      aArm('Hapus',()=>admDo('admin_delete_score',{p_score_id:r.id}),'danger')];
    body.appendChild(aRow(r.username+': '+r.score,'langkah '+(r.moves??'-')+', garis '+(r.lines??'-')+', durasi '+(r.secs??'-')+' dtk',btns,tags));
  });
}
async function admReports(body){
  const list=await rpc('admin_reports')||[];
  if(!list.length)body.appendChild(aEl('p','sub','Tidak ada laporan terbuka.'));
  list.forEach(r=>{
    const tags=[['x'+r.reports,'ban']];if(r.hidden)tags.push(['DISEMBUNYIKAN','hid']);
    const btns=[
      aBtn(r.hidden?'Tampilkan':'Sembunyikan',()=>admDo('admin_set_hidden',{p_score_id:r.score_id,p_hidden:!r.hidden})),
      aBtn('Abaikan laporan',()=>admDo('admin_clear_reports',{p_score_id:r.score_id})),
      aArm('Hapus skor',()=>admDo('admin_delete_score',{p_score_id:r.score_id}),'danger')];
    body.appendChild(aRow(r.username+': '+r.score,r.mode+' | '+r.day,btns,tags));
  });
}
async function admLog(body){
  const list=await rpc('admin_log_list',{p_limit:50})||[];
  if(!list.length)body.appendChild(aEl('p','sub','Log kosong.'));
  list.forEach(l=>body.appendChild(aRow(l.action,(l.created_at||'').replace('T',' ').slice(0,16)+' | '+(l.admin||'-')+' | '+(l.target||'')+(l.details?' | '+JSON.stringify(l.details):''),[])));
}
function initAdmin(){
  $$('#admTabs .tab').forEach(b=>{b.onclick=()=>{admTab=b.dataset.at;showAdmin()}});
}
