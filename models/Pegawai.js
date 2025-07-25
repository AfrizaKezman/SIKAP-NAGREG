import mongoose from 'mongoose';

const PegawaiSchema = new mongoose.Schema({
  nip: {
    type: String,
    required: [true, 'NIP wajib diisi.'],
    unique: true,
    trim: true,
  },
  nama: {
    type: String,
    required: [true, 'Nama wajib diisi.'],
    trim: true,
  },
  karpeg: {
    type: String,
    trim: true,
  },
  tempat_tanggal_lahir: {
    type: String,
    trim: true,
  },
  jenis_kelamin: {
    type: String,
    trim: true,
  },
  pendidikan: {
    type: String,
    trim: true,
  },
  sk_dari: {
    type: String,
    trim: true,
  },
  sk_nomor_tanggal: {
    type: String,
    trim: true,
  },
  sk_tmt: {
    type: String,
    trim: true,
  },
  pangkat: {
    type: String,
    trim: true,
  },
  jabatan: {
    type: String,
    trim: true,
  },
  sk_tempat_bekerja: {
    type: String,
    trim: true,
  },
  keterangan: {
    type: String,
    trim: true,
  },
  departemen: {
    type: String,
    trim: true,
  },
  gaji: {
    type: Number,
    default: 0,
  },
  tgl_masuk: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['Aktif', 'Pensiun', 'Nonaktif'],
    default: 'Aktif',
  },
  arsipTahun: {
    type: Number,
    default: null,
  },
  arsipBulan: {
    type: Number,
    default: null,
  },
}, { 
  timestamps: true // Otomatis menambahkan field createdAt dan updatedAt
});

export default mongoose.models.Pegawai || mongoose.model('Pegawai', PegawaiSchema);
