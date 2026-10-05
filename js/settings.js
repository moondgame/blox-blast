/* Pengaturan: skin, suara, dan musik */
let skin='classic';
function setSkin(k){skin=k;document.documentElement.dataset.skin=k;try{localStorage.setItem('blox-skin',k)}catch(e){}}
function toggleMuted(){
  muted=!muted;$('#snd').innerHTML=muted?ICON_OFF:ICON_ON;
  try{localStorage.setItem('blox-mute',muted?'1':'0')}catch(e){}
  if(!$('#setScreen').hidden)showSettings();
}
function showSettings(){
  const box=$('#skins');box.innerHTML='';
  SKINS.forEach(([k,n])=>{
    const b=document.createElement('button');b.className='alt sk'+(skin===k?' sel':'');
    b.innerHTML='<span class="skinprev" data-skin="'+k+'"><i class="pv" style="background:#ff6b6b"></i><i class="pv" style="background:#4dabf7"></i><i class="pv" style="background:#51cf66"></i></span>'+n;
    b.onclick=()=>{setSkin(k);showSettings()};box.appendChild(b);
  });
  $('#sMusic').textContent='Musik latar: '+(musicOn?'Nyala':'Mati');
  $('#sPin').textContent='Kunci PIN: '+(pinOn()?'Nyala':'Mati');
  $('#sSfx').textContent='Efek suara dan getar: '+(muted?'Mati':'Nyala');
  show('#setScreen');
}
