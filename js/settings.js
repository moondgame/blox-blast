/* Pengaturan: akun, bahasa, skin, suara, dan musik */
let skin='classic';
function setSkin(k){skin=k;document.documentElement.dataset.skin=k;try{localStorage.setItem('blox-skin',k)}catch(e){}}
function toggleMuted(){
  muted=!muted;$('#snd').innerHTML=muted?ICON_OFF:ICON_ON;
  try{localStorage.setItem('blox-mute',muted?'1':'0')}catch(e){}
  if(!$('#setScreen').hidden)showSettings();
}
/* Ganti bahasa: terapkan ke teks statis, lalu gambar ulang layar yang sedang terbuka */
function setLang(l){
  lang=l;try{localStorage.setItem('blox-lang',l)}catch(e){}
  applyI18n();buildPw();updateScore();updateGoal();updatePw();refreshUi();
}
function refreshUi(){
  const R={home:showHome,startScreen:showStart,lvlScreen:showLevels,dayScreen:showDaily,achScreen:showAch,setScreen:showSettings,lbScreen:showLb,accScreen:showAccount};
  const cur=[...$$('.screen')].find(e=>!e.hidden);
  if(cur&&R[cur.id])R[cur.id]();
  if(!$('#tut').hidden)renderTut();
}
function showSettings(){
  $('#sAcc').textContent=t('set_account')+(accName()?': '+accName():'');
  const lg=$('#langs');lg.innerHTML='';
  LANGS.forEach(([k,n])=>{
    const b=document.createElement('button');b.className='alt tab'+(lang===k?' sel':'');
    b.textContent=n;b.onclick=()=>setLang(k);lg.appendChild(b);
  });
  const box=$('#skins');box.innerHTML='';
  SKINS.forEach(k=>{
    const b=document.createElement('button');b.className='alt sk'+(skin===k?' sel':'');
    b.innerHTML='<span class="skinprev" data-skin="'+k+'"><i class="pv" style="background:#ff6b6b"></i><i class="pv" style="background:#4dabf7"></i><i class="pv" style="background:#51cf66"></i></span>'+t('skin_'+k);
    b.onclick=()=>{setSkin(k);showSettings()};box.appendChild(b);
  });
  $('#sMusic').textContent=t('set_music',{s:t(musicOn?'on':'off')});
  $('#sPin').textContent=t('set_pin',{s:t(pinOn()?'on':'off')});
  $('#sSfx').textContent=t('set_sfx',{s:t(muted?'off':'on')});
  show('#setScreen');
}
