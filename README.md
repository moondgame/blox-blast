# Blox Blast Mini

Game puzzle blok (ala Block Blast) dalam satu halaman HTML. Bisa dimainkan offline.

## Upload ke GitHub
1. Buat repository baru, lalu upload semua file di folder ini (index.html, manifest.json, sw.js, icon-192.png, icon-512.png).
2. Buka Settings > Pages, pilih Source: "Deploy from a branch", branch `main`, folder `/ (root)`, lalu Save.
3. Tunggu sebentar. Game bisa dibuka di `https://USERNAME.github.io/NAMA-REPO/`.

## Main offline di HP
- **Install (disarankan):** buka link GitHub Pages di Chrome HP sekali saat online, lalu menu ⋮ > "Install app" / "Tambahkan ke layar utama". Setelah itu game jalan tanpa internet.
- **Tanpa GitHub:** download `index.html` ke HP dan buka dengan Chrome. Game tetap jalan offline, tetapi tanpa fitur install.

## Catatan versi
- v2: efek suara + getaran (tombol 🔊 untuk mati/nyalakan), tombol ganti tema, progres game tersimpan otomatis, bonus "Papan bersih" (+100), dan potongan kecil lebih jarang muncul saat skor tinggi.
- v3: mode Level (10 level, target hapus garis dengan jumlah blok terbatas, bintang 1-3), Tantangan harian (papan awal dan urutan blok sama tiap hari, ada rekor harian dan hitungan hari beruntun), menu mode (tombol ☰), animasi pop dan percikan saat garis terhapus, getar papan saat kombo, dan sorotan baris yang akan terhapus saat blok digeser.
- v4: tampilan Beranda (Lanjutkan, Klasik, Level, Tantangan harian), layar pilih level dengan kartu bintang, dan layar Tantangan harian (tanggal, hari beruntun, rekor hari ini, riwayat 7 hari). Tombol 🏠 di game kembali ke Beranda.
