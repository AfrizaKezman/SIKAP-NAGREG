
import dbConnect from "@/lib/mongodb";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

// Skema sederhana, bisa diubah sesuai kebutuhan field TableNaikPangkat
const NaikPangkatSchema = new mongoose.Schema({
  data: { type: [[mongoose.Schema.Types.Mixed]], required: true },
}, { timestamps: true });

const NaikPangkat = mongoose.models.NaikPangkat || mongoose.model("NaikPangkat", NaikPangkatSchema);



export async function GET() {
  try {
    await dbConnect();
    // Ambil dokumen terbaru yang punya field data (array)
    let last = await NaikPangkat.findOne({ data: { $exists: true, $type: 'array' } }).sort({ createdAt: -1 });
    if (!last) {
      // Jika tidak ada, buat dokumen baru kosong
      last = await NaikPangkat.create({ data: [] });
    }
    return NextResponse.json({
      success: true,
      data: last.data,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}



export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    // Selalu simpan sebagai dokumen baru
    const doc = await NaikPangkat.create({ data: body.data });
    return NextResponse.json({ success: true, data: doc.data });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}


export async function PUT(request) {
  try {
    await dbConnect();
    const body = await request.json();
    // Cari dokumen terbaru yang sudah punya field data
    let last = await NaikPangkat.findOne({ data: { $exists: true, $type: 'array' } }).sort({ createdAt: -1 });
    if (!last) {
      // Jika tidak ada, buat baru
      last = await NaikPangkat.create({ data: body.data });
      return NextResponse.json({ success: true, data: last.data });
    }
    last.data = body.data;
    await last.save();
    return NextResponse.json({ success: true, data: last.data });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
