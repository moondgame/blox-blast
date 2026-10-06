# Panduan akun, penyimpanan online, papan peringkat, dan panel admin (Supabase)

Fitur online: akun pemain (email dan password), progres tersimpan di cloud, papan peringkat, dan panel admin.
Gratis dan tidak butuh server sendiri.

**Status:** URL proyek dan kunci publishable sudah terpasang di `js/config.js`.
Tersisa: langkah 1 sampai 3 di bawah. Tanpa langkah 1, akun dan papan peringkat gagal.

## 1. Jalankan SQL (sekali saja)
1. Buka dashboard Supabase, pilih proyekmu.
2. **SQL Editor** > **New query**.
3. Salin SELURUH isi `supabase-setup.sql`, tempel, klik **Run**. Harus muncul "Success".
4. Aman dijalankan ulang. Versi ini mengganti sistem lama yang berbasis perangkat: skor lama (tanpa akun) tidak ikut tampil di papan peringkat baru.
Jika ada error, kirim pesannya ke pembuat game.

## 2. Atur Authentication
Menu Supabase bisa bernama sedikit berbeda dari yang tertulis di sini. Cari bagian **Authentication**.
1. **Sign In / Providers > Email**: pastikan aktif.
2. **Confirm email** (konfirmasi email):
   - **Mati** (disarankan untuk game kasual): pemain langsung bisa main setelah daftar.
   - **Nyala**: pemain harus klik tautan di email. Layanan email bawaan Supabase sangat dibatasi (hanya beberapa email per jam) dan untuk produksi sebaiknya memakai SMTP sendiri (menu Authentication > SMTP / Emails).
3. **Password**: atur panjang minimal menjadi 8 (game juga memeriksa 8 karakter).
4. **URL Configuration**: isi **Site URL** dengan alamat GitHub Pages game (`https://USERNAME.github.io/NAMA-REPO/`) dan tambahkan alamat yang sama di **Redirect URLs**. Ini dipakai untuk tautan reset password dan konfirmasi email.

## 3. Jadikan akunmu admin
1. Buka game, **Pengaturan > Akun > Daftar** dengan emailmu.
2. Di **SQL Editor**, jalankan (ganti emailnya):

       update public.profiles set role = 'admin'
        where id = (select id from auth.users where email = 'emailkamu@contoh.com');

3. Keluar lalu masuk lagi di game. Di **Pengaturan > Akun** muncul tombol **Panel admin**.
Admin tidak bisa dibuat dari dalam game untuk akun pertama. Itu disengaja supaya tidak ada akun admin bawaan yang bisa ditebak. Admin pertama bisa menjadikan admin lain lewat panel.
JANGAN pernah memberikan akun admin untuk keperluan lain (misalnya untuk peninjau Google Play). Buat akun pemain biasa untuk itu.

## 4. Panel admin
Buka lewat **Pengaturan > Akun > Panel admin**. Panel ini hanya berbahasa Indonesia. Semua tindakan diperiksa lagi di server, jadi mengubah tampilan di HP tidak memberi akses.
- **Ringkasan**: jumlah pemain, diblokir, admin, skor, laporan. Tombol untuk mengosongkan papan harian atau papan waktu hari ini.
- **Pemain**: cari berdasarkan nama atau email. Tombol: **Blokir / Buka blokir** (isi alasan di kolom atas; pemain juga tidak bisa masuk lagi), **Hapus nama** (nama diganti otomatis menjadi "Pemain" + angka), **Jadikan admin / Cabut admin**.
- **Skor**: pilih mode dan tanggal untuk melihat daftar. Tombol: **Sembunyikan / Tampilkan**, **Hapus**, **Isi form**. Formulir **Simpan skor** menambah atau mengubah skor seorang pemain (entri buatan admin tidak punya data langkah, garis, dan durasi).
- **Laporan**: entri yang dilaporkan pemain (tersembunyi otomatis setelah 3 pelapor). Tombol: **Sembunyikan / Tampilkan**, **Abaikan laporan**, **Hapus skor**.
- **Log**: 50 tindakan admin terakhir.
Tombol yang tidak bisa dibatalkan memakai konfirmasi dua kali.

## 5. Uji
1. Daftar akun pemain biasa dengan email lain, main **Mode waktu** sampai habis. Di layar akhir muncul "Skor terkirim".
2. Buka **Papan peringkat**: skor tampil di tab yang sesuai.
3. Masuk di HP kedua dengan akun yang sama: progres ikut terbawa.
4. Di panel admin, blokir akun uji itu: akun tidak bisa masuk lagi dan skornya hilang dari papan peringkat. Buka blokirnya lagi.

Pesan yang sering muncul:
- "Could not find the function public.xxx": SQL langkah 1 belum dijalankan atau gagal sebagian. Jalankan ulang.
- "Failed to fetch" atau "koneksi lambat": cek internet, dan pastikan proyek Supabase tidak sedang dijeda (dashboard menawarkan Restore).
- "Email not confirmed": Confirm email nyala dan pemain belum klik tautan.
- "terlalu cepat", "skor tidak sesuai permainan", dan sejenisnya: pemeriksaan skor di server menolak datanya.

## Cara kerja dan keamanan
- Tabel `profiles`, `saves`, `scores`, `reports`, dan `admin_log` terkunci. Pemain tidak bisa membaca atau menulisnya langsung, hanya lewat fungsi yang memeriksa data. Papan peringkat dibaca lewat tampilan `leaderboard` yang tidak memuat email atau ID akun.
- Setiap pemain hanya bisa menyimpan dan membaca data cloud miliknya sendiri. Data cloud pemain sendiri bisa diubah pemain itu (misalnya bintang level), tetapi itu hanya memengaruhi dirinya. Skor papan peringkat tidak diambil dari data ini.
- Pemeriksaan skor di server menolak: skor terlalu tinggi, terlalu cepat (lebih dari sekitar 3 langkah per detik), durasi melebihi jatah waktu, atau skor yang tidak masuk akal untuk jumlah langkah dan garis yang dilaporkan. Ini memperketat, bukan membuktikan: orang yang paham kode masih bisa mengarang angka yang konsisten. Pembuktian penuh butuh server yang memutar ulang langkah pemain.
- Blokir dilakukan dua lapis: status di tabel profil dan blokir di sistem login Supabase.
- Admin bisa melihat email pemain. Itu tercantum di kebijakan privasi.
- Kunci yang ada di `js/config.js` adalah kunci publishable. JANGAN pernah memasukkan kunci secret atau service_role ke game.
- Nama pemain yang mengandung kata kasar ditolak (daftar singkat di `js/online.js` dan di SQL). Tambahkan kata sesuai kebutuhan di kedua tempat.

## Perintah SQL yang berguna
    -- daftar akun admin
    select p.username, u.email from public.profiles p join auth.users u on u.id = p.id where p.role = 'admin';

    -- skor tertinggi beserta data permainannya
    select p.username, s.mode, s.day, s.score, s.moves, s.lines, s.secs
    from public.scores s join public.profiles p on p.id = s.user_id order by s.score desc limit 50;

    -- hapus satu pemain dan seluruh datanya
    delete from auth.users where id = (select id from public.profiles where username = 'NamaPemain');

Untuk mengubah batas skor, edit angka 20000 / 6000 di fungsi `submit_score` pada `supabase-setup.sql`, lalu jalankan ulang file itu.

## Mengganti proyek Supabase
Edit `const ONLINE` di `js/config.js` (URL proyek dan kunci publishable dari **Project Settings > API Keys**), lalu jalankan `supabase-setup.sql` di proyek baru.

## Batasan lain
- Proyek Supabase gratis bisa dijeda otomatis jika lama tidak ada aktivitas. Jika akun dan papan peringkat gagal, pulihkan proyek lewat dashboard.
- Game tetap bisa dimainkan penuh tanpa akun dan tanpa internet.
