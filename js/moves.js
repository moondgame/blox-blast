/* Menyeret blok dan menempatkannya di papan */
function startDrag(e,i){
  if(over||busy||bombOn)return;
  e.preventDefault();
  const p=pieces[i],el=pieceEl(p,1);el.classList.add('float');
  document.body.appendChild(el);
  drag={i,p,el,r:-1,c:-1};
  trayEl.children[i].style.opacity=.25;
  moveDrag(e);
  addEventListener('pointermove',moveDrag);
  addEventListener('pointerup',endDrag);
  addEventListener('pointercancel',cancelDrag);
}
function moveDrag(e){
  const o=cells[0].getBoundingClientRect(),pitch=cells[1].getBoundingClientRect().left-o.left;
  const w=drag.el.offsetWidth,h=drag.el.offsetHeight;
  const x=e.clientX-w/2,y=e.clientY-h/2-(e.pointerType==='mouse'?8:70);
  drag.el.style.transform=`translate(${x}px,${y}px)`;
  const c=Math.round((x-o.left)/pitch),r=Math.round((y-o.top)/pitch);
  renderBoard();drag.r=-1;
  if(fits(drag.p.s,r,c)){
    drag.r=r;drag.c=c;
    drag.p.s.forEach((row,yy)=>row.forEach((v,xx)=>{
      if(v){const cell=cells[(r+yy)*N+c+xx];cell.style.background=COLORS[drag.p.c-1];cell.classList.add('ghost')}
    }));
    const t=grid.slice();
    drag.p.s.forEach((row,yy)=>row.forEach((v,xx)=>{if(v)t[(r+yy)*N+c+xx]=1}));
    for(let k=0;k<N;k++){
      let rf=true,cf=true;
      for(let j=0;j<N;j++){if(!t[k*N+j])rf=false;if(!t[j*N+k])cf=false}
      for(let j=0;j<N;j++){
        if(rf&&!cells[k*N+j].classList.contains('ghost'))cells[k*N+j].classList.add('will');
        if(cf&&!cells[j*N+k].classList.contains('ghost'))cells[j*N+k].classList.add('will');
      }
    }
  }
}
function stopDrag(){
  removeEventListener('pointermove',moveDrag);
  removeEventListener('pointerup',endDrag);
  removeEventListener('pointercancel',cancelDrag);
  drag.el.remove();
}
function cancelDrag(){stopDrag();drag=null;renderBoard();renderTray()}
function endDrag(){
  const d=drag;stopDrag();drag=null;
  if(d.r<0){renderBoard();renderTray();return}
  place(d);
}
function place({i,p,r,c}){
  takeSnap();
  sfx.place();moves++;
  let n=0;
  p.s.forEach((row,y)=>row.forEach((v,x)=>{if(v){grid[(r+y)*N+c+x]=p.c;n++}}));
  pieces[i]=null;score+=n;if(mode==='level')movesLeft--;
  const full=(f)=>{const out=[];for(let k=0;k<N;k++){let ok=true;for(let j=0;j<N;j++)if(!grid[f(k,j)]){ok=false;break}if(ok)out.push(k)}return out};
  const rows=full((k,j)=>k*N+j),cols=full((k,j)=>j*N+k);
  const kill=new Set();
  rows.forEach(k=>{for(let j=0;j<N;j++)kill.add(k*N+j)});
  cols.forEach(k=>{for(let j=0;j<N;j++)kill.add(j*N+k)});
  const L=rows.length+cols.length;
  renderBoard();
  p.s.forEach((row,y)=>row.forEach((v,x)=>{if(v)cells[(r+y)*N+c+x].classList.add('pop')}));
  if(L){
    linesCleared+=L;const tg=[...kill].filter(i=>targets[i]!==undefined).length;burst(kill);if(L>1)shake();
    meter+=L;let gift='';
    if(meter>=5){meter-=5;const k=ORDER[awardIdx++%3];pw[k]++;gift=' Hadiah: '+NAMA[k];sfx.gift()}
    streak++;score+=L*L*10+(streak-1)*10;busy=true;sfx.clear(L);ev('lines',L);ev('combo',streak);ev('multi',L);if(mode==='timed')timeLeft=Math.min(TMAX,timeLeft+L*3);
    kill.forEach(idx=>cells[idx].classList.add('flash'));
    toast((L>1?L+' garis!':'Garis!')+(streak>1?' Kombo x'+streak:'')+(tg?' +'+tg+' gambar':'')+gift);
    updateScore();renderTray();
    setTimeout(()=>{kill.forEach(clearCell);busy=false;
      if(grid.every(v=>!v)){score+=100;toast('Papan bersih! +100');ev('clean',1)}
      after();},230);
  }else{streak=0;after()}
}
