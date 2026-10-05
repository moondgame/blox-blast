# Blox Blast Mini

Game puzzle blok (ala Block Blast) untuk web, PWA (bisa dipasang dan main offline), dan APK Android.

## Isi proyek
- `index.html`: kerangka halaman (hanya markup).
- `css/`: gaya tampilan per fungsi (`base`, `board`, `skins`, `effects`, `controls`, `screens`, `buttons`, `powerups`, `progress`, `overlays`, `leaderboard`, `extras`, `levels`, `lock`). Urutan pemuatan penting, lihat `index.html`.
- `js/`: kode game per fungsi, dimuat berurutan:
  - `config.js`: bentuk blok, daftar level, pengaturan waktu, dan koneksi Supabase (`ONLINE`).
  - `security.js`: tanda tangan dan validasi data tersimpan.
  - `state.js`, `storage.js`: status game, simpan dan muat.
  - `audio.js`: efek suara, getar, musik latar.
  - `board.js`, `hud.js`, `effects.js`, `moves.js`: papan, tampilan skor, efek, serta seret dan tempatkan blok.
  - `modes.js`: awal game, level, harian, mode waktu, hasil akhir, timer.
  - `meta.js`: pencapaian dan misi harian.
  - `settings.js`, `share.js`, `tutorial.js`: pengaturan, bagikan hasil, tutorial.
  - `online.js`: papan peringkat Supabase.
  - `powerups.js`: bom, acak, undo.
  - `screens.js`: beranda, level, tantangan harian.
  - `pin.js`: kunci PIN.
  - `main.js`: penghubung tombol dan awal aplikasi (harus terakhir).
  - `sw-register.js`: mendaftarkan service worker.
- `sw.js`, `manifest.json`, ikon: PWA dan mode offline. Setiap menambah atau mengubah file, naikkan nomor `CACHE` di `sw.js`.
- `supabase-setup.sql`, `PANDUAN-ONLINE.md`: papan peringkat online.
- `android/` dan `.github/workflows/build-apk.yml`: proyek APK dan build otomatis.

## Upload ke GitHub
1. Upload SEMUA isi folder ini ke repository, termasuk folder `css`, `js`, `android`, dan `.github`.
   (`.github` tersembunyi di beberapa file manager. Jika tidak ikut, buat manual lewat "Add file" > "Create new file" dengan nama `.github/workflows/build-apk.yml`.)
2. Settings > Pages > Source: "Deploy from a branch", branch `main`, folder `/ (root)`.
3. Game terbuka di `https://USERNAME.github.io/NAMA-REPO/`.

## Main offline di HP
Buka link GitHub Pages di Chrome sekali saat online, lalu menu ⋮ > "Install app".

## APK Android
1. Setelah upload, buka tab **Actions**. Workflow "Build APK" jalan otomatis (3-6 menit sampai centang hijau).
2. Buka **Releases** > "Blox Blast Mini (APK terbaru)" > unduh `BloxBlastMini.apk`.
   Tautan tetap: `https://github.com/USERNAME/NAMA-REPO/releases/latest/download/BloxBlastMini.apk`
3. Di HP, buka file APK dan izinkan "Install dari sumber tidak dikenal" jika diminta.

Setiap kali kamu mengubah file game dan push, APK baru terbit otomatis. APK memakai tanda tangan debug: cukup untuk dipasang sendiri, belum untuk Google Play.
Cek keaslian unduhan: `sha256sum -c BloxBlastMini.apk.sha256` (Linux/Mac).

## Papan peringkat online
Lihat `PANDUAN-ONLINE.md`. URL dan kunci Supabase ada di `js/config.js`.

## Keamanan
- Data tersimpan (progres, skor, level, harian, pencapaian) ditandatangani dan divalidasi. Data yang diubah ditolak dan direset.
- Content Security Policy: hanya skrip dari file sendiri, tidak ada skrip inline, koneksi hanya ke domain sendiri dan `*.supabase.co`.
- APK: WebView hanya memuat file bawaan aplikasi, alamat luar diblokir (kecuali data ke Supabase), akses file dan lokasi dimatikan, debugging dan backup dimatikan.
- Kunci PIN (Pengaturan): mengunci tampilan game. Ini pencegah akses santai, bukan enkripsi, karena data game tersimpan di HP.
- Skor papan peringkat diperiksa server (kecepatan, durasi, batas skor), tetapi belum bisa dibuktikan sepenuhnya. Detail di `PANDUAN-ONLINE.md`.
Batasan: game yang berjalan di HP pemain tidak bisa dibuat 100% anti-curang.

## Catatan versi
- v15: file dipecah per fungsi (css/ dan js/), 30 level (level 21-30 punya kotak bergambar, es, dan batas waktu), kunci PIN, pemeriksaan skor di server memakai data langkah/garis/durasi, CSP tanpa skrip inline, APK memuat game lewat alamat https lokal, koneksi Supabase terpasang.
- v14: mode waktu dan papan peringkat online.
- v13: tutorial dan tombol bagikan hasil.
- v12: pencapaian, misi harian, skin blok, musik latar.
- v9-v11: power-up, level 20 lebih mudah, keamanan data.
- v1-v8: game dasar, level, tantangan harian dengan kotak bergambar, beranda, ikon SVG, APK.
