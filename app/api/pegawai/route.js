import dbConnect from "@/lib/mongodb";
import Pegawai from "@/models/Pegawai";
import { NextResponse } from "next/server";

const frontendOrder = [
  "nip", "nama", "karpeg", "tempat_tanggal_lahir", "jenis_kelamin", "pendidikan", "sk_dari", "sk_nomor_tanggal", "sk_tmt", "pangkat", "jabatan", "sk_tempat_bekerja", "keterangan"
];

export async function GET(request) {
  try {
    await dbConnect();
    const pegawai = await Pegawai.find({}).sort({ createdAt: -1 });
    // Sertakan _id agar frontend bisa edit/hapus
    const data = pegawai.map(p => {
      const obj = {};
      frontendOrder.forEach(f => { obj[f] = p[f] ?? ""; });
      obj._id = p._id?.toString() || "";
      return obj;
    });
    return NextResponse.json({
      success: true,
      message: "Data pegawai berhasil diambil.",
      data
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Gagal mengambil data pegawai.",
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    // Filter hanya field yang dikenal
    const data = {};
    frontendOrder.forEach(f => { if (body[f] !== undefined) data[f] = body[f]; });
    const pegawai = await Pegawai.create(data);
    return NextResponse.json({
      success: true,
      message: "Pegawai baru berhasil ditambahkan.",
      data: pegawai
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Gagal menambahkan pegawai baru.",
      error: error.message
    }, { status: 400 });
  }
}