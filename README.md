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
- v2: efek suara + getaran (tombol speaker untuk mati/nyalakan), tombol ganti tema, progres game tersimpan otomatis, bonus "Papan bersih" (+100), dan potongan kecil lebih jarang muncul saat skor tinggi.
- v3: mode Level (10 level, target hapus garis dengan jumlah blok terbatas, bintang 1-3), Tantangan harian (papan awal dan urutan blok sama tiap hari, ada rekor harian dan hitungan hari beruntun), menu mode (tombol menu), animasi pop dan percikan saat garis terhapus, getar papan saat kombo, dan sorotan baris yang akan terhapus saat blok digeser.
- v4: tampilan Beranda (Lanjutkan, Klasik, Level, Tantangan harian), layar pilih level dengan kartu bintang, dan layar Tantangan harian (tanggal, hari beruntun, rekor hari ini, riwayat 7 hari). Tombol rumah di game kembali ke Beranda.
- v5: emoji diganti ikon SVG (rumah, speaker, tema, panah kembali, bintang).
- v6: tombol bergradasi dengan bayangan tebal di bawah dan efek tertekan saat disentuh; teks petunjuk diberi jarak tepi.
- v7: proyek Android (folder `android/`) dan workflow GitHub Actions yang membangun APK otomatis.

## Membuat APK Android
1. Upload SEMUA isi folder ini ke repository GitHub, termasuk folder `.github` dan `android`.
   (Folder `.github` tersembunyi di beberapa file manager. Jika tidak ikut terupload, buat manual lewat
   "Add file" > "Create new file", isi nama `.github/workflows/build-apk.yml`, lalu salin isi filenya.)
2. Buka tab **Actions** di repository. Workflow "Build APK" jalan otomatis setiap push ke `main`
   (atau klik "Run workflow"). Tunggu sekitar 3-6 menit sampai centang hijau.
3. Buka **Releases** di halaman utama repository, pilih "Blox Blast Mini (APK terbaru)", lalu unduh `BloxBlastMini.apk`.
   Tautan tetapnya: `https://github.com/USERNAME/NAMA-REPO/releases/latest/download/BloxBlastMini.apk`
4. Di HP Android, buka file APK itu dan izinkan "Install dari sumber tidak dikenal" jika diminta.

APK ini berisi game lengkap dan jalan offline. Setiap kali kamu mengubah `index.html` dan push, APK baru terbit otomatis.
APK memakai tanda tangan debug, cukup untuk dipasang sendiri atau dibagikan, tetapi belum untuk Google Play.
- v8: Tantangan harian punya 5 kotak bergambar (berlian, bintang, hati) yang harus dihapus semua untuk menyelesaikan tantangan. Hari yang selesai ditandai centang di riwayat.
- v9: power-up Bom (hapus area 3x3), Acak (ganti blok yang tersisa), dan Undo (urungkan langkah terakhir). Tiap game mulai dengan 1 buah, dan tiap 5 garis terhapus memberi hadiah power-up bergantian.
- v10: level diperbanyak jadi 20 dan dibuat lebih mudah (blok lebih banyak per target, papan awal lebih lega).
- v11: keamanan (lihat bagian di bawah).

## Keamanan
Game:
- Data tersimpan (progres, skor terbaik, level, tantangan harian) diberi tanda tangan. Kalau diubah lewat DevTools atau cara lain, datanya ditolak dan direset. Data juga divalidasi (bentuk papan, blok, skor, jumlah power-up) sebelum dipakai.
- Content Security Policy membatasi halaman: tidak bisa memuat skrip dari luar dan tidak bisa mengirim data keluar.
- Service worker hanya meng-cache permintaan GET dari domain sendiri.
Aplikasi Android:
- WebView hanya memuat file bawaan aplikasi, semua alamat luar diblokir. Akses file, konten, dan lokasi dimatikan, debugging dimatikan.
- Backup otomatis dimatikan supaya data game tidak bisa diambil lewat backup.
- Setiap build APK disertai file `BloxBlastMini.apk.sha256`. Untuk memeriksa keaslian unduhan: `sha256sum -c BloxBlastMini.apk.sha256` (Linux/Mac) atau bandingkan nilainya dengan hasil `Get-FileHash` (Windows).
Batasan: game yang berjalan di perangkat pemain tidak bisa dibuat 100% anti-curang. Tanda tangan ini menghalangi pengubahan data secara santai, bukan penyerang yang membaca kodenya. Untuk papan peringkat yang adil, skor harus divalidasi di server.
- v12: Pencapaian (15) dan Misi harian (3 misi baru tiap hari, hadiah power-up tambahan di awal game berikutnya), Skin blok (Klasik, Kaca, Piksel, Bola, Neon), dan musik latar yang dibuat langsung oleh game tanpa file audio. Semua ada di Beranda: tombol "Misi dan pencapaian" dan "Pengaturan".
- v13: Tutorial singkat 4 langkah (muncul otomatis untuk pemain baru, bisa dibuka lagi dari Pengaturan > Lihat tutorial) dan tombol Bagikan hasil di layar akhir game. Di APK, tombol Bagikan membuka menu Bagikan bawaan Android lewat jembatan teks `AndroidShare`; di browser memakai Web Share atau menyalin teks ke papan klip.
- v14: Mode waktu (90 detik, +3 detik tiap garis, papan dan urutan blok sama tiap hari) dan Papan peringkat online (Supabase) untuk Tantangan harian dan Mode waktu. Panduan lengkap ada di `PANDUAN-ONLINE.md`, SQL-nya di `supabase-setup.sql`. Papan peringkat baru aktif setelah URL dan kunci diisi di `const ONLINE` pada `index.html`.
