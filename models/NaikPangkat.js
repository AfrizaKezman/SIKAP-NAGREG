import mongoose from 'mongoose';
import Pegawai from './Pegawai';


const NaikPangkatSchema = new mongoose.Schema({
  data: { type: [[mongoose.Schema.Types.Mixed]], required: true },
}, { timestamps: true });

export default mongoose.models.NaikPangkat || mongoose.model('NaikPangkat', NaikPangkatSchema);
