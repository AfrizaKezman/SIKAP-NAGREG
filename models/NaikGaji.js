import mongoose from 'mongoose';

const NaikGajiSchema = new mongoose.Schema({
  static: { type: [mongoose.Schema.Types.Mixed], required: true },
  arsipTahun: { type: Number, default: null },
  arsipBulan: { type: Number, default: null },
  file_sk_url: { type: String, trim: true },
}, { timestamps: true });

export default mongoose.models.NaikGaji || mongoose.model('NaikGaji', NaikGajiSchema);
