import dbConnect from "@/lib/mongodb";
import Pegawai from "@/models/Pegawai";
import { NextResponse } from "next/server";

export async function GET(request, context) {
  const { id } = (await context.params) || {};
  try {
    await dbConnect();

    const pegawai = await Pegawai.findById(id);

    if (!pegawai) {
      return NextResponse.json({ 
          success: false, 
          message: `Pegawai dengan ID ${id} tidak ditemukan.` 
      }, { status: 404 });
    }

    return NextResponse.json({ 
        success: true, 
        message: "Detail pegawai berhasil diambil.",
        data: pegawai 
    });
  } catch (error) {
    return NextResponse.json({ 
        success: false, 
        message: "Gagal mengambil detail pegawai.",
        error: error.message 
    }, { status: 500 });
  }
}

export async function PUT(request, context) {
  const { id } = (await context.params) || {};
  try {
    await dbConnect();
    
    const body = await request.json();
    const pegawai = await Pegawai.findByIdAndUpdate(id, body, {
      new: true, // Mengembalikan dokumen yang sudah diperbarui
      runValidators: true, // Menjalankan validasi dari skema
    });

    if (!pegawai) {
      return NextResponse.json({ 
          success: false, 
          message: `Pegawai dengan ID ${id} tidak ditemukan.` 
      }, { status: 404 });
    }

    return NextResponse.json({ 
        success: true, 
        message: "Data pegawai berhasil diperbarui.",
        data: pegawai 
    });
  } catch (error) {
    return NextResponse.json({ 
        success: false, 
        message: "Gagal memperbarui data pegawai.",
        error: error.message 
    }, { status: 400 });
  }
}

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
    return NextResponse.json({ 
        success: true, 
        message: "Pegawai berhasil dihapus." 
    });
  } catch (error) {
    return NextResponse.json({ 
        success: false, 
        message: "Gagal menghapus pegawai.",
        error: error.message 
    }, { status: 400 });
  }
}