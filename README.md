Flappy Pon — Game Edukatif Matematika
===================================

Deskripsi
--------
Game kecil berbasis HTML/JS/CSS untuk latihan soal **Turunan Fungsi Trigonometri** yang mencakup:
- Turunan Tingkat Tinggi (turunan ke-2, ke-3, ke-4, dan seterusnya)
- Mencari Nilai dari Suatu Turunan
- Aplikasi Turunan Fungsi Trigonometri:
  - Nilai Maksimum
  - Nilai Minimum
  - Interval Naik
  - Interval Turun
  - Persamaan Garis Singgung

Cara Main
---------
- Tekan Spasi atau klik layar untuk mengepak (terbang).
- Lewati tiang sebanyak mungkin.
- Saat menabrak tiang, akan muncul soal pilihan ganda.
- Jawab benar untuk menambah skor.
- Pemenang ditentukan oleh banyaknya tiang yang dilewati atau banyaknya soal yang terjawab benar.

Fitur
-----
- 50+ soal pilihan ganda dengan jawaban benar bervariasi (A, B, C, D).
- Soal keluar secara acak setiap sesi permainan.
- Posisi jawaban juga diacak agar tidak selalu di posisi yang sama.
- Soal tidak akan berulang sampai semua soal sudah muncul.
- Efek suara untuk feedback jawaban benar/salah.

File utama
---------
- `index.html` — halaman permainan
- `style.css` — gaya
- `script.js` — logika permainan + bank soal + suara

Cara cepat menjalankan lokal
---------------------------
1. Buka terminal (PowerShell) dan jalankan:

```powershell
Set-Location 'd:\Document\Flappy Pon'
python -m http.server 8000
```

2. Buka browser ke `http://localhost:8000` lalu klik Start.

Catatan tentang suara dan autoplay
---------------------------------
Browser memerlukan interaksi pengguna (klik/tombol) untuk mengizinkan suara. Pastikan pemain menekan Start atau klik layar untuk mengaktifkan audio.
