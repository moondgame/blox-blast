# Panduan penyimpanan online (papan peringkat Supabase)

Dengan ini skor Tantangan harian dan Mode waktu dari semua pemain bisa dibandingkan.
Gratis dan tidak butuh server sendiri. Waktu pengerjaan sekitar 10 menit.

## 1. Buat proyek Supabase
1. Buka supabase.com, daftar/masuk, lalu klik **New project**.
2. Isi nama (misalnya `blox-blast`), buat password database (simpan), pilih region terdekat (misalnya Singapore), lalu **Create**.
3. Tunggu sekitar 2 menit sampai proyek siap.

## 2. Buat tabel dan aturan keamanan
1. Di menu kiri buka **SQL Editor**, lalu **New query**.
2. Salin SELURUH isi file `supabase-setup.sql`, tempel, lalu klik **Run**.
3. Harus muncul "Success". Jika error, kirim pesannya ke pembuat game.
4. Cek di **Table Editor**: ada tabel `scores` (kosong).

## 3. Ambil URL dan kunci
1. Buka **Project Settings > API Keys** (URL proyek juga ada di dialog **Connect**).
2. Salin **Project URL**, bentuknya `https://xxxxxxxx.supabase.co`.
3. Salin **Publishable key** (diawali `sb_publishable_`). Jika belum ada, klik **Create new API Keys**.
   Kunci lama bernama `anon` juga bisa dipakai, tetapi Supabase akan menghentikannya di akhir 2026.
4. JANGAN PERNAH memakai kunci **secret** atau **service_role**. Kunci itu punya akses penuh dan tidak boleh ada di game.

Kunci publishable aman ada di dalam game karena tabel tidak bisa diakses langsung. Pemain hanya bisa memanggil fungsi `submit_score` yang memeriksa datanya.

## 4. Pasang di game
1. Buka `index.html`, cari baris ini (kata kunci: `const ONLINE`):

       const ONLINE={url:'',key:''};

2. Isi menjadi:

       const ONLINE={url:'https://xxxxxxxx.supabase.co',key:'sb_publishable_xxxxxxxx'};

3. Simpan, upload `index.html` ke GitHub (dan folder `android/` serta `.github/` jika ikut berubah), tunggu deploy dan build APK selesai.

## 5. Uji
1. Buka game, masuk **Papan peringkat**, isi nama, tekan **Simpan**.
2. Main **Mode waktu** sampai habis, atau selesaikan **Tantangan harian**. Di layar akhir muncul "Skor terkirim ke papan peringkat."
3. Buka **Papan peringkat** lagi, skormu muncul di tab yang sesuai.
4. Cek juga di Supabase **Table Editor > scores**.

Jika muncul "Gagal mengirim skor": periksa URL dan kunci sudah benar, ada koneksi internet, dan SQL di langkah 2 sudah sukses.

## Mengelola data
Jalankan di SQL Editor:

    -- hapus skor pemain tertentu (misalnya curang)
    delete from public.scores where name = 'NamaPemain';

    -- kosongkan semua skor
    truncate public.scores;

    -- ubah batas skor maksimal: edit angka 20000 / 6000 di fungsi submit_score
    -- (jalankan ulang bagian fungsi dari supabase-setup.sql setelah mengubah angkanya)

## Batasan keamanan (baca ini)
- Aturan di server membatasi nama, mode, tanggal, rentang skor, dan kecepatan kirim (satu pembaruan per 5 detik per perangkat).
- Skor tetap dihitung di HP pemain, jadi orang yang paham kode masih bisa mengirim skor palsu selama masih di bawah batas maksimal. Untuk kompetisi serius, skor perlu dihitung ulang di server (misalnya Supabase Edge Function yang memutar ulang langkah pemain).
- ID perangkat disimpan di HP pemain dan tidak ditampilkan di papan peringkat. Menghapus data aplikasi membuat ID baru, jadi skor lama tidak terkait lagi.
- Proyek Supabase gratis bisa dijeda otomatis jika lama tidak ada aktivitas. Jika papan peringkat tiba-tiba gagal dimuat, buka dashboard dan pulihkan proyeknya.
- Nama pemain tampil apa adanya. Pantau papan peringkat dan hapus nama yang tidak pantas.
