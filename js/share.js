/* Tombol bagikan hasil */
function shareText(){
  const r=lastRes||{},d=new Date();
  if(mode==='daily')return 'Blox Blast Mini, tantangan harian '+d.getDate()+' '+BULAN[d.getMonth()]+' '+d.getFullYear()+': '+(r.win?'selesai':'belum selesai')+', skor '+score+', beruntun '+streakNow()+' hari.';
  if(mode==='level')return 'Blox Blast Mini, level '+(lvl+1)+': '+(r.win?'selesai dengan '+r.st+' dari 3 bintang':'belum selesai')+', skor '+score+'.';
  if(mode==='timed')return 'Blox Blast Mini, mode waktu: skor '+score+' (terbaik '+bestT+').';
  return 'Blox Blast Mini, mode klasik: skor '+score+' (terbaik '+best+').';
}
function copyFallback(t){
  try{
    const a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;opacity:0';
    document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();
    $('#shareMsg').textContent='Teks hasil disalin. Tempel di aplikasi chat.';
  }catch(e){$('#shareMsg').textContent='Tidak bisa membagikan di perangkat ini.'}
}
function doShare(){
  const t=shareText(),url=location.hostname.endsWith('.github.io')?location.href.split('#')[0]:'',full=t+(url?'\n'+url:'');
  try{
    if(window.AndroidShare&&window.AndroidShare.share){window.AndroidShare.share(full);return}
    if(navigator.share){navigator.share(url?{text:t,url}:{text:t}).catch(()=>{});return}
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(full).then(()=>{$('#shareMsg').textContent='Teks hasil disalin. Tempel di aplikasi chat.'}).catch(()=>copyFallback(full));
      return;
    }
  }catch(e){}
  copyFallback(full);
}
