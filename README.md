# Sistem Manajemen Data Pegawai Kecamatan

Aplikasi web modern berbasis Next.js untuk manajemen data pegawai kecamatan, meliputi Buku Induk, Kenaikan Gaji, Kenaikan Pangkat, dan Arsip. Data tersimpan di MongoDB Atlas dan dapat diakses dengan tampilan profesional, fitur autofill, modal pop up seragam, serta halaman arsip view-only.

## Fitur Utama
- **Buku Induk Pegawai**: CRUD data pegawai, autofill, modal pop up, header multi-baris.
- **Kenaikan Gaji & Pangkat**: CRUD, autofill pegawai, modal seragam, export, filter arsip.
- **Arsip**: View-only, filter tahun/bulan, menampilkan data fix per periode.
- **Tampilan Modern**: UI konsisten, animasi, warna, shadow, responsive.
- **Autofill**: Pilih pegawai, otomatis isi data utama di modal.
- **Export & Filter**: Export ke Excel, filter data arsip per tahun/bulan.

## Struktur Folder
```
app/           # Halaman utama, dashboard, arsip, API route
components/    # Komponen table, modal, autofill, UI
models/        # Skema Mongoose untuk Pegawai, Riwayat, NaikGaji, NaikPangkat
lib/           # Koneksi MongoDB
public/        # File statis, upload SK
```

## Workflow Penggunaan
## Workflow Relasi Data

1. **Buku Induk Pegawai**
   - Sumber utama data pegawai: NIP, nama, pangkat, TMT, dst.
   - Data di sini menjadi dasar autofill untuk tabel Naik Gaji dan Naik Pangkat.

2. **Kenaikan Gaji**
   - Saat tambah/edit, pilih pegawai dari Buku Induk (autofill identitas).
   - Golongan/gaji terbaru di sini akan digunakan untuk autofill Golongan di Naik Pangkat.
   - Setiap perubahan di Naik Gaji akan langsung mempengaruhi autofill di Naik Pangkat.

3. **Kenaikan Pangkat**
   - Pilih pegawai dari Buku Induk (autofill identitas, TMT).
   - Golongan otomatis diambil dari data terbaru Naik Gaji (bukan dari Buku Induk).
   - Workflow: Induk → Naik Gaji → Naik Pangkat (satu arah, saling terhubung).

4. **Arsip/Riwayat**
   - Menyimpan snapshot data pegawai per periode (tahun/bulan).
   - View-only, tidak bisa diubah dari frontend.

### Catatan:
- Jika data pegawai/naik gaji berubah, refresh data di Naik Pangkat agar autofill selalu update.
- Validasi NIP di setiap proses untuk menjaga konsistensi data.
- Semua perubahan berjalan searah dan saling terhubung antar tabel.
1. **Setup Environment**
   - Buat file `.env.local` dan isi dengan `MONGODB_URI` dari MongoDB Atlas.
   - Pastikan IP Anda di-whitelist di Atlas.
2. **Install Dependencies**
   ```bash
   npm install
   ```
3. **Jalankan Development Server**
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000)
4. **Manajemen Data**
   - Tambah/Edit/Hapus pegawai di dashboard.
   - Kenaikan gaji/pangkat: tambah data, autofill pegawai, export, filter arsip.
   - Arsip: pilih tahun/bulan, view-only seluruh perubahan.
5. **Deploy**
   - Deploy ke Vercel atau server lain sesuai dokumentasi Next.js.

## API Endpoint
- `/api/pegawai` : CRUD data pegawai
- `/api/naikgaji` : CRUD data kenaikan gaji
- `/api/naikpangkat` : CRUD data kenaikan pangkat
- `/api/riwayat` : Data riwayat pegawai (arsip)
- `/api/upload` : Upload file SK

## Konfigurasi Database
- Gunakan MongoDB Atlas, pastikan URI dan IP whitelist sudah benar.
- Skema data dapat dilihat di folder `models/`.

## Pengembangan & Kustomisasi
- Komponen UI dapat diubah di folder `components/`.
- API dan skema data dapat dikembangkan sesuai kebutuhan kecamatan.
- Untuk penambahan fitur (filter, export, laporan), modifikasi komponen dan API terkait.

## Troubleshooting
- Jika data tidak tampil, cek koneksi MongoDB Atlas dan whitelist IP.
- Pastikan `.env.local` sudah terisi dan server di-restart setelah perubahan.
- Cek log error di terminal untuk detail masalah.

## Lisensi
Aplikasi ini dikembangkan untuk kebutuhan internal kecamatan. Silakan modifikasi sesuai kebutuhan.
