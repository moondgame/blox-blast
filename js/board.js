/* Papan dan blok: bentuk, pembuatan blok, tampilan papan dan nampan */
/* Menghapus satu sel. Es butuh dua kali terhapus: pertama retak, kedua hancur. */
function clearCell(i){
  if(ice[i]>1){ice[i]--;return}
  delete ice[i];grid[i]=0;delete targets[i];
}
const cellsOf=s=>s.flat().reduce((a,b)=>a+b,0);
const rnd=a=>a[Math.floor(R()*a.length)];
function newPiece(){
  let s;
  for(let t=0;t<3;t++){s=rnd(SHAPES);if(mode!=='classic'||score<400||cellsOf(s)>2||R()<.5)break}
  return{s,c:1+Math.floor(R()*COLORS.length)};
}
function fits(s,r,c){
  for(let y=0;y<s.length;y++)for(let x=0;x<s[0].length;x++)if(s[y][x]){
    const R=r+y,C=c+x;
    if(R<0||C<0||R>=N||C>=N||grid[R*N+C])return false;
  }
  return true;
}
function canPlaceAny(p){for(let r=0;r<N;r++)for(let c=0;c<N;c++)if(fits(p.s,r,c))return true;return false}
function deal(){
  if(seed)R=mulberry(seed+dealIdx*7919);
  dealIdx++;
  for(let t=0;t<(mode==='daily'||mode==='timed'?1:30);t++){pieces=[newPiece(),newPiece(),newPiece()];if(pieces.some(canPlaceAny))break}
}
function pieceEl(p,k){
  const s=p.s,d=document.createElement('div');
  d.className='piece';d.style.setProperty('--k',k);
  d.style.gridTemplateColumns=`repeat(${s[0].length},calc(var(--cs)*${k}))`;
  d.style.gridAutoRows=`calc(var(--cs)*${k})`;
  s.forEach(row=>row.forEach(v=>{
    const e=document.createElement('i');
    if(v)e.style.background=COLORS[p.c-1];else e.style.visibility='hidden';
    d.appendChild(e);
  }));
  return d;
}
function renderBoard(){
  cells.forEach((c,i)=>{
    const col=grid[i]?COLORS[grid[i]-1]:'',tg=grid[i]&&targets[i]!==undefined;
    c.className='cell'+(grid[i]?' on':'')+(tg?' tgt':'')+(grid[i]&&ice[i]?(ice[i]>1?' ice ice2':' ice ice1'):'');
    c.style.background=tg?TURL[targets[i]]+' center/72% no-repeat, '+col:col;
  });
}
function renderTray(){
  trayEl.innerHTML='';
  pieces.forEach((p,i)=>{
    const sl=document.createElement('div');sl.className='slot';
    if(p){sl.appendChild(pieceEl(p,.5));sl.onpointerdown=e=>startDrag(e,i)}
    trayEl.appendChild(sl);
  });
}
