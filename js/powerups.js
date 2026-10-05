/* Power-up: bom, acak, undo */
function resetPw(){pw={bomb:1,shuffle:1,undo:1};meter=0;awardIdx=0;snap=null;bombOn=false;boardEl.style.touchAction=''}
function takeSnap(){snap=JSON.stringify({grid,pieces,score,streak,linesCleared,movesLeft,dealIdx,targets,ice,moves,pw,meter,awardIdx})}
function updatePw(){
  ORDER.forEach(k=>{
    const b=$('#p-'+k);
    b.disabled=pw[k]<=0||(k==='undo'&&!snap);
    b.classList.toggle('on',k==='bomb'&&bombOn);
    $('#c-'+k).textContent=pw[k];
  });
  $('#hint').textContent=bombOn?'Sentuh atau geser di papan untuk memilih area bom 3x3, lepas untuk meledakkan.':'Seret blok ke papan. Hapus 5 garis untuk hadiah power-up ('+meter+'/5).';
}
function aim(e){
  const o=cells[0].getBoundingClientRect(),pitch=cells[1].getBoundingClientRect().left-o.left;
  const c=Math.floor((e.clientX-o.left)/pitch),r=Math.floor((e.clientY-o.top)/pitch);
  return(r<0||c<0||r>=N||c>=N)?-1:r*N+c;
}
function area(i){
  const out=[],r0=(i/N)|0,c0=i%N;
  for(let r=r0-1;r<=r0+1;r++)for(let c=c0-1;c<=c0+1;c++)if(r>=0&&c>=0&&r<N&&c<N)out.push(r*N+c);
  return out;
}
function preview(i){renderBoard();if(i>=0)area(i).forEach(k=>cells[k].classList.add('blast'))}
function toggleBomb(){
  if(over||busy||pw.bomb<=0)return;
  bombOn=!bombOn;boardEl.style.touchAction=bombOn?'none':'';
  renderBoard();updatePw();
}
function useBomb(idx){
  const hit=area(idx).filter(k=>grid[k]);
  if(!hit.length){toast('Area kosong');renderBoard();return}
  takeSnap();pw.bomb--;ev('pu',1,'bomb');bombOn=false;boardEl.style.touchAction='';busy=true;
  sfx.bomb();burst(hit);shake();
  hit.forEach(k=>cells[k].classList.add('flash'));
  score+=hit.length*3;
  setTimeout(()=>{
    hit.forEach(clearCell);busy=false;
    if(grid.every(v=>!v)){score+=100;toast('Papan bersih! +100');ev('clean',1)}
    after();
  },230);
}
function doShuffle(){
  if(over||busy||pw.shuffle<=0)return;
  let np=null;
  for(let t=0;t<30;t++){const c=pieces.map(p=>p?newPiece():null);if(c.some(p=>p&&canPlaceAny(p))){np=c;break}}
  if(!np){toast('Tidak bisa diacak');return}
  pieces=np;pw.shuffle--;ev('pu',1,'shuffle');bombOn=false;boardEl.style.touchAction='';
  sfx.shuf();renderBoard();renderTray();updatePw();save();
}
function doUndo(){
  if(over||busy||!snap||pw.undo<=0)return;
  const d=JSON.parse(snap);
  grid=d.grid;pieces=d.pieces;score=d.score;streak=d.streak;linesCleared=d.linesCleared;movesLeft=d.movesLeft;
  dealIdx=d.dealIdx;targets=d.targets;ice=d.ice||{};moves=d.moves|0;pw=d.pw;meter=d.meter;awardIdx=d.awardIdx;
  pw.undo=Math.max(0,pw.undo-1);ev('pu',1,'undo');snap=null;bombOn=false;boardEl.style.touchAction='';
  sfx.undo();renderBoard();renderTray();updateScore();updateGoal();updatePw();save();
}
