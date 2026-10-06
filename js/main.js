/* Penghubung tombol dan awal aplikasi (dimuat terakhir) */
$('#again').onclick=reset;
const snd=$('#snd'),thm=$('#thm'),root=document.documentElement;
snd.innerHTML=muted?ICON_OFF:ICON_ON;
snd.onclick=toggleMuted;
try{const th=localStorage.getItem('blox-theme');if(th)root.dataset.theme=th}catch(e){}
thm.onclick=()=>{
  const dark=root.dataset.theme?root.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;
  root.dataset.theme=dark?'light':'dark';
  try{localStorage.setItem('blox-theme',root.dataset.theme)}catch(e){}
};
/* Tombol kembali: tiap layar menyebut tujuannya lewat data-back */
function goBack(w){({home:showHome,start:showStart,settings:showSettings,account:showAccount}[w]||showHome)()}
$$('.back').forEach(b=>{b.onclick=()=>goBack(b.dataset.back)});
$('#hStart').onclick=showStart;
$('#hCont').onclick=hideAll;
$('#hClassic').onclick=()=>startMode('classic');
$('#hLevel').onclick=showLevels;
$('#hDaily').onclick=showDaily;
$('#hTimed').onclick=()=>startMode('timed');
$('#hMis').onclick=showAch;
$('#hLb').onclick=showLb;$('#toLb').onclick=showLb;
$('#hSet').onclick=showSettings;
$('#dStart').onclick=()=>startMode('daily');
$('#mnu').onclick=showHome;
$('#toMenu').onclick=()=>{mode==='level'?showLevels():mode==='daily'?showDaily():showStart()};
$('#next').onclick=()=>startMode('level',lvl+1);
(function(){
  const h=location.hostname,r=location.pathname.split('/')[1];
  if(h.endsWith('.github.io')&&r){const a=$('#apkLink');a.href='https://github.com/'+h.split('.')[0]+'/'+r+'/releases/latest/download/BloxBlastMini.apk';a.hidden=false}
})();
const IC=d=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+d+'</svg>';
const PWICON={
  bomb:'<circle cx="10" cy="14" r="7"/><path d="M15 9l3-3"/><path d="M18 6l1.5-1.5M20 3.5v-1M22 5h-1"/>',
  shuffle:'<path d="M3 7h4l10 10h4"/><path d="M3 17h4l3-3"/><path d="M14 10l3-3h4"/><path d="M18 4l3 3-3 3"/><path d="M18 14l3 3-3 3"/>',
  undo:'<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 010 12h-3"/>'};
function buildPw(){
  ORDER.forEach(k=>{$('#p-'+k).innerHTML=IC(PWICON[k])+'<span class="lb">'+t('pu_'+k)+'</span><span class="bd" id="c-'+k+'"></span>'});
}
$('#p-bomb').onclick=toggleBomb;$('#p-shuffle').onclick=doShuffle;$('#p-undo').onclick=doUndo;
boardEl.addEventListener('pointerdown',e=>{if(bombOn&&!busy){e.preventDefault();preview(aim(e))}});
boardEl.addEventListener('pointermove',e=>{if(bombOn&&!busy)preview(aim(e))});
boardEl.addEventListener('pointerup',e=>{if(bombOn&&!busy){const i=aim(e);if(i>=0)useBomb(i)}});
{const dn=Object.keys(prog.stars).map(Number);if(dn.length)prog.unlocked=Math.min(LEVELS.length,Math.max(prog.unlocked,Math.max(...dn)+2))}
$('#sPriv').onclick=()=>{location.href='privacy.html'};
$$('#lbScreen .tab').forEach(b=>{b.onclick=()=>{lbTab=b.dataset.t;$$('#lbScreen .tab').forEach(x=>x.classList.toggle('sel',x===b));loadLb(lbTab)}});
setInterval(tickTimer,250);
$('#share').onclick=doShare;$('#sTut').onclick=showTut;$('#tutNext').onclick=nextTut;$('#tutSkip').onclick=closeTut;
$('#sMusic').onclick=()=>{setMusic(!musicOn);showSettings()};$('#sSfx').onclick=toggleMuted;
try{skin=localStorage.getItem('blox-skin')||'classic'}catch(e){}
if(!SKINS.includes(skin))skin='classic';
document.documentElement.dataset.skin=skin;
addEventListener('pointerdown',()=>{if(musicOn)startMusic()},{once:true});
if(typeof document!=='undefined'&&document.addEventListener)document.addEventListener('visibilitychange',()=>{if(!document.hidden&&musicOn)startMusic()});
applyI18n();buildPw();
if(!load())startMode('classic');
if(migrate){secSet('blox-best',best);saveDaily();saveProg();save();try{localStorage.setItem('blox-sec','1')}catch(e){}}
ensureMis();checkAch();saveMeta();
initAccount();initAdmin();
showHome();
if(!seenTut&&best===0&&!Object.keys(prog.stars).length)showTut();
initLock();
