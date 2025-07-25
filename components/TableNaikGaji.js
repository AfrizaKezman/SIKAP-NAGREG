"use client";
import React, { useState, useEffect } from "react";
import Modal from "./ui/Modal";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// Konstan dan Helper di luar komponen agar tidak dibuat ulang setiap render
const emptyRow = Array(19).fill(""); // Sesuaikan jumlah kolom
const yearlyLabels = ["2025", "2026", "2027", "2028", "2029"];

const columnLabels = [
  "No Urut", "Nama dan Tempat Tgl Lahir", "a.NIP\nb.KARPEG", "Pangkat Gol Ruang",
  "Tempat Bekerja", "PNS Pusat", "PNS Daerah", "Dari", "Tanggal, Nomor",
  "Masa Kerja Golongan Tahun", "Masa Kerja Golongan Bulan", "Gaji Pokok", "TMT",
  ...yearlyLabels, "KET."
];

// Helper untuk normalisasi data (jika data dari prop berbentuk array of objects)
function normalizeRows(data, headerOrder) {
  if (!Array.isArray(data)) return [];
  if (data.length === 0) return [];

  // Jika sudah array of array, kembalikan langsung
  if (Array.isArray(data[0])) return data;

  // Jika array of object, konversi ke array of array
  if (typeof data[0] === 'object' && data[0] !== null) {
    return data.map(item => headerOrder.map(h => item[h] ?? ''));
  }
  return [];
}

const SalaryTable = ({ data: propData, readOnly }) => {
  // --- STATE MANAGEMENT ---
  const [data, setData] = useState([]);
  const [pegawaiList, setPegawaiList] = useState([]);
  const [selectedPegawai, setSelectedPegawai] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editIdx, setEditIdx] = useState(null); // Index dari state `data`
  const [selectedIdx, setSelectedIdx] = useState(null); // Index dari baris tabel yang terlihat
  const [form, setForm] = useState(emptyRow);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // State untuk Modal Arsip
  const [showArsipModal, setShowArsipModal] = useState(false);
  const [arsipBulan, setArsipBulan] = useState((new Date().getMonth() + 1).toString());
  const [arsipTahun, setArsipTahun] = useState(new Date().getFullYear().toString());
  const [arsipLoading, setArsipLoading] = useState(false);
  const [arsipError, setArsipError] = useState("");

  // --- FETCH DATA FROM API ON MOUNT (if not readOnly) ---
  useEffect(() => {
    if (!readOnly && !propData) {
      const fetchData = async () => {
        try {
          const res = await fetch("/api/naikgaji");
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setData(normalizeRows(json.data, columnLabels));
          }
        } catch (err) {
          console.error("Gagal mengambil data naik gaji:", err);
        }
      };
      fetchData();
    }
  }, [readOnly, propData]);

  // --- DATA FETCHING & SYNCHRONIZATION ---

  // 1. Ambil data pegawai untuk dropdown autofill saat komponen pertama kali dimuat
  useEffect(() => {
    const fetchPegawai = async () => {
      try {
        const res = await fetch("/api/pegawai");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setPegawaiList(json.data);
        }
      } catch (err) {
        console.error("Gagal mengambil data pegawai:", err);
      }
    };
    if (!readOnly) {
        fetchPegawai();
    }
  }, [readOnly]);

  // 2. Sinkronisasi data dari props
  useEffect(() => {
    if (propData && Array.isArray(propData)) {
      const normalized = normalizeRows(propData, columnLabels);
      setData(normalized);
    }
  }, [propData]);


  // --- MODAL & FORM HANDLERS ---

  const openAddModal = () => {
    setEditIdx(null);
    setSelectedPegawai(null);
    const newForm = [...emptyRow];
    newForm[0] = data.length + 1; // Auto-increment No Urut
    setForm(newForm);
    setShowModal(true);
    setError("");
  };

  const openEditModal = (displayIndex) => {
    if (displayIndex === null) return;
    const rowToEdit = dataToShow[displayIndex];
    // Cari index asli di state `data` berdasarkan No Urut
    const realIdx = data.findIndex(d => d[0] === rowToEdit[0]);

    if (realIdx === -1) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Data tidak ditemukan untuk diedit.'});
        return;
    }

    setEditIdx(realIdx);
    setForm([...data[realIdx]]);
    setShowModal(true);
    setError("");
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(emptyRow);
    setEditIdx(null);
    setSelectedPegawai(null);
    setError("");
  };

  const handleChange = (e, index) => {
    const newForm = [...form];
    // Kolom tahun-tahun (indeks 13 hingga 17) adalah checkbox
    if (index >= 13 && index <= 17) {
      newForm[index] = e.target.checked ? '✓' : '';
    } else if (index === 11) { // Gaji Pokok
      let val = e.target.value.replace(/[^\d]/g, "");
      if (val) {
        val = parseInt(val, 10).toLocaleString('id-ID');
        newForm[index] = `Rp. ${val}`;
      } else {
        newForm[index] = '';
      }
    } else {
      newForm[index] = e.target.value;
    }
    setForm(newForm);
  };

  const handleSelectPegawai = (e) => {
    const idx = e.target.value;
    if (idx === "") {
      setSelectedPegawai(null);
      return;
    }
    const peg = pegawaiList[idx];
    setSelectedPegawai(idx);
    const newForm = [...form];
    newForm[1] = `${peg.nama || ""}\n${peg.tempat_tanggal_lahir || ""}`.trim();
    newForm[2] = `${peg.nip || ""}\n${peg.karpeg || ""}`.trim();
    newForm[3] = peg.pangkat || "";
    newForm[4] = peg.sk_tempat_bekerja || "";
    // Ambil TMT dari induk, konversi ke dd-mm-yyyy jika format yyyy-mm-dd
    if (peg.sk_tmt) {
      const m = peg.sk_tmt.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (m) {
        newForm[12] = `${m[3]}-${m[2]}-${m[1]}`;
      } else {
        newForm[12] = peg.sk_tmt;
      }
    }
    setForm(newForm);
  };

  // --- CRUD OPERATIONS ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form[1] || !form[2]) {
      setError("Nama dan NIP wajib diisi!");
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Nama dan NIP wajib diisi!', ...swalCustom });
      return;
    }

    setLoading(true);
    // --- Normalisasi dan autofill dari data induk sebelum simpan ---
    // Ambil data induk pegawai
    let pegawaiInduk = [];
    try {
      const resPegawai = await fetch("/api/pegawai");
      const jsonPegawai = await resPegawai.json();
      pegawaiInduk = Array.isArray(jsonPegawai.data) ? jsonPegawai.data : [];
    } catch {}

    // Helper autofill dari induk
    function autofillFromInduk(row) {
      let arrRow = Array.isArray(row) ? row.slice(0, columnLabels.length) : columnLabels.map((h, i) => row[h] ?? "");
      // NIP di kolom 2
      const nip = (arrRow[2] || "").split("\n")[0];
      const peg = pegawaiInduk.find(p => p.nip === nip);
      if (!peg) return arrRow;
      arrRow[1] = (peg.nama || "") + (peg.tempat_tanggal_lahir ? `\n${peg.tempat_tanggal_lahir}` : "");
      arrRow[3] = peg.pangkat || arrRow[3];
      arrRow[4] = peg.sk_tempat_bekerja || arrRow[4];
      return arrRow;
    }

    let newData;
    if (editIdx === null) {
      newData = [...data, form];
    } else {
      newData = [...data];
      newData[editIdx] = form;
    }
    // Normalisasi dan autofill semua baris
    newData = newData.map((row, idx) => {
      const filled = autofillFromInduk(row);
      return [idx + 1, ...filled.slice(1)];
    });

    try {
      await fetch("/api/naikgaji", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: newData }),
      });
      setData(newData);
      closeModal();
      Swal.fire({
        icon: 'success', title: 'Berhasil',
        text: editIdx === null ? 'Data berhasil ditambahkan!' : 'Data berhasil diubah!',
        timer: 1500, showConfirmButton: false, ...swalCustom
      });
    } catch (err) {
      setError(err?.message || "Gagal simpan data!");
      Swal.fire({ icon: 'error', title: 'Gagal', text: err?.message || 'Gagal simpan data!', ...swalCustom });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (displayIndex) => {
    const result = await Swal.fire({
      title: 'Yakin hapus data ini?', icon: 'warning',
      showCancelButton: true, confirmButtonText: 'Ya, hapus', cancelButtonText: 'Batal',
      reverseButtons: true, ...swalCustom
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    const rowToDelete = dataToShow[displayIndex];
    const realIdx = data.findIndex(d => d[0] === rowToDelete[0]);

    if (realIdx === -1) {
        setLoading(false);
        return Swal.fire({icon: 'error', title: 'Error', text: 'Data tidak ditemukan untuk dihapus.'});
    }

    let newData = data.filter((_, i) => i !== realIdx)
                        .map((row, idx) => [idx + 1, ...row.slice(1)]);

    try {
        await fetch("/api/naikgaji", {
            method: "POST", // Gunakan POST untuk update
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: newData }),
        });
        setData(newData);
        setSelectedIdx(null);
        Swal.fire({
            icon: 'success', title: 'Berhasil', text: 'Data berhasil dihapus!',
            timer: 1500, showConfirmButton: false, ...swalCustom
        });
    } catch (err) {
        setError("Gagal hapus data!");
        Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal hapus data!', ...swalCustom });
    } finally {
        setLoading(false);
    }
  };


  // --- ARSIP & EXPORT ---

  const handleArsipSeluruh = () => {
    setShowArsipModal(true);
  };

  const handleSubmitArsipSeluruh = async () => {
    setArsipLoading(true);
    setArsipError("");
    // Normalisasi dan autofill sebelum arsip
    let pegawaiIndukArsip = [];
    try {
      const resPegawai = await fetch("/api/pegawai");
      const jsonPegawai = await resPegawai.json();
      pegawaiIndukArsip = Array.isArray(jsonPegawai.data) ? jsonPegawai.data : [];
    } catch {}
    function autofillFromIndukArsip(row) {
      let arrRow = Array.isArray(row) ? row.slice(0, columnLabels.length) : columnLabels.map((h, i) => row[h] ?? "");
      const nip = (arrRow[2] || "").split("\n")[0];
      const peg = pegawaiIndukArsip.find(p => p.nip === nip);
      if (!peg) return arrRow;
      arrRow[1] = (peg.nama || "") + (peg.tempat_tanggal_lahir ? `\n${peg.tempat_tanggal_lahir}` : "");
      arrRow[3] = peg.pangkat || arrRow[3];
      arrRow[4] = peg.sk_tempat_bekerja || arrRow[4];
      return arrRow;
    }
    const arsipArr = Array.isArray(dataToShow) ? dataToShow.map(row => autofillFromIndukArsip(row)) : [];
    try {
      const res = await fetch('/api/riwayat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bulan: String(arsipBulan),
          tahun: String(arsipTahun),
          tipe: 'naikgaji',
          data: arsipArr,
        })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Gagal mengarsipkan data');
      setShowArsipModal(false);
      Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data berhasil diarsipkan!', timer: 1500, showConfirmButton: false });
    } catch (e) {
      setArsipError(e?.message || 'Gagal mengarsipkan data');
    } finally {
      setArsipLoading(false);
    }
  };

  const handleExport = () => {
    const params = new URLSearchParams({
        tipe: 'naikgaji',
        tahun: arsipTahun,
        bulan: arsipBulan,
    });
    const url = `/api/export?${params.toString()}`;
    window.open(url, "_blank");
  };


  // --- UI HELPERS & RENDER LOGIC ---

  const handleModalBgClick = (e) => {
    if (e.target.classList.contains("modal-bg")) {
      closeModal();
    }
  };

  const swalCustom = {
    customClass: {
      popup: 'rounded-2xl shadow-2xl border border-blue-200',
      confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold shadow',
      cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-lg font-semibold shadow',
      title: 'text-blue-700 font-bold',
    },
    buttonsStyling: false
  };

  const Spinner = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const getExampleValue = (label) => {
    const examples = {
        "Nama dan Tempat Tgl Lahir": "Nama Pegawai\nTempat, Tanggal Lahir",
        "a.NIP\nb.KARPEG": "199001012020121001\nZ123456",
        "Gaji Pokok": "5000000",
        "TMT": "2025-03-01",
    };
    return examples[label] || "";
  };

  const options = {
    "Pangkat Gol Ruang": ["", "I/a", "I/b", "I/c", "I/d", "II/a", "II/b", "II/c", "II/d", "III/a", "III/b", "III/c", "III/d", "IV/a", "IV/b", "IV/c", "IV/d", "IV/e"],
    "PNS Pusat": ["", "Ya", "Tidak"],
    "PNS Daerah": ["", "Ya", "Tidak"],
  };

  const dataToShow = readOnly ? normalizeRows(propData, columnLabels) : data;

  return (
    <div className="w-full min-h-[80vh] animate-fade-in">
      {loading && <Spinner />}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4 animate-fade-in">
        <h1 className="text-2xl font-bold text-blue-700 tracking-wide mb-2 md:mb-0"></h1>
        {!readOnly && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={openAddModal}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow transition-all focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                      Tambah
                    </button>
                    <button
                      onClick={() => {
                        if (selectedIdx === null) return Swal.fire({ icon: 'warning', title: 'Pilih baris dulu', text: 'Pilih data yang akan diedit!' });
                        openEditModal(selectedIdx);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold text-base shadow transition-all focus:outline-none focus:ring-2 focus:ring-yellow-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6v-6l9.293-9.293a1 1 0 011.414 0l2.586 2.586a1 1 0 010 1.414L11 21z" /></svg>
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (selectedIdx === null) return Swal.fire({ icon: 'warning', title: 'Pilih baris dulu', text: 'Pilih data yang akan dihapus!' });
                        handleDelete(selectedIdx);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold text-base shadow transition-all focus:outline-none focus:ring-2 focus:ring-red-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      Hapus
                    </button>
                    <button
                      onClick={() => setShowArsipModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold text-base shadow transition-all focus:outline-none focus:ring-2 focus:ring-green-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Arsipkan
                    </button>
                  </div>
                )}
      </div>

      <table className="w-full text-base animate-fade-in">
        <thead className="bg-blue-300 text-black-900 font-bold">
          <tr>
            <th rowSpan={3} className="border px-2 py-2 whitespace-nowrap">NO URUT</th>
            <th rowSpan={3} className="border px-2 py-2">NAMA DAN TEMPAT TGL LAHIR</th>
            <th rowSpan={3} className="border px-2 py-2">a.NIP<br />b.KARPEG</th>
            <th rowSpan={3} className="border px-2 py-2">PANGKAT GOL RUANG</th>
            <th rowSpan={3} className="border px-2 py-2">TEMPAT BEKERJA</th>
            <th colSpan={2} className="border px-2 py-2">P N S</th>
            <th colSpan={6} className="border px-2 py-2">SURAT PEMBERITAHUAN KENAIKAN GAJI BERKALA</th>
            <th colSpan={yearlyLabels.length} className="border px-2 py-2">KENAIKAN PANGKAT TAHUN</th>
            <th rowSpan={3} className="border px-2 py-2">KET.</th>
          </tr>
          <tr>
            <th rowSpan={2} className="border px-2 py-2">PUSAT</th>
            <th rowSpan={2} className="border px-2 py-2">DAERAH</th>
            <th rowSpan={2} className="border px-2 py-2">DARI</th>
            <th rowSpan={2} className="border px-2 py-2">TANGGAL, NOMOR</th>
            <th colSpan={2} className="border px-2 py-2">MASA KERJA GOLONGAN</th>
            <th rowSpan={2} className="border px-8 py-2">GAJI POKOK</th>
            <th rowSpan={2} className="border px-2 py-2">TMT</th>
            {yearlyLabels.map((year) => <th className="border px-2 py-2" rowSpan={2} key={year}>{year}</th>)}
          </tr>
          <tr>
            <th className="border px-2 py-1">TAHUN</th>
            <th className="border px-2 py-1">BULAN</th>
          </tr>
        </thead>
        <tbody>
          {dataToShow.map((row, idx) => (
            <tr
              key={row[0] || idx} // Use a unique key like No Urut
              className={`hover:bg-blue-50 transition-colors duration-200 cursor-pointer ${selectedIdx === idx ? 'bg-blue-100 ring-2 ring-blue-400' : ''}`}
              onClick={() => setSelectedIdx(idx)}
            >
              {row.map((cell, i) => (
                <td className="border px-2 py-2 text-center whitespace-pre-line" key={i}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL ARSIP */}
      {showArsipModal && (
        <div className="modal-bg fixed inset-0 flex items-center justify-center bg-black/40 z-50 animate-fade-in" onClick={e => { if (e.target.classList.contains('modal-bg')) setShowArsipModal(false); }}>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 min-w-[350px] max-w-[95vw] relative animate-pop-in">
            <button className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-blue-700 transition-all" onClick={() => setShowArsipModal(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-6 text-blue-700 text-center">Arsipkan Kenaikan Gaji Berkala</h2>
            <form onSubmit={e => { e.preventDefault(); handleSubmitArsipSeluruh(); }} className="space-y-6">
              <div className="flex flex-col gap-4 mb-4">
                <label className="text-sm font-semibold text-blue-700">Bulan Arsip</label>
                <select className="border px-3 py-2 rounded focus:outline-blue-400 bg-blue-50 text-blue-900 font-semibold transition-all" value={arsipBulan} onChange={e => setArsipBulan(e.target.value)}>
                  {Array.from({ length: 12 }, (_, i) => <option key={i+1} value={i+1}>{new Date(2000, i, 1).toLocaleString('id-ID', { month: 'long' })}</option>)}
                </select>
                <label className="text-sm font-semibold text-blue-700">Tahun Arsip</label>
                <select className="border px-3 py-2 rounded focus:outline-blue-400 bg-blue-50 text-blue-900 font-semibold transition-all" value={arsipTahun} onChange={e => setArsipTahun(e.target.value)}>
                  {Array.from({ length: 10 }, (_, i) => <option key={i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}</option>)}
                </select>
              </div>
              {arsipError && <div className="text-red-600 mb-2 text-center font-semibold animate-fade-in">{arsipError}</div>}
              <div className="flex gap-3 justify-end mt-6">
                <button type="submit" className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-bold text-base transition-all" disabled={arsipLoading}>{arsipLoading ? 'Menyimpan...' : 'Simpan Arsip'}</button>
                <button type="button" className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-bold text-base transition-all" onClick={() => setShowArsipModal(false)} disabled={arsipLoading}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH/EDIT DATA */}
      {!readOnly && showModal && (
        <div className="modal-bg fixed inset-0 flex items-center justify-center bg-black/40 z-50 animate-fade-in" onClick={handleModalBgClick}>
          <div className="bg-white p-4 md:p-8 rounded-2xl shadow-2xl border border-blue-100 w-full max-w-lg md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-auto relative animate-pop-in">
            <button className="absolute top-4 right-4 text-3xl text-gray-400 hover:text-blue-700 transition-all" onClick={closeModal}>&times;</button>
            <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center tracking-wide">{editIdx === null ? "Tambah Data Baru" : "Edit Data"}</h2>
            {error && <div className="mb-4 p-3 text-red-700 bg-red-100 rounded-xl text-base font-semibold animate-fade-in text-center shadow">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col gap-4 mb-2">
                <label className="text-sm font-semibold text-blue-700 mb-1">Pilih Pegawai (autofill)</label>
                <select
                  className="border border-blue-200 px-4 py-2 rounded-lg focus:outline-blue-400 bg-blue-50 text-blue-900 font-semibold transition-all shadow-sm"
                  value={selectedPegawai ?? ''}
                  onChange={handleSelectPegawai}
                >
                  <option value="">-- Pilih NIP / Nama Pegawai --</option>
                  {pegawaiList.map((p, i) => (
                    <option key={p.nip || p._id || i} value={i}>{p.nip} - {p.nama}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {columnLabels.map((label, i) => {
                  if (label === "KET.") return null;
                  const isReadOnlyField = (i === 0 || label === "Tempat Bekerja");
                  return (
                    <div key={i} className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-blue-700 whitespace-pre-line mb-1">{label}</label>
                      {i >= 13 && i <= 17 ? (
                        <input type="checkbox" checked={form[i] === '✓'} onChange={e => handleChange(e, i)} className="w-6 h-6 accent-blue-600 self-start mt-2"/>
                      ) : options[label] ? (
                        <select className="border border-blue-200 px-3 py-2 rounded-lg focus:outline-blue-400 bg-blue-50 text-blue-900 font-semibold transition-all shadow-sm" value={form[i] || ''} onChange={e => handleChange(e, i)} disabled={isReadOnlyField}>
                          {options[label].map((opt, idx) => <option key={idx} value={opt}>{opt || `Pilih ${label}`}</option>)}
                        </select>
                      ) : i === 11 ? (
                        <input className="border border-blue-200 px-3 py-2 rounded-lg focus:outline-blue-400 bg-blue-50 text-blue-900 font-semibold transition-all shadow-sm" type="text" value={form[i] || ''} onChange={e => handleChange(e, i)} placeholder="Rp. 5.000.000" readOnly={isReadOnlyField}/>
                      ) : i === 12 ? (
                        <input
                          type="date"
                          className="border border-blue-200 px-3 py-2 rounded-lg focus:outline-blue-400 bg-blue-50 text-blue-900 font-semibold transition-all shadow-sm"
                          value={(() => {
                            const tmt = form[i];
                            if (!tmt) return "";
                            // Konversi dari dd-mm-yyyy ke yyyy-mm-dd
                            const m = tmt.match(/(\d{2})-(\d{2})-(\d{4})/);
                            if (m) return `${m[3]}-${m[2]}-${m[1]}`;
                            return "";
                          })()}
                          onChange={e => {
                            const val = e.target.value;
                            // Konversi dari yyyy-mm-dd ke dd-mm-yyyy
                            const m = val.match(/(\d{4})-(\d{2})-(\d{2})/);
                            let tmt = "";
                            if (m) tmt = `${m[3]}-${m[2]}-${m[1]}`;
                            handleChange({ target: { value: tmt } }, i);
                          }}
                          placeholder="Tanggal TMT"
                          readOnly={isReadOnlyField}
                        />
                      ) : label.includes("Nama dan") || label.includes("NIP") ? (
                        <textarea className="border border-blue-200 px-3 py-2 rounded-lg focus:outline-blue-400 bg-blue-50 min-h-[50px] text-blue-900 font-semibold transition-all shadow-sm" value={form[i] || ''} onChange={e => handleChange(e, i)} placeholder={getExampleValue(label) || label} readOnly={isReadOnlyField} rows={2}/>
                      ) : (
                        <input className="border border-blue-200 px-3 py-2 rounded-lg focus:outline-blue-400 bg-blue-50 text-blue-900 font-semibold transition-all shadow-sm" type="text" value={form[i] || ''} onChange={e => handleChange(e, i)} placeholder={getExampleValue(label) || label} readOnly={isReadOnlyField}/>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-8 flex gap-4 justify-end">
                <button type="submit" className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold shadow transition-all">Simpan</button>
                <button type="button" className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold shadow transition-all" onClick={closeModal}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryTable;