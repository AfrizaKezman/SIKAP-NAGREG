
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Riwayat from '../../../models/Riwayat';

// GET: /api/riwayat?bulan=7&tahun=2025&tipe=naikpangkat
export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const filterUnique = searchParams.get('filter');
  if (filterUnique === 'unique') {
    // Ambil tahun dan bulan unik dari arsip
    try {
      const arsipAll = await Riwayat.find({}).lean();
      const tahunSet = new Set();
      const bulanSet = new Set();
      arsipAll.forEach(a => {
        if (a.tahun) tahunSet.add(a.tahun);
        if (a.bulan) bulanSet.add(a.bulan);
      });
      const tahunList = Array.from(tahunSet).sort((a,b)=>b-a);
      const bulanList = Array.from(bulanSet).sort((a,b)=>a-b);
      return NextResponse.json({ success: true, tahunList, bulanList });
    } catch (err) {
      return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
  }
  // ...existing code...
  const bulan = searchParams.get('bulan');
  const tahun = searchParams.get('tahun');
  const tipe = searchParams.get('tipe');
  let filter = {};
  if (bulan) filter.bulan = bulan;
  if (tahun) filter.tahun = tahun;
  if (tipe) filter.tipe = tipe;
  try {
    // Ambil semua arsip yang cocok dengan filter
    const arsipList = await Riwayat.find(filter).sort({ createdAt: -1 }).lean();
    // Mapping khusus untuk tipe naikpangkat agar data array of array dikonversi ke array of object
    if (tipe === 'naikpangkat' && arsipList.length > 0) {
      // Ambil data array of array dari field data
      const mapped = arsipList.map(arsip => {
        // Header sesuai TableNaikPangkat
        const tahunNow = new Date().getFullYear();
        const tahunLabels = Array.from({length: 5}, (_, i) => (tahunNow + i).toString());
        const header = [
          "No Urut", "Nama dan Tempat Tgl. Lahir", "NIP & Karpeg", "PNS Pusat", "PNS Daerah", "Keputusan Dari", "Keputusan Tanggal & Nomor", "Pangkat", "Gaji Pokok", "TMT", "Masa Kerja Tahun", "Masa Kerja Bulan",
          ...tahunLabels,
          "Keterangan"
        ];
        // Pastikan setiap row memiliki panjang yang sama dengan header
        const rows = Array.isArray(arsip.data) ? arsip.data.map(row => {
          let arrRow = Array.isArray(row) ? row.slice(0, header.length) : header.map((h, i) => row[h] ?? "");
          while (arrRow.length < header.length) arrRow.push("");
          const obj = {};
          header.forEach((h, i) => { obj[h] = arrRow[i] ?? ""; });
          return obj;
        }) : [];
        return { ...arsip, data: rows };
      });
      return NextResponse.json({ success: true, data: mapped });
    }
    // Untuk tipe lain, kembalikan data apa adanya
    return NextResponse.json({ success: true, data: arsipList });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
  // Jika tidak ada cabang yang cocok, tetap return response kosong
  return NextResponse.json({ success: true, data: [] });
}

// POST: /api/riwayat
// Body: { bulan, tahun, tipe, data }
export async function POST(req) {
  await dbConnect();
  try {
    const body = await req.json();
    const { bulan, tahun, tipe, data } = body;
    if (!bulan || !tahun || !tipe || typeof data === 'undefined') {
      return NextResponse.json({ success: false, error: 'Field bulan, tahun, tipe, dan data wajib diisi.' }, { status: 400 });
    }
    // Simpan arsip baru
    const arsip = await Riwayat.create({ bulan, tahun, tipe, data });
    return NextResponse.json({ success: true, data: arsip });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
