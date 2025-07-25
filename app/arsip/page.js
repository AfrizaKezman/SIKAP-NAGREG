"use client";
import FilterArsip from '@/components/ui/FilterArsip';
import { useState } from 'react';
import ArsipViewer from '@/components/ArsipViewer';

export default function ArsipPage() {
// Proteksi login sudah dihandle oleh middleware JWT
  const [tahun, setTahun] = useState("");
  const [bulan, setBulan] = useState("");
  // Dummy list, ganti dengan data dinamis jika perlu
  const tahunList = ["2025", "2024", "2023"];
  const bulanList = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Arsip Pegawai</h1>
      <FilterArsip tahun={tahun} bulan={bulan} onTahunChange={setTahun} onBulanChange={setBulan} tahunList={tahunList} bulanList={bulanList} />
      <div className="mt-6">
        <ArsipViewer tahun={tahun} bulan={bulan} />
      </div>
    </div>
  );
}
