/* Tombol bagikan hasil */
function shareText(){
  const r=lastRes||{},d=new Date();
  const app='Blox Blast Mini';
  if(mode==='daily')return t('share_daily',{app,date:d.toLocaleDateString(dateLoc(),{day:'numeric',month:'long',year:'numeric'}),res:t(r.win?'share_res_done':'share_res_not'),score,streak:streakNow()});
  if(mode==='level')return t('share_level',{app,n:lvl+1,res:r.win?t('share_level_done',{st:r.st}):t('share_res_not'),score});
  if(mode==='timed')return t('share_timed',{app,score,best:bestT});
  return t('share_classic',{app,score,best});
}
function copyFallback(txt){
  try{
    const a=document.createElement('textarea');a.value=txt;a.style.cssText='position:fixed;opacity:0';
    document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();
    $('#shareMsg').textContent=t('share_copied');
  }catch(e){$('#shareMsg').textContent=t('share_fail')}
}
function doShare(){
  const msg=shareText(),url=location.hostname.endsWith('.github.io')?location.href.split('#')[0]:'',full=msg+(url?'\n'+url:'');
  try{
    if(window.AndroidShare&&window.AndroidShare.share){window.AndroidShare.share(full);return}
    if(navigator.share){navigator.share(url?{text:msg,url}:{text:msg}).catch(()=>{});return}
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(full).then(()=>{$('#shareMsg').textContent=t('share_copied')}).catch(()=>copyFallback(full));
      return;
    }
  }catch(e){}
  copyFallback(full);
}
