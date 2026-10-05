/* Simpan dan muat game yang sedang berjalan */
function save(){
  if(over){try{localStorage.removeItem(SAVE)}catch(e){}return}
  secSet(SAVE,{grid,pieces,score,streak,mode,lvl,linesCleared,movesLeft,dealIdx,seed,targets,ice,moves,playSecs,pw,meter,awardIdx,timeLeft,dk:dayKey(new Date())});
}
function load(){
  try{
    const d=secGet(SAVE,null);
    if(sane(d)&&d.pieces.some(x=>x)&&(d.mode!=='daily'||(d.dk===dayKey(new Date())&&d.targets))&&(d.mode!=='timed'||d.dk===dayKey(new Date()))&&(d.mode!=='level'||LEVELS[d.lvl])){
      mode=d.mode||'classic';lvl=d.lvl|0;linesCleared=d.linesCleared|0;movesLeft=d.movesLeft|0;dealIdx=d.dealIdx|0;seed=d.seed|0;targets=d.targets||{};ice=d.ice||{};moves=d.moves|0;playSecs=+d.playSecs||0;timeLeft=+d.timeLeft||0;lastT=Date.now();pw=d.pw||{bomb:1,shuffle:1,undo:1};meter=d.meter|0;awardIdx=d.awardIdx|0;snap=null;bombOn=false;boardEl.style.touchAction='';
      if(mode==='daily')touchDaily();
      grid=d.grid;pieces=d.pieces;score=d.score|0;streak=d.streak|0;over=false;busy=false;
      renderBoard();renderTray();updateScore();updateGoal();updatePw();endEl.hidden=true;return true;
    }
  }catch(e){}
  return false;
}
