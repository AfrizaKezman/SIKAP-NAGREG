"use client";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx"; // Impor pustaka xlsx
import TableInduk from "./TableInduk";
import TableNaikGaji from "./TableNaikGaji";
import TableNaikPangkat from "./TableNaikPangkat";

// Komponen Tombol Unduh yang dapat digunakan kembali
const DownloadButton = ({ onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
  >
    Unduh Arsip (Excel)
  </button>
);

export default function ArsipViewer({ tahun, bulan }) {
  const [induk, setInduk] = useState([]);
  const [naikGaji, setNaikGaji] = useState([]);
  const [naikPangkat, setNaikPangkat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Helper konversi array of array ke array of object
  function arrayToObject(data, headers) {
    if (!Array.isArray(data) || !Array.isArray(headers)) return data;
    return data.map(row => {
      if (!Array.isArray(row)) return row;
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i] ?? ""; });
      return obj;
    });
  }

  useEffect(() => {
    if (!tahun || !bulan) {
      setInduk([]);
      setNaikGaji([]);
      setNaikPangkat([]);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      try {
        const [indukRes, gajiRes, pangkatRes] = await Promise.all([
          fetch(`/api/riwayat?tahun=${tahun}&bulan=${bulan}&tipe=induk`),
          fetch(`/api/riwayat?tahun=${tahun}&bulan=${bulan}&tipe=naikgaji`),
          fetch(`/api/riwayat?tahun=${tahun}&bulan=${bulan}&tipe=naikpangkat`),
        ]);
        const [indukJson, gajiJson, pangkatJson] = await Promise.all([
          indukRes.ok ? indukRes.json() : { data: [] },
          gajiRes.ok ? gajiRes.json() : { data: [] },
          pangkatRes.ok ? pangkatRes.json() : { data: [] },
        ]);
        // Header untuk konversi
        const indukHeader = [
          "NO URUT","NIP PERSETUJUAN","NAMA","KARPEG","TEMPAT DAN TANGGAL LAHIR","JENIS KELAMIN","PENDIDIKAN","SK DARI","SK NOMOR DAN TANGGAL","SK TMT","SK GOL RUANG","SK JABATAN","SK TEMPAT BEKERJA","KETERANGAN"
        ];
        // Selaraskan header dengan TableNaikGaji dan TableNaikPangkat
        const naikGajiHeader = [
          "No Urut", "Nama dan Tempat Tgl Lahir", "a.NIP\nb.KARPEG", "Pangkat Gol Ruang",
          "Tempat Bekerja", "PNS Pusat", "PNS Daerah", "Dari", "Tanggal, Nomor",
          "Masa Kerja Golongan Tahun", "Masa Kerja Golongan Bulan", "Gaji Pokok", "TMT",
          "2025", "2026", "2027", "2028", "2029", "KET."
        ];
        // Sinkronkan tahun dinamis dengan TableNaikPangkat.js
        const tahunNow = new Date().getFullYear();
        const tahunLabels = Array.from({length: 5}, (_, i) => (tahunNow + i).toString());
        const naikPangkatHeader = [
          "No Urut", "Nama dan Tempat Tgl. Lahir", "NIP & Karpeg", "PNS Pusat", "PNS Daerah", "Keputusan Dari", "Keputusan Tanggal & Nomor", "Pangkat", "Gaji Pokok", "TMT", "Masa Kerja Tahun", "Masa Kerja Bulan",
          ...tahunLabels,
          "Keterangan"
        ];
        setInduk(Array.isArray(indukJson.data) && indukJson.data.length > 0 ? arrayToObject(indukJson.data[0].data || [], indukHeader) : []);
        setNaikGaji(Array.isArray(gajiJson.data) && gajiJson.data.length > 0 ? arrayToObject(gajiJson.data[0].data || [], naikGajiHeader) : []);
        // Fallback: jika arrayToObject gagal, tampilkan data mentah
        if (Array.isArray(pangkatJson.data) && pangkatJson.data.length > 0) {
          let arr = pangkatJson.data[0].data || [];
          // Jika data array of object, konversi ke array of array
          if (typeof arr[0] === 'object' && !Array.isArray(arr[0])) {
            arr = arr.map(obj => naikPangkatHeader.map(h => obj[h] ?? ""));
          }
          setNaikPangkat(arr);
        } else {
          setNaikPangkat([]);
        }
      } catch (error) {
        console.error("Gagal mengambil data arsip:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tahun, bulan]);
  
  const handleDownload = () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const wb = XLSX.utils.book_new();
      // Header sinkron dengan tampilan tabel
      const indukHeader = [
        "NO URUT","NIP PERSETUJUAN","NAMA","KARPEG","TEMPAT DAN TANGGAL LAHIR","JENIS KELAMIN","PENDIDIKAN","SK DARI","SK NOMOR DAN TANGGAL","SK TMT","SK GOL RUANG","SK JABATAN","SK TEMPAT BEKERJA","KETERANGAN"
      ];
      const tahunNow = new Date().getFullYear();
      const tahunLabels = Array.from({length: 5}, (_, i) => (tahunNow + i).toString());
      const naikGajiHeader = [
        "No Urut", "Nama dan Tempat Tgl Lahir", "a.NIP\nb.KARPEG", "Pangkat Gol Ruang",
        "Tempat Bekerja", "PNS Pusat", "PNS Daerah", "Dari", "Tanggal, Nomor",
        "Masa Kerja Golongan Tahun", "Masa Kerja Golongan Bulan", "Gaji Pokok", "TMT",
        ...tahunLabels, "KET."
      ];
      const naikPangkatHeader = [
        "No Urut", "Nama dan Tempat Tgl. Lahir", "NIP & Karpeg", "PNS Pusat", "PNS Daerah", "Keputusan Dari", "Keputusan Tanggal & Nomor", "Pangkat", "Gaji Pokok", "TMT", "Masa Kerja Tahun", "Masa Kerja Bulan",
        ...tahunLabels, "Keterangan"
      ];
      // Konversi jika data array of array
      const indukSheetData = Array.isArray(induk) && induk.length > 0 && !induk[0]?.[indukHeader[0]] ? arrayToObject(induk, indukHeader) : induk;
      const naikGajiSheetData = Array.isArray(naikGaji) && naikGaji.length > 0 && !naikGaji[0]?.[naikGajiHeader[0]] ? arrayToObject(naikGaji, naikGajiHeader) : naikGaji;
      const naikPangkatSheetData = Array.isArray(naikPangkat) && naikPangkat.length > 0 && !naikPangkat[0]?.[naikPangkatHeader[0]] ? arrayToObject(naikPangkat, naikPangkatHeader) : naikPangkat;
      // Pastikan urutan field sesuai header
      function sortFields(data, header) {
        return data.map(row => {
          // Output selalu object dengan key sesuai header agar sheet Excel rapi
          const sorted = {};
          header.forEach((h, i) => {
            if (Array.isArray(row)) {
              sorted[h] = row[i] ?? "";
            } else if (typeof row === 'object') {
              sorted[h] = row[h] ?? "";
            } else {
              sorted[h] = "";
            }
          });
          return sorted;
        });
      }
      const wsInduk = XLSX.utils.json_to_sheet(sortFields(indukSheetData, indukHeader));
      const wsNaikGaji = XLSX.utils.json_to_sheet(sortFields(naikGajiSheetData, naikGajiHeader));
      const wsNaikPangkat = XLSX.utils.json_to_sheet(sortFields(naikPangkatSheetData, naikPangkatHeader));
      XLSX.utils.book_append_sheet(wb, wsInduk, "Data Induk Pegawai");
      XLSX.utils.book_append_sheet(wb, wsNaikGaji, "Kenaikan Gaji Berkala");
      XLSX.utils.book_append_sheet(wb, wsNaikPangkat, "Kenaikan Pangkat");
      const fileName = `Arsip_${tahun}_${String(bulan).padStart(2, '0')}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error("Gagal membuat file Excel:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const hasData = induk.length > 0 || naikGaji.length > 0 || naikPangkat.length > 0;

  if (!tahun || !bulan) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-blue-100 animate-fade-in text-center">
          <h2 className="text-xl font-bold text-blue-700 mb-4 animate-pop-in">Arsip Data</h2>
          <div className="text-base text-gray-500 italic">Silakan pilih <span className="font-bold text-blue-700">tahun</span> dan <span className="font-bold text-blue-700">bulan</span> arsip untuk memulai.</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-blue-100 animate-fade-in text-center">
          <h2 className="text-xl font-bold text-blue-700 mb-4 animate-pop-in">Memuat Data Arsip...</h2>
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 animate-fade-in px-0 w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4 animate-pop-in w-full">
        {(() => {
          const bulanNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
          const bulanIdx = parseInt(bulan, 10) - 1;
          const namaBulan = bulanNames[bulanIdx] || bulan;
          return (
            <h1 className="text-xl font-bold text-blue-700 tracking-wide px-4 py-2 rounded-lg border border-blue-100 bg-white">
              Arsip Data <span className="text-blue-600">Bulan</span> <span className="font-bold">{namaBulan}</span> <span className="text-blue-600">Tahun</span> <span className="font-bold">{tahun}</span>
            </h1>
          );
        })()}
        <DownloadButton onClick={handleDownload} disabled={!hasData || isDownloading} />
      </div>

      {!hasData && (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 animate-fade-in text-center">
            <h2 className="text-base font-semibold text-gray-700 mb-2 animate-pop-in">Tidak ada data ditemukan untuk periode ini.</h2>
            <div className="text-base text-gray-500">Coba pilih <span className="font-bold text-blue-700">tahun</span> dan <span className="font-bold text-blue-700">bulan</span> lain.</div>
          </div>
        </div>
      )}

      {induk.length > 0 && (
        <div className="w-full animate-pop-in">
          <h2 className="text-lg font-bold text-blue-700 mb-2">Data Induk Pegawai</h2>
          <TableInduk data={induk} readOnly />
        </div>
      )}

      {naikGaji.length > 0 && (
        <div className="w-full animate-pop-in border-t border-blue-100 pt-4">
          <h2 className="text-lg font-bold text-blue-700 mb-2">Kenaikan Gaji Berkala</h2>
          <TableNaikGaji data={naikGaji} readOnly />
        </div>
      )}

      {naikPangkat.length > 0 && (
        <div className="w-full animate-pop-in border-t border-blue-100 pt-4">
          <h2 className="text-lg font-bold text-blue-700 mb-2">Kenaikan Pangkat</h2>
          <TableNaikPangkat data={naikPangkat} readOnly />
        </div>
      )}
    </div>
  );
}