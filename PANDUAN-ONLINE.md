# Panduan penyimpanan online (papan peringkat Supabase)

Dengan ini skor Tantangan harian dan Mode waktu dari semua pemain bisa dibandingkan.
Gratis dan tidak butuh server sendiri.

**Status:** URL proyek dan kunci publishable sudah terpasang di `js/config.js`.
Yang tersisa hanya menjalankan SQL di proyek Supabase-mu (langkah 1), lalu menguji (langkah 2).

## 1. Buat tabel dan aturan keamanan (sekali saja)
1. Buka dashboard Supabase, pilih proyekmu.
2. Di menu kiri buka **SQL Editor**, lalu **New query**.
3. Salin SELURUH isi file `supabase-setup.sql`, tempel, lalu klik **Run**.
4. Harus muncul "Success. No rows returned". Jika error, kirim pesannya ke pembuat game.
5. Cek di **Table Editor**: ada tabel `scores` (kosong).

File SQL ini versi terbaru dan aman dijalankan ulang. Jika sebelumnya kamu sudah menjalankan versi lama, jalankan lagi file ini. Versi lama otomatis diganti.

## 2. Uji
1. Unggah semua file terbaru ke GitHub, tunggu deploy selesai, lalu buka game.
2. Masuk **Papan peringkat**, isi nama, tekan **Simpan**.
3. Main **Mode waktu** sampai habis, atau selesaikan **Tantangan harian**. Di layar akhir muncul "Skor terkirim ke papan peringkat."
4. Buka **Papan peringkat** lagi: skormu muncul di tab yang sesuai. Cek juga di **Table Editor > scores**.

Jika muncul "Gagal mengirim skor":
- "Failed to fetch" atau "koneksi lambat": cek internet, dan pastikan proyek Supabase tidak sedang dijeda (dashboard akan menawarkan Restore).
- "Could not find the function public.submit_score": SQL di langkah 1 belum dijalankan, atau versi lamanya masih terpakai. Jalankan ulang `supabase-setup.sql`.
- Pesan seperti "terlalu cepat" atau "skor tidak sesuai permainan": pemeriksaan server menolak datanya (lihat bagian pemeriksaan di bawah).

## Mengganti proyek Supabase
Edit `const ONLINE` di `js/config.js`:

    const ONLINE={url:'https://xxxxxxxx.supabase.co',key:'sb_publishable_xxxxxxxx'};

Kunci ada di **Project Settings > API Keys** (Publishable key). Kunci lama bernama `anon` juga bisa dipakai, tetapi Supabase akan menghentikannya di akhir 2026.
JANGAN PERNAH memakai kunci **secret** atau **service_role** di game. Kunci itu punya akses penuh.
Kunci publishable aman ada di dalam game karena tabel tidak bisa diakses langsung. Pemain hanya bisa memanggil fungsi `submit_score`.

## Pemeriksaan skor di server
Game mengirim skor beserta jumlah langkah, jumlah garis, dan lama bermain. Fungsi `submit_score` menolak data yang:
- bermode atau bertanggal tidak valid, atau bernama di luar 2-16 karakter,
- skornya melebihi batas mutlak (20.000 harian, 6.000 waktu),
- terlalu cepat (lebih dari sekitar 3 langkah per detik),
- di mode waktu, lama bermainnya melebihi jatah (90 detik + 3 detik per garis),
- skornya melebihi batas atas yang dihitung dari langkah dan garis yang dilaporkan,
- dikirim lebih sering dari sekali per 5 detik per perangkat.

Ini memperketat, bukan membuktikan. Permainan tetap dijalankan di HP pemain, jadi orang yang paham kode masih bisa mengarang angka langkah, garis, dan durasi yang konsisten dengan skor palsu selama masih di bawah batas. Pembuktian penuh butuh server yang memutar ulang langkah pemain (misalnya Supabase Edge Function), dan itu belum ada.
Data langkah, garis, dan durasi tersimpan di tabel `scores` sehingga kamu bisa memeriksa skor yang mencurigakan.

## Mengelola data
Jalankan di SQL Editor:

    -- lihat skor tertinggi beserta data permainannya
    select name, mode, day, score, moves, lines, secs from public.scores order by score desc limit 50;

    -- hapus skor pemain tertentu
    delete from public.scores where name = 'NamaPemain';

    -- kosongkan semua skor
    truncate public.scores;

Untuk mengubah batas skor, edit angka 20000 / 6000 di fungsi `submit_score` pada `supabase-setup.sql`, lalu jalankan ulang file itu.

## Batasan lain
- ID perangkat disimpan di HP pemain dan tidak ditampilkan di papan peringkat. Menghapus data aplikasi membuat ID baru.
- Proyek Supabase gratis bisa dijeda otomatis jika lama tidak ada aktivitas. Jika papan peringkat gagal dimuat, buka dashboard dan pulihkan proyeknya.
- Nama pemain tampil apa adanya. Pantau papan peringkat dan hapus nama yang tidak pantas.
