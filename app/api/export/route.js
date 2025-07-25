import * as XLSX from "xlsx";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Pegawai from "@/models/Pegawai";
import NaikGaji from "@/models/NaikGaji";
import NaikPangkat from "@/models/NaikPangkat";
import Riwayat from "@/models/Riwayat";
import XLSX from "xlsx";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tipe = searchParams.get("tipe"); // 'pegawai', 'naikgaji', 'naikpangkat', 'riwayat'
  const tahun = searchParams.get("tahun");
  const bulan = searchParams.get("bulan");
  let Model;
  if (tipe === "pegawai") Model = Pegawai;
  else if (tipe === "naikgaji") Model = NaikGaji;
  else if (tipe === "naikpangkat") Model = NaikPangkat;
  else if (tipe === "riwayat") Model = Riwayat;
  else return NextResponse.json({ error: "Tipe tidak valid" }, { status: 400 });
  await dbConnect();
  let filter = {};
  if (tahun) filter.arsipTahun = parseInt(tahun);
  if (bulan) filter.arsipBulan = parseInt(bulan);
  const data = await Model.find(filter).lean();
  // Convert to worksheet
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, tipe);
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=${tipe}_${tahun || "all"}.xlsx`,
    },
  });
}
