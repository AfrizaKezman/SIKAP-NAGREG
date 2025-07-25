"use client";
import { useState, useEffect } from "react";

export default function RiwayatPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/riwayat");
        const json = await res.json();
        if (json.success) setData(json.data);
        else setError(json.message || "Gagal mengambil data riwayat");
      } catch (e) {
        setError("Gagal mengambil data riwayat");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Riwayat Pengarsipan Pegawai</h1>
      {loading ? (
        <div>Memuat data...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[900px] border border-gray-300 text-sm bg-white rounded-lg shadow">
            <thead className="bg-blue-100">
              <tr>
                <th className="border px-2 py-1">Nama</th>
                <th className="border px-2 py-1">NIP</th>
                <th className="border px-2 py-1">Tipe</th>
                <th className="border px-2 py-1">No SK</th>
                <th className="border px-2 py-1">Tgl Efektif</th>
                <th className="border px-2 py-1">Tahun Arsip</th>
                <th className="border px-2 py-1">Bulan Arsip</th>
                <th className="border px-2 py-1">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => {
                const tipeValid = row.tipe === 'PANGKAT' || row.tipe === 'GAJI';
                return (
                  <tr key={idx} className={
                    'transition ' +
                    (!tipeValid ? 'bg-red-100 text-red-700 font-semibold' : 'hover:bg-blue-50')
                  }>
                    <td className="border px-2 py-1">{row.pegawai_id?.nama || '-'}</td>
                    <td className="border px-2 py-1">{row.pegawai_id?.nip || '-'}</td>
                    <td className="border px-2 py-1">{row.tipe || <span className='text-red-600 font-bold'>Wajib diisi</span>}</td>
                    <td className="border px-2 py-1">{row.no_sk}</td>
                    <td className="border px-2 py-1">{row.tgl_efektif ? new Date(row.tgl_efektif).toLocaleDateString() : '-'}</td>
                    <td className="border px-2 py-1">{row.arsipTahun || '-'}</td>
                    <td className="border px-2 py-1">{row.arsipBulan || '-'}</td>
                    <td className="border px-2 py-1">{row.keterangan || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
