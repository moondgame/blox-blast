/* Mendaftarkan service worker agar game bisa jalan offline (hanya di web, bukan di APK) */
if("serviceWorker" in navigator&&location.protocol.startsWith("http")&&location.hostname!=="appassets.local"){navigator.serviceWorker.register("sw.js").catch(()=>{})}
