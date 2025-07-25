import mongoose from 'mongoose';

const RiwayatSchema = new mongoose.Schema({
  bulan: { type: String, required: true },
  tahun: { type: String, required: true },
  tipe: { type: String, required: true },
  data: { type: Array, required: true },
}, { timestamps: true });

export default mongoose.models.Riwayat || mongoose.model('Riwayat', RiwayatSchema);
