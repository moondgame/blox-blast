/* Pencapaian dan misi harian */
const ACH=[
{id:'first',n:'Langkah pertama',d:'Hapus garis pertamamu',f:()=>ach.stats.lines>=1},
{id:'l50',n:'Penghapus garis',d:'Hapus 50 garis',f:()=>ach.stats.lines>=50},
{id:'l300',n:'Mesin penghapus',d:'Hapus 300 garis',f:()=>ach.stats.lines>=300},
{id:'c3',n:'Kombo beruntun',d:'Capai kombo x3',f:()=>ach.stats.combo>=3},
{id:'c6',n:'Kombo gila',d:'Capai kombo x6',f:()=>ach.stats.combo>=6},
{id:'m3',n:'Sekali sapu',d:'Hapus 3 garis sekaligus',f:()=>ach.stats.multi>=3},
{id:'s500',n:'Skor 500',d:'Raih skor 500 dalam satu game',f:()=>ach.stats.best>=500},
{id:'s1500',n:'Skor 1500',d:'Raih skor 1500 dalam satu game',f:()=>ach.stats.best>=1500},
{id:'clean',n:'Papan bersih',d:'Kosongkan seluruh papan',f:()=>ach.stats.clean>=1},
{id:'pu',n:'Ahli power-up',d:'Pakai bom, acak, dan undo',f:()=>PU3.every(k=>(ach.stats.pu[k]||0)>0)},
{id:'lv5',n:'Penakluk level',d:'Selesaikan 5 level',f:()=>Object.keys(prog.stars).length>=5},
{id:'lv20',n:'Juara level',d:'Selesaikan semua level',f:()=>Object.keys(prog.stars).length>=LEVELS.length},
{id:'star',n:'Bintang tiga',d:'Dapat 3 bintang di sebuah level',f:()=>Object.values(prog.stars).includes(3)},
{id:'dd',n:'Pemburu harian',d:'Selesaikan tantangan harian',f:()=>Object.keys(dly.done).length>=1},
{id:'d3',n:'Konsisten',d:'Main 3 hari beruntun',f:()=>streakNow()>=3}];
const MT=[
{t:'lines',tx:g=>'Hapus '+g+' garis',mk:r=>[10,15,20][Math.floor(r()*3)]},
{t:'combo',tx:g=>'Capai kombo x'+g,mk:r=>3+Math.floor(r()*2)},
{t:'multi',tx:g=>'Hapus '+g+' garis sekaligus',mk:r=>3+Math.floor(r()*2)},
{t:'pu',tx:g=>'Pakai '+g+' power-up',mk:r=>2+Math.floor(r()*2)},
{t:'score',tx:g=>'Raih skor '+g+' dalam satu game',mk:r=>[400,600,800][Math.floor(r()*3)]},
{t:'level',tx:g=>'Selesaikan '+g+' level',mk:r=>1+Math.floor(r()*2)},
{t:'daily',tx:()=>'Selesaikan tantangan harian',mk:()=>1}];
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
function ev(t,n,x){
  ensureMis();
  const st=ach.stats;
  if(t==='lines')st.lines+=n;
  else if(t==='combo')st.combo=Math.max(st.combo,n);
  else if(t==='multi')st.multi=Math.max(st.multi,n);
  else if(t==='clean')st.clean++;
  else if(t==='score')st.best=Math.max(st.best,n);
  else if(t==='pu')st.pu[x]=(st.pu[x]||0)+1;
  mis.list.forEach(m=>{
    if(m.t!==t||m.done)return;
    m.p=ADD.includes(t)?m.p+n:Math.max(m.p,n);
    if(m.p>=m.g){
      m.p=m.g;m.done=true;ach.bonus[m.r]=Math.min(5,(ach.bonus[m.r]||0)+1);
      setTimeout(()=>toast('Misi selesai! +1 '+NAMA[m.r]+' awal'),1300);sfx.gift();
    }
  });
}
function checkAch(){
  let d=0;
  ACH.forEach(a=>{
    if(!ach.un[a.id]&&a.f()){ach.un[a.id]=1;d++;setTimeout(()=>toast('Pencapaian: '+a.n),700+d*900);sfx.gift()}
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
    d.innerHTML=T.tx(m.g)+'<small>'+(m.done?'Selesai. Hadiah diterima: +1 '+NAMA[m.r]+' awal':'Hadiah: +1 '+NAMA[m.r]+' awal ('+m.p+'/'+m.g+')')+'</small><div class="gbar"><div class="gf" style="width:'+Math.round(m.p/m.g*100)+'%"></div></div>';
    mb.appendChild(d);
  });
  const al=$('#achList');al.innerHTML='';
  $('#achH').textContent='Pencapaian ('+ACH.filter(a=>ach.un[a.id]).length+'/'+ACH.length+')';
  ACH.forEach(a=>{
    const u=!!ach.un[a.id],d=document.createElement('div');
    d.className='ac '+(u?'un':'lock');
    d.innerHTML=(u?IC_TROPHY:IC_LOCK)+'<div><b>'+a.n+'</b><small>'+a.d+'</small></div>';
    al.appendChild(d);
  });
  show('#achScreen');
}
