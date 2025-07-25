import dbConnect from "@/lib/mongodb";
import NaikGaji from "@/models/NaikGaji";
import NaikPangkat from "@/models/NaikPangkat";
import Riwayat from "@/models/Riwayat";
import Pegawai from "@/models/Pegawai";
import { NextResponse } from "next/server";

// Cascade delete: hapus semua data terkait pegawai
export async function DELETE(request, context) {
  const { id } = (await context.params) || {};
  try {
    await dbConnect();
    const pegawai = await Pegawai.findByIdAndDelete(id);
    if (!pegawai) {
      return NextResponse.json({ 
        success: false, 
        message: `Pegawai dengan ID ${id} tidak ditemukan.` 
      }, { status: 404 });
    }
    // Hapus data terkait di NaikGaji, NaikPangkat, Riwayat
    await NaikGaji.deleteMany({ "static.2": pegawai.nip });
    await NaikPangkat.deleteMany({ "static.2": pegawai.nip });
    await Riwayat.deleteMany({ pegawai_id: pegawai._id });
    return NextResponse.json({ 
      success: true, 
      message: "Pegawai dan semua data terkait berhasil dihapus." 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: "Gagal menghapus pegawai dan data terkait.",
      error: error.message 
    }, { status: 400 });
  }
}
