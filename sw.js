const CACHE='blox-blast-v18';
const FILES=['./', './index.html', './privacy.html', './delete-account.html', './manifest.json', './icon-192.png', './icon-512.png', './css/account.css', './css/base.css', './css/board.css', './css/buttons.css', './css/controls.css', './css/effects.css', './css/extras.css', './css/leaderboard.css', './css/levels.css', './css/lock.css', './css/overlays.css', './css/powerups.css', './css/progress.css', './css/screens.css', './css/skins.css', './js/account.js', './js/admin.js', './js/audio.js', './js/board.js', './js/config.js', './js/effects.js', './js/hud.js', './js/i18n.js', './js/main.js', './js/meta.js', './js/modes.js', './js/moves.js', './js/online.js', './js/pin.js', './js/powerups.js', './js/screens.js', './js/security.js', './js/settings.js', './js/share.js', './js/state.js', './js/storage.js', './js/sw-register.js', './js/tutorial.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))));self.clients.claim()});
/* Jaringan dulu (supaya update langsung terpakai), cache jika offline atau lambat lebih dari 4 detik */
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==self.location.origin)return;
  e.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    try{
      const net=await Promise.race([fetch(r.url,{cache:'no-cache'}),new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),4000))]);
      if(net&&net.ok)cache.put(r,net.clone());
      return net;
    }catch(err){
      return (await cache.match(r))||(await caches.match('./index.html'));
    }
  })());
});
