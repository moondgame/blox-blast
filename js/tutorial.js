/* Tutorial singkat pemain baru */
let seenTut=false;
try{seenTut=localStorage.getItem('blox-tut')==='1'}catch(e){}
const TUTARROW='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
function tgrid(cols,cells){
  return '<div class="tg" style="grid-template-columns:repeat('+cols+',26px)">'+cells.map(c=>{
    if(!c)return '<i></i>';
    const [k,col]=c.includes(':')?c.split(':'):['f',c];
    return '<i class="f '+(k==='gh'?'gh':k==='ln'?'ln':'')+'" style="background:'+col+'"></i>';
  }).join('')+'</div>';
}
const TUTPW=[['bomb','<circle cx="10" cy="14" r="7"/><path d="M15 9l3-3"/><path d="M18 6l1.5-1.5M20 3.5v-1M22 5h-1"/>'],['shuffle','<path d="M3 7h4l10 10h4"/><path d="M3 17h4l3-3"/><path d="M14 10l3-3h4"/><path d="M18 4l3 3-3 3"/><path d="M18 14l3 3-3 3"/>'],['undo','<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 010 12h-3"/>']];
const TUT=[
{get t(){return t('tut1_t')},get d(){return t('tut1_d')},
 art:()=>tgrid(2,['#ffa94d','#ffa94d','#ffa94d',''])+TUTARROW+tgrid(5,['','','','','','','gh:#ffa94d','gh:#ffa94d','','','','gh:#ffa94d','','',''])},
{get t(){return t('tut2_t')},get d(){return t('tut2_d')},
 art:()=>tgrid(5,['#4dabf7','','#9775fa','','','','#51cf66','','#ffd43b','','ln:#ff6b6b','ln:#ff6b6b','ln:#ff6b6b','ln:#ff6b6b','ln:#ff6b6b'])},
{get t(){return t('tut3_t')},get d(){return t('tut3_d')},
 art:()=>'<div class="tpu">'+TUTPW.map(([n,p])=>'<div>'+IC(p)+t('pu_'+n)+'</div>').join('')+'</div>'},
{get t(){return t('tut4_t')},get d(){return t('tut4_d')},
 art:()=>[0,1,2].map(i=>'<span class="gi">'+tiSvg(i)+'</span>').join('')}];
function renderTut(){
  const st=TUT[tutI];
  $('#tutArt').innerHTML=st.art();$('#tutT').textContent=st.t;$('#tutD').textContent=st.d;
  $('#tutDots').innerHTML=TUT.map((_,i)=>'<i class="'+(i===tutI?'on':'')+'"></i>').join('');
  $('#tutNext').textContent=t(tutI===TUT.length-1?'tut_go':'tut_next');
  $('#tutSkip').hidden=tutI===TUT.length-1;
}
function showTut(){tutI=0;renderTut();$('#tut').hidden=false}
function nextTut(){if(tutI<TUT.length-1){tutI++;renderTut()}else closeTut()}
function closeTut(){$('#tut').hidden=true;try{localStorage.setItem('blox-tut','1')}catch(e){}}
