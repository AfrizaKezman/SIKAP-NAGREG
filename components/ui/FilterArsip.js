
import React, { useEffect, useState } from "react";

const FilterArsip = ({ tahun, bulan, onTahunChange, onBulanChange }) => {
  // Helper: konversi angka bulan ke nama bulan Indonesia
  function getNamaBulan(b) {
    const bulanArr = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const idx = parseInt(b, 10) - 1;
    return bulanArr[idx] || b;
  }
  const [tahunList, setTahunList] = useState([]);
  const [bulanList, setBulanList] = useState([]);
  useEffect(() => {
    // Fetch tahun dan bulan unik dari arsip
    const fetchFilterOptions = async () => {
      try {
        const res = await fetch("/api/riwayat?filter=unique");
        const json = await res.json();
        if (json.success) {
          setTahunList(json.tahunList || []);
          setBulanList(json.bulanList || []);
        }
      } catch {}
    };
    fetchFilterOptions();
  }, []);

  return (
    <div className="flex gap-2 items-center mb-2">
      <label className="text-sm">Arsip Tahun:</label>
      <select value={tahun || ""} onChange={e => onTahunChange(e.target.value)} className="border rounded px-2 py-1">
        <option value="">Semua</option>
        {tahunList.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <label className="text-sm">Bulan:</label>
      <select value={bulan || ""} onChange={e => onBulanChange(e.target.value)} className="border rounded px-2 py-1">
        <option value="">Semua</option>
        {bulanList.map(b => (
          <option key={b} value={b}>{getNamaBulan(b)}</option>
        ))}
      </select>
    </div>
  );
};

export default FilterArsip;
