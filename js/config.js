/* Konfigurasi: bentuk blok, level, ikon, pengaturan waktu, dan koneksi papan peringkat online */
const N=8,COLORS=['#ff6b6b','#ffa94d','#ffd43b','#51cf66','#4dabf7','#9775fa','#f783ac'];
const SHAPES=[[[1]],[[1,1]],[[1,1,1]],[[1,1,1,1]],[[1,1,1,1,1]],[[1],[1]],[[1],[1],[1]],[[1],[1],[1],[1]],[[1],[1],[1],[1],[1]],
[[1,1],[1,1]],[[1,1,1],[1,1,1],[1,1,1]],[[1,1,1],[1,1,1]],[[1,1],[1,1],[1,1]],
[[1,0],[1,1]],[[0,1],[1,1]],[[1,1],[1,0]],[[1,1],[0,1]],
[[1,0,0],[1,0,0],[1,1,1]],[[0,0,1],[0,0,1],[1,1,1]],[[1,1,1],[1,0,0],[1,0,0]],[[1,1,1],[0,0,1],[0,0,1]],
[[1,1,1],[0,1,0]],[[0,1,0],[1,1,1]],[[1,0],[1,1],[1,0]],[[0,1],[1,1],[0,1]]];
const LEVELS=[
{l:2,m:11,p:0},{l:3,m:14,p:2},{l:4,m:18,p:3},{l:5,m:21,p:4},{l:6,m:24,p:5},
{l:6,m:24,p:6},{l:7,m:31,p:6},{l:8,m:31,p:7},{l:8,m:31,p:8},{l:9,m:43,p:8},
{l:10,m:46,p:9},{l:10,m:37,p:10},{l:11,m:41,p:10},{l:12,m:59,p:11},{l:12,m:50,p:11},
{l:13,m:56,p:12},{l:14,m:51,p:12},{l:14,m:66,p:13},{l:15,m:57,p:13},{l:16,m:57,p:14},
/* Level 21-30: l=target garis (0=tanpa), m=batas blok, p=petak awal, gems=kotak bergambar, ice=es (2x hapus), t=batas waktu (detik) */
{l:0,m:22,p:6,gems:3},{l:0,m:26,p:6,ice:4},{l:8,m:30,p:6,t:150},{l:6,m:28,p:8,gems:3},{l:0,m:30,p:9,ice:5,gems:2},
{l:10,m:40,p:10,t:170},{l:8,m:34,p:8,ice:4},{l:0,m:34,p:10,gems:5},{l:10,m:42,p:12,ice:5,gems:3},{l:14,m:55,p:14,ice:6,gems:4,t:240}];
const TI=['<path d="M6.5 3h11l4.5 6.2L12 21 2 9.2z"/><path d="M2 9.2h20M9 3l-2 6.2L12 21M15 3l2 6.2L12 21" fill="none"/>','<path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"/>','<path d="M12 21s-8-5.2-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.8-8 11-8 11z"/>'];
const tiSvg=i=>'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fff" stroke="rgba(0,0,0,.45)" stroke-width="1.4" stroke-linejoin="round">'+TI[i]+'</svg>';
const TURL=[0,1,2].map(i=>'url("data:image/svg+xml,'+encodeURIComponent(tiSvg(i))+'")');
const CHECK='<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const SKINS=['classic','glass','pixel','ball','neon'];
const TMAX=120,T0=90;
const ORDER=['bomb','shuffle','undo'],NAMA=new Proxy({},{get:(_,k)=>t('pu_'+k)});

/* Papan peringkat online (Supabase). Kunci publishable memang aman ada di sini.
   JANGAN PERNAH memasukkan kunci "secret" atau "service_role". Panduan: PANDUAN-ONLINE.md */
const ONLINE={url:'https://qhfsbywjypwlpggtukkc.supabase.co',key:'sb_publishable_LRavnb7Sy0fDPfjYjYlGTA_iC_Szmjd'};
