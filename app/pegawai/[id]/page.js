import React from 'react';

async function getPegawaiDetail(id) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/pegawai/${id}`);
  if (!res.ok) throw new Error('Gagal mengambil data pegawai');
  return res.json();
}

async function getRiwayatPegawai(id) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/riwayat?pegawaiId=${id}`);
  if (!res.ok) throw new Error('Gagal mengambil riwayat pegawai');
  return res.json();
}

export default async function PegawaiDetailPage({ params }) {
  const { id } = params;
  let pegawai = null;
  let riwayat = [];
  try {
    pegawai = await getPegawaiDetail(id);
    riwayat = await getRiwayatPegawai(id);
  } catch (e) {
    return <div className="p-4 text-red-600">Gagal memuat data pegawai.</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Detail Pegawai</h1>
      <div className="mb-6 border p-4 rounded bg-white">
        <div><b>Nama:</b> {pegawai?.nama}</div>
        <div><b>NIP:</b> {pegawai?.nip}</div>
        <div><b>Jabatan:</b> {pegawai?.jabatan}</div>
        {/* Tambahkan detail lain sesuai kebutuhan */}
      </div>
      <h2 className="text-xl font-semibold mb-2">Riwayat Pangkat & Gaji</h2>
      <div className="border p-4 rounded bg-white overflow-x-auto">
        <table className="min-w-[900px] border border-gray-300 text-sm bg-white rounded-lg shadow">
          <thead className="bg-blue-100">
            <tr>
              <th className="border px-2 py-1">No</th>
              <th className="border px-2 py-1">Tipe</th>
              <th className="border px-2 py-1">Keterangan</th>
              <th className="border px-2 py-1">Tanggal</th>
              <th className="border px-2 py-1">File SK</th>
            </tr>
          </thead>
          <tbody>
            {riwayat.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-2">Tidak ada riwayat.</td></tr>
            ) : (
              riwayat.map((r, i) => (
                <tr key={i} className="hover:bg-blue-50 transition">
                  <td className="border px-2 py-1 text-center">{i + 1}</td>
                  <td className="border px-2 py-1 text-center">{r.tipe}</td>
                  <td className="border px-2 py-1">{r.keterangan}</td>
                  <td className="border px-2 py-1 text-center">{r.tanggal}</td>
                  <td className="border px-2 py-1 text-center">
                    {r.file ? (
                      <a href={`/uploads/sk/${r.file}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Lihat SK</a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Tombol aksi (mutasi, pangkat, gaji) */}
      <div className="mt-4 flex gap-2">
        <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded shadow">Proses Mutasi</button>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow">Proses Kenaikan Pangkat</button>
        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded shadow">Proses Kenaikan Gaji</button>
      </div>
    </div>
  );
}
