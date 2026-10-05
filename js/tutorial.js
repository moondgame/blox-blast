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
const TUTPW=[['Bom','<circle cx="10" cy="14" r="7"/><path d="M15 9l3-3"/><path d="M18 6l1.5-1.5M20 3.5v-1M22 5h-1"/>'],['Acak','<path d="M3 7h4l10 10h4"/><path d="M3 17h4l3-3"/><path d="M14 10l3-3h4"/><path d="M18 4l3 3-3 3"/><path d="M18 14l3 3-3 3"/>'],['Undo','<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 010 12h-3"/>']];
const TUT=[
{t:'Seret blok ke papan',d:'Tahan salah satu dari tiga blok di bawah papan, seret, lalu lepas di tempat kosong.',
 art:()=>tgrid(2,['#ffa94d','#ffa94d','#ffa94d',''])+TUTARROW+tgrid(5,['','','','','','','gh:#ffa94d','gh:#ffa94d','','','','gh:#ffa94d','','',''])},
{t:'Penuhi baris atau kolom',d:'Baris atau kolom yang penuh akan terhapus dan memberi poin. Menghapus beruntun menghasilkan kombo.',
 art:()=>tgrid(5,['#4dabf7','','#9775fa','','','','#51cf66','','#ffd43b','','ln:#ff6b6b','ln:#ff6b6b','ln:#ff6b6b','ln:#ff6b6b','ln:#ff6b6b'])},
{t:'Gunakan power-up',d:'Bom menghapus area 3x3, Acak mengganti blok, Undo membatalkan langkah. Hapus 5 garis untuk hadiah baru.',
 art:()=>'<div class="tpu">'+TUTPW.map(([n,p])=>'<div>'+IC(p)+n+'</div>').join('')+'</div>'},
{t:'Pilih mode permainan',d:'Klasik tanpa batas. Waktu: kejar skor sebelum waktu habis. Level punya target dan bintang. Harian: hapus semua kotak bergambar.',
 art:()=>[0,1,2].map(i=>'<span class="gi">'+tiSvg(i)+'</span>').join('')}];
function renderTut(){
  const st=TUT[tutI];
  $('#tutArt').innerHTML=st.art();$('#tutT').textContent=st.t;$('#tutD').textContent=st.d;
  $('#tutDots').innerHTML=TUT.map((_,i)=>'<i class="'+(i===tutI?'on':'')+'"></i>').join('');
  $('#tutNext').textContent=tutI===TUT.length-1?'Mulai main':'Lanjut';
  $('#tutSkip').hidden=tutI===TUT.length-1;
}
function showTut(){tutI=0;renderTut();$('#tut').hidden=false}
function nextTut(){if(tutI<TUT.length-1){tutI++;renderTut()}else closeTut()}
function closeTut(){$('#tut').hidden=true;try{localStorage.setItem('blox-tut','1')}catch(e){}}
