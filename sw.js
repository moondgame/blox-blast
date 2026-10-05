const CACHE='blox-blast-v15';
const FILES=['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './css/base.css', './css/board.css', './css/buttons.css', './css/controls.css', './css/effects.css', './css/extras.css', './css/leaderboard.css', './css/levels.css', './css/lock.css', './css/overlays.css', './css/powerups.css', './css/progress.css', './css/screens.css', './css/skins.css', './js/audio.js', './js/board.js', './js/config.js', './js/effects.js', './js/hud.js', './js/main.js', './js/meta.js', './js/modes.js', './js/moves.js', './js/online.js', './js/pin.js', './js/powerups.js', './js/screens.js', './js/security.js', './js/settings.js', './js/share.js', './js/state.js', './js/storage.js', './js/sw-register.js', './js/tutorial.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==self.location.origin)return;
  e.respondWith(caches.match(r).then(c=>c||fetch(r).catch(()=>caches.match('./index.html'))));
});
