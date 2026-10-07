/* Mendaftarkan service worker agar game bisa jalan offline (hanya di web, bukan di APK).
   Saat ada versi baru, halaman dimuat ulang otomatis satu kali. */
if("serviceWorker" in navigator&&location.protocol.startsWith("http")&&location.hostname!=="appassets.local"){
  const had=!!navigator.serviceWorker.controller;let rl=false;
  navigator.serviceWorker.addEventListener("controllerchange",()=>{if(had&&!rl){rl=true;location.reload()}});
  navigator.serviceWorker.register("sw.js").then(r=>{if(r&&r.update)r.update()}).catch(()=>{});
}
