import dbConnect from "@/lib/mongodb";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

// Skema sederhana, bisa diubah sesuai kebutuhan field TableNaikGaji
const NaikGajiSchema = new mongoose.Schema({
  data: { type: [[mongoose.Schema.Types.Mixed]], required: true },
}, { timestamps: true });

const NaikGaji = mongoose.models.NaikGaji || mongoose.model("NaikGaji", NaikGajiSchema);

export async function GET() {
  try {
    await dbConnect();
    const last = await NaikGaji.findOne().sort({ createdAt: -1 });
    return NextResponse.json({
      success: true,
      data: last ? last.data : [],
    });
  } catch (error) {
    console.error("[NaikGaji][GET]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    // Simpan data array baru (selalu simpan sebagai dokumen baru)
    const doc = await NaikGaji.create({ data: body.data });
    return NextResponse.json({ success: true, data: doc.data });
  } catch (error) {
    console.error("[NaikGaji][POST]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const body = await request.json();
    // Update dokumen terakhir
    const last = await NaikGaji.findOne().sort({ createdAt: -1 });
    if (!last) return NextResponse.json({ success: false, message: "Data tidak ditemukan" }, { status: 404 });
    last.data = body.data;
    await last.save();
    return NextResponse.json({ success: true, data: last.data });
  } catch (error) {
    console.error("[NaikGaji][PUT]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
