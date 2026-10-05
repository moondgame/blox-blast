/* Efek visual: percikan dan getar papan */
function burst(set){
  if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  set.forEach(idx=>{
    const b=cells[idx].getBoundingClientRect(),col=COLORS[grid[idx]-1]||'#fff';
    for(let k=0;k<3;k++){
      const e=document.createElement('div');
      e.style.cssText=`position:fixed;left:${b.left+b.width/2-4}px;top:${b.top+b.height/2-4}px;width:8px;height:8px;border-radius:50%;background:${col};pointer-events:none;z-index:8`;
      document.body.appendChild(e);
      const a=Math.random()*6.28,d=30+Math.random()*50;
      e.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d}px) scale(.2)`,opacity:0}],{duration:450+Math.random()*250,easing:'ease-out'}).onfinish=()=>e.remove();
    }
  });
}
function shake(){boardEl.animate([{transform:'translate(0)'},{transform:'translate(-5px,2px)'},{transform:'translate(5px,-2px)'},{transform:'translate(-3px,1px)'},{transform:'translate(0)'}],{duration:260})}
