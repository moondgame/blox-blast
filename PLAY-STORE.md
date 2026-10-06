# Menerbitkan ke Google Play

## Status
Proyek sudah memenuhi syarat teknis Google Play per Oktober 2026 (target API 36, format AAB, tanda tangan rilis lewat GitHub Actions, izin internet, kebijakan privasi, hapus data dan lapor konten dalam aplikasi, ikon adaptif, aset toko).
Yang tersisa adalah hal-hal yang hanya bisa kamu lakukan: memilih nama, membuat akun developer, membuat kunci tanda tangan, mengisi formulir di Play Console, dan mengambil screenshot dari HP.

## 0. Putuskan nama dan package SEBELUM upload pertama
- Nama "Blox Blast Mini" sangat mirip dengan game populer "Block Blast". Google bisa menolak atau menurunkan aplikasi yang namanya, ikonnya, atau deskripsinya terlalu mirip aplikasi lain (kebijakan peniruan dan spam). Memakai nama yang jelas berbeda jauh lebih aman.
- `applicationId` (di `android/app/build.gradle`, sekarang `com.bloxblast.mini`) TIDAK BISA diganti setelah aplikasi terbit. Pilih yang unik dan milikmu, misalnya `com.namakamu.namagame`.
- Tempat yang perlu diganti jika kamu memilih nama baru:
  1. `android/app/src/main/res/values/strings.xml` (`app_name`)
  2. `android/app/build.gradle` (`applicationId`)
  3. `manifest.json` (`name`, `short_name`) dan judul di `index.html`, `privacy.html`, `README.md`
  4. Teks dan grafik di folder `store/` (grafik fitur dibuat ulang)
  Beri tahu aku nama barunya dan aku ganti semuanya sekaligus.

## 1. Akun developer
- Daftar di play.google.com/console. Biaya sekali bayar sekitar US$25 dan butuh verifikasi identitas (beberapa hari).
- **Akun pribadi** yang dibuat setelah 13 November 2023 wajib menjalankan **tes tertutup**: minimal 12 penguji yang bergabung terus-menerus selama 14 hari, baru bisa mengajukan akses produksi. Google pernah menetapkan 20 penguji, jadi cek angka terbaru di Play Console. Siapkan waktu sekitar 3 minggu untuk peluncuran pertama.
- **Akun organisasi** tidak terkena syarat tes tertutup, tetapi butuh verifikasi bisnis.
- Mintalah teman atau keluarga memasang aplikasi lewat tautan tes tertutup dan tidak keluar dari tes selama 14 hari.

## 2. Buat kunci tanda tangan (sekali saja)
Di laptop atau Termux (butuh Java):

    keytool -genkeypair -v -keystore upload.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000

Isi password dan data yang diminta. Simpan `upload.jks` dan passwordnya di tempat aman (jangan di-upload ke GitHub). Cadangkan di dua tempat.
Ubah ke teks Base64:
- Linux/Mac/Termux: `base64 -w0 upload.jks`
- Windows PowerShell: `[Convert]::ToBase64String([IO.File]::ReadAllBytes("upload.jks"))`

Di GitHub: repository > Settings > Secrets and variables > Actions > New repository secret. Buat 4 secret:

| Nama | Isi |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | hasil Base64 tadi |
| `KEYSTORE_PASSWORD` | password keystore |
| `KEY_ALIAS` | `upload` |
| `KEY_PASSWORD` | password kunci (sama dengan keystore jika kamu tidak membedakannya) |

Catatan:
- Kunci ini adalah **kunci upload**. Google Play App Signing (aktif otomatis untuk aplikasi baru) menyimpan kunci penandatangan yang sebenarnya, sehingga jika kunci upload hilang, kamu bisa meminta reset lewat dukungan Google.
- APK yang terpasang dari Play dan APK dari GitHub Releases memiliki tanda tangan berbeda. Keduanya tidak bisa saling menimpa. Hapus yang satu sebelum memasang yang lain.

## 3. Build AAB
1. Push ke GitHub. Tab **Actions** menjalankan "Build APK dan AAB".
2. Jika 4 secret sudah ada, hasilnya build rilis bertanda tangan. Buka run yang berhasil, lalu unduh artifact **BloxBlastMini-build**: di dalamnya ada `BloxBlastMini.aab` (untuk Play Console) dan APK rilis.
3. Tanpa secret, workflow hanya membuat APK debug (tidak bisa diunggah ke Play).
4. `versionCode` naik otomatis di setiap build, jadi setiap unggahan baru diterima Play.

## 4. Isi Play Console
**Kebijakan privasi**
- Edit `privacy.html`: ganti `ISI_NAMA_PENGEMBANG` dan `ISI_EMAIL_KAMU@contoh.com`.
- URL yang dimasukkan ke Play Console: `https://USERNAME.github.io/NAMA-REPO/privacy.html`

**App content**
- Iklan: Tidak ada iklan.
- Akses aplikasi: semua fitur tersedia tanpa login.
- Target audiens: 13 tahun ke atas. Jangan pilih kelompok usia anak agar tidak terkena kebijakan Keluarga.
- Rating konten (IARC): jawab jujur. Tidak ada kekerasan, konten dewasa, judi, atau transaksi. Untuk pertanyaan interaksi pengguna, jawab bahwa pemain bisa melihat nama pemain lain (papan peringkat) dan ada fitur lapor.
- Kategori: Game > Puzzle.
- Aplikasi pemerintah, berita, kesehatan, keuangan: Tidak.

**Keamanan data (Data safety)**: jawaban yang sesuai dengan aplikasi ini (periksa lagi nama kategori di formulir, karena Google bisa mengubahnya):

| Pertanyaan | Jawaban |
|---|---|
| Mengumpulkan data? | Ya, hanya jika pemain membuat akun. Dibagikan ke pihak ketiga: tidak (Supabase memproses atas nama kita) |
| Alamat email | Dikumpulkan. Tujuan: manajemen akun, fungsi aplikasi. Wajib jika membuat akun, akun itu sendiri opsional |
| Nama | Dikumpulkan (nama pemain). Tujuan: fungsi aplikasi (papan peringkat) |
| ID pengguna | Dikumpulkan (ID akun acak). Tujuan: fungsi aplikasi, manajemen akun |
| Aktivitas aplikasi | Dikumpulkan (progres, skor, langkah, durasi). Tujuan: fungsi aplikasi |
| Konten buatan pengguna | Nama pemain tampil publik di papan peringkat |
| Lokasi, kontak, foto, file, dll. | Tidak dikumpulkan |
| Data dienkripsi saat dikirim? | Ya (HTTPS) |
| Pengguna bisa meminta penghapusan data? | Ya: tombol Hapus akun di dalam aplikasi dan halaman web `delete-account.html` |
| Iklan dan analitik | Tidak ada |

**Penghapusan akun (wajib karena ada pembuatan akun)**
- Di bagian Data safety, isi URL penghapusan akun: `https://USERNAME.github.io/NAMA-REPO/delete-account.html`.
- Edit `delete-account.html` dan `privacy.html`: ganti `ISI_EMAIL_KAMU@contoh.com`.

**Akses aplikasi (App access)**
- Game bisa dimainkan penuh tanpa login. Fitur yang butuh akun: papan peringkat dan simpanan cloud.
- Pilih "sebagian fitur dibatasi" dan berikan akun PEMAIN BIASA (buat khusus untuk peninjau). JANGAN PERNAH memberikan akun admin.

**Listing toko**
- Ikon 512x512: `store/icon-512.png`
- Grafik fitur 1024x500: `store/feature-graphic-1024x500.png`
- Screenshot ponsel: minimal 2, disarankan 4-8, dari HP asli (sisi 320-3840 px, rasio maksimal 2:1). Ambil: beranda, papan game, mode level, tantangan harian, papan peringkat.
- Judul (maks. 30 karakter), deskripsi singkat (maks. 80), deskripsi lengkap (maks. 4000): lihat di bawah.

### Teks listing (Indonesia)
Judul: `Blox Blast Mini` (ganti jika kamu memilih nama baru)

Singkat:
`Puzzle blok santai: susun blok, hapus baris, kejar skor tertinggi.`

Lengkap:

    Susun blok di papan 8x8, penuhi baris atau kolom untuk menghapusnya, dan kejar skor tertinggi. Mudah dimulai, seru dikuasai.

    FITUR
    - Mode Klasik: main tanpa batas sampai papan penuh.
    - 30 level: target garis, kotak bergambar, es yang harus dihancurkan dua kali, dan batas waktu. Raih sampai 3 bintang.
    - Tantangan harian: papan yang sama untuk semua pemain, hapus semua kotak bergambar.
    - Mode waktu: kejar skor sebelum waktu habis, tiap garis menambah waktu.
    - Power-up: bom 3x3, acak blok, dan undo.
    - Misi harian dan 15 pencapaian.
    - Akun opsional: simpan progres di cloud dan pakai di perangkat lain.
    - Papan peringkat online untuk tantangan harian dan mode waktu.
    - Bahasa Indonesia dan English.
    - 5 gaya blok, musik latar, dan tema terang atau gelap.
    - Kunci PIN opsional.
    - Bisa dimainkan tanpa internet. Tanpa iklan.

    Akun hanya dibutuhkan untuk papan peringkat dan simpanan cloud, dan bisa dihapus kapan saja dari dalam game.

### Listing text (English)
Title: `Blox Blast Mini`

Short: `Relaxing block puzzle: place blocks, clear lines, chase the high score.`

Full:

    Place blocks on an 8x8 board, fill rows or columns to clear them, and chase your best score. Easy to start, fun to master.

    FEATURES
    - Classic mode: play until the board is full.
    - 30 levels with line goals, picture tiles, ice you must break twice, and time limits. Earn up to 3 stars.
    - Daily challenge: the same board for everyone, clear every picture tile.
    - Timed mode: race the clock, every cleared line adds time.
    - Power-ups: 3x3 bomb, shuffle, and undo.
    - Daily missions and 15 achievements.
    - Optional account: save your progress in the cloud and use it on other devices.
    - Online leaderboard for the daily challenge and timed mode.
    - Indonesian and English.
    - 5 block styles, background music, light and dark themes.
    - Optional PIN lock.
    - Works offline. No ads.

    An account is only needed for the leaderboard and cloud save, and you can delete it in the game at any time.

## 5. Uji sebelum dikirim
- Pasang APK rilis di HP asli dan coba semua mode, termasuk tombol kembali, putar layar, dan mode pesawat (offline).
- Coba akun: daftar, masuk, keluar, ganti bahasa, lupa password, hapus akun. Coba papan peringkat: kirim skor, lapor.
- Coba panel admin dengan akun admin milikmu: blokir dan buka blokir akun uji.
- Coba di HP dengan Android 15 atau 16 jika ada: tepi layar dan tombol kembali berubah di versi itu.
- Cek laporan "Pre-launch report" yang dibuat Play Console otomatis setelah unggahan tes.

## 6. Setelah terbit
- Update: ubah file, push, ambil AAB baru dari Actions, unggah ke Play Console.
- Tiap Agustus Google biasanya menaikkan syarat target API. Jika build gagal atau ditolak karena itu, naikkan `targetSdk` dan `compileSdk` serta versi plugin Android.
- Pantau papan peringkat dan hapus entri tidak pantas lewat SQL (lihat `PANDUAN-ONLINE.md`).

## Penyebab penolakan yang sering terjadi
- Nama atau ikon terlalu mirip aplikasi lain (lihat bagian 0).
- Kebijakan privasi tidak terbuka atau tidak sesuai isi aplikasi.
- Formulir Data safety tidak cocok dengan perilaku aplikasi.
- Konten buatan pengguna tanpa fitur lapor (sudah ada di aplikasi ini, tetapi pastikan kamu benar-benar memantau laporan).
- Akun pribadi baru yang belum menyelesaikan tes tertutup.
