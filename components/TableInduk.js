"use client";
import React, { useState } from "react";
import Modal from './ui/Modal';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const columnLabels = [
  "NO URUT",
  "NIP PERSETUJUAN",
  "NAMA",
  "KARPEG",
  "TEMPAT DAN TANGGAL LAHIR",
  "JENIS KELAMIN",
  "PENDIDIKAN",
  "SK DARI",
  "SK NOMOR DAN TANGGAL",
  "SK TMT",
  "SK GOL RUANG",
  "SK JABATAN",
  "SK TEMPAT BEKERJA",
  "KETERANGAN",
];

const options = {
  "JENIS KELAMIN": ["", "Laki-laki", "Perempuan"],
  "PENDIDIKAN": ["", "SMA", "D3", "S1", "S2", "S3"],
  "SK GOL RUANG": [
    "",
    "I/a",
    "I/b",
    "II/a",
    "II/b",
    "III/a",
    "III/b",
    "III/c",
    "III/d",
    "IV/a",
    "IV/b",
    "IV/c",
    "IV/d",
  ],
  "SK JABATAN": [
    "",
    "Camat",
    "Sekretaris",
    "Kasi Kesra",
    "Kasi Pemerintahan",
    "Kasi Trantibum",
    "Kasi Ekbang",
    "Kasi PMD",
    "Kasi Kesosbud",
    "Kasi Ketentraman dan Ketertiban Umum",
    "Kasi Pemberdayaan Masyarakat dan Desa",
  ],
  "SK TEMPAT BEKERJA": ["", "Kec. Nagreg"],
};

const initialData = [];

const emptyRow = Array(columnLabels.length).fill("");

const frontendToBackend = {
  "NIP PERSETUJUAN": "nip",
  "NAMA": "nama",
  "KARPEG": "karpeg",
  "TEMPAT DAN TANGGAL LAHIR": "tempat_tanggal_lahir",
  "JENIS KELAMIN": "jenis_kelamin",
  "PENDIDIKAN": "pendidikan",
  "SK DARI": "sk_dari",
  "SK NOMOR DAN TANGGAL": "sk_nomor_tanggal",
  "SK TMT": "sk_tmt",
  "SK GOL RUANG": "pangkat",
  "SK JABATAN": "jabatan",
  "SK TEMPAT BEKERJA": "sk_tempat_bekerja",
  "KETERANGAN": "keterangan"
};

const backendToFrontend = {
  nip: "NIP PERSETUJUAN",
  nama: "NAMA",
  karpeg: "KARPEG",
  tempat_tanggal_lahir: "TEMPAT DAN TANGGAL LAHIR",
  jenis_kelamin: "JENIS KELAMIN",
  pendidikan: "PENDIDIKAN",
  sk_dari: "SK DARI",
  sk_nomor_tanggal: "SK NOMOR DAN TANGGAL",
  sk_tmt: "SK TMT",
  pangkat: "SK GOL RUANG",
  jabatan: "SK JABATAN",
  sk_tempat_bekerja: "SK TEMPAT BEKERJA",
  keterangan: "KETERANGAN"
};

const EmployeeTable = ({ data: propData, readOnly }) => {
  const [data, setData] = useState(propData || []);
  const [showModal, setShowModal] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [form, setForm] = useState(emptyRow);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Tambah: State dan fetch data pegawai untuk autofill
  const [pegawaiList, setPegawaiList] = useState([]);
  // State untuk baris yang dipilih
  const [selectedIdx, setSelectedIdx] = useState(null);
  // Arsip seluruh tabel
  const [showArsipModal, setShowArsipModal] = useState(false);
  const [arsipBulan, setArsipBulan] = useState((new Date().getMonth() + 1).toString());
  const [arsipTahun, setArsipTahun] = useState(new Date().getFullYear().toString());
  const [arsipLoading, setArsipLoading] = useState(false);
  const [arsipError, setArsipError] = useState("");

  // Helper: mapping data backend ke array frontend
  // Tambahkan _id pada setiap baris data (hidden di table, tapi dipakai untuk edit/delete)
  function mapBackendToRow(item, idx) {
    const row = Array(columnLabels.length + 1).fill(""); // +1 untuk _id
    row[0] = idx + 1;
    Object.entries(backendToFrontend).forEach(([back, front]) => {
      const colIdx = columnLabels.indexOf(front);
      if (colIdx !== -1) row[colIdx] = item[back] ?? "";
    });
    row[columnLabels.length] = item._id || ""; // simpan _id di kolom terakhir
    return row;
  }

  // Sinkronisasi data jika propData berubah
  React.useEffect(() => {
    if (propData && Array.isArray(propData)) {
      if (Array.isArray(propData[0])) {
        // Jika data arsip punya kolom lebih banyak dari columnLabels, potong agar sesuai
        const normalized = propData.map(row => {
          if (Array.isArray(row)) {
            return row.slice(0, columnLabels.length);
          } else {
            // Jika row bukan array, bungkus sebagai array agar tidak error
            return [row];
          }
        });
        setData(normalized);
      } else if (typeof propData[0] === 'object') {
        const arr = propData.map((item, idx) => mapBackendToRow(item, idx));
        setData(arr);
      } else {
        setData(propData);
      }
    }
  }, [propData]);

  // Fetch data hanya jika propData tidak diberikan
  React.useEffect(() => {
    if (!propData) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const res = await fetch("/api/pegawai");
          const json = await res.json();
          // Pastikan hasil array of array
          const arr = (json.data || []).map((item, idx) => Array.isArray(item) ? item : mapBackendToRow(item, idx));
          setData(arr);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [propData]);

  React.useEffect(() => {
    const fetchPegawai = async () => {
      try {
        const res = await fetch("/api/pegawai");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setPegawaiList(json.data);
        }
      } catch {}
    };
    fetchPegawai();
  }, []);

  const openAddModal = () => {
    setForm([data.length + 1, ...emptyRow.slice(1)]);
    setEditIdx(null);
    setShowModal(true);
    setError("");
  };

  // Edit: gunakan dataToShow agar index sesuai tampilan (bukan data asli jika ada filter/sort)
  // Cari index asli di data berdasarkan _id dari dataToShow
  const openEditModal = (idx) => {
    const row = dataToShow[idx];
    const id = row[columnLabels.length];
    // Ambil data asli, tapi pastikan _id tetap di posisi terakhir
    const realIdx = data.findIndex(d => d[columnLabels.length] === id);
    let formData = data[realIdx] ? [...data[realIdx]] : [...row];
    formData[columnLabels.length] = id; // pastikan _id ada di posisi terakhir
    setForm(formData);
    setEditIdx(realIdx);
    setShowModal(true);
    setError("");
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(emptyRow);
    setEditIdx(null);
    setSelectedIdx(null);
    setError("");
  };

  const handleChange = (e, i) => {
    const newForm = [...form];
    newForm[i] = e.target.value;
    setForm(newForm);
  };

  // Konfigurasi customClass SweetAlert2
  const swalCustom = {
    customClass: {
      popup: 'rounded-2xl shadow-2xl border border-blue-200',
      confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold shadow',
      cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-lg font-semibold shadow',
      title: 'text-blue-700 font-bold',
      icon: 'text-blue-600',
    },
    buttonsStyling: false
  };

  // CRUD API
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form[1] || !form[2]) {
      setError("NIP dan Nama wajib diisi!");
      await Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'NIP dan Nama wajib diisi!',
        showConfirmButton: true,
        ...swalCustom
      });
      return;
    }
    setLoading(true);
    try {
      let res;
      // Convert array to object for API (semua field yang sesuai skema backend)
      const obj = {};
      Object.entries(frontendToBackend).forEach(([front, back]) => {
        const idx = columnLabels.indexOf(front);
        if (idx !== -1) obj[back] = form[idx];
      });
      if (editIdx === null) {
        res = await fetch("/api/pegawai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(obj),
        });
      } else {
        // Ambil id dari form, jika tidak ada coba ambil dari dataToShow[selectedIdx]
        let id = form[columnLabels.length];
        if (!id && typeof selectedIdx === 'number' && selectedIdx >= 0) {
          const row = dataToShow[selectedIdx];
          id = row && row[columnLabels.length];
        }
        if (!id) throw new Error("ID tidak ditemukan");
        res = await fetch(`/api/pegawai/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(obj),
        });
      }
      if (!res.ok) {
        let msg = "Gagal simpan data pegawai";
        try {
          const errJson = await res.json();
          msg = errJson?.error || errJson?.message || msg;
        } catch {}
        setError(msg);
        await Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: msg,
          showConfirmButton: true,
          ...swalCustom
        });
        return;
      }
      // Ambil ulang data dari backend
      const updated = await fetch("/api/pegawai").then((r) => r.json());
      const arr = (updated.data || []).map((item, idx) => mapBackendToRow(item, idx));
      setData(arr);
      setSelectedIdx(null);
      setEditIdx(null);
      setForm(emptyRow);
      setShowModal(false);
      setError("");
      await Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: editIdx === null ? 'Data berhasil ditambahkan!' : 'Data berhasil diubah!',
        showConfirmButton: false,
        timer: 1500,
        ...swalCustom
      });
    } catch (err) {
      setError(err?.message || "Gagal simpan data pegawai");
      await Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: err?.message || 'Terjadi kesalahan saat menyimpan data pegawai.',
        showConfirmButton: true,
        ...swalCustom
      });
    } finally {
      setLoading(false);
    }
  };
  // Delete: gunakan dataToShow agar index sesuai tampilan (bukan data asli jika ada filter/sort)
  const handleDelete = async (idx) => {
    const result = await Swal.fire({
      title: 'Yakin hapus data ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
      reverseButtons: true,
      ...swalCustom
    });
    if (!result.isConfirmed) return;
    setLoading(true);
    try {
      const row = dataToShow[idx];
      const id = row[columnLabels.length];
      if (!id) throw new Error("ID tidak ditemukan");
      const res = await fetch(`/api/pegawai/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      // Ambil ulang data dari backend
      const updated = await fetch("/api/pegawai").then((r) => r.json());
      const arr = (updated.data || []).map((item, idx) => mapBackendToRow(item, idx));
      setData(arr);
      setSelectedIdx(null);
      await Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Data berhasil dihapus!',
        showConfirmButton: false,
        timer: 1500,
        ...swalCustom
      });
    } catch {
      setError("Gagal hapus data pegawai");
      await Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Terjadi kesalahan saat menghapus data pegawai.',
        showConfirmButton: true,
        ...swalCustom
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModalBgClick = (e) => {
    if (e.target.classList.contains("modal-bg")) {
      closeModal();
    }
  };

  // Handler autofill pegawai
  const handleSelectPegawai = (e) => {
    const idx = e.target.value;
    if (idx === "") return;
    const peg = pegawaiList[idx];
    if (!peg) return;
    const newForm = [...form];
    newForm[columnLabels.indexOf("NIP PERSETUJUAN")] = peg.nip || "";
    newForm[columnLabels.indexOf("NAMA")] = peg.nama || "";
    newForm[columnLabels.indexOf("KARPEG")] = peg.karpeg || "";
    newForm[columnLabels.indexOf("TEMPAT DAN TANGGAL LAHIR")] = peg.tempat_tanggal_lahir || "";
    newForm[columnLabels.indexOf("JENIS KELAMIN")] = peg.jenis_kelamin || "";
    newForm[columnLabels.indexOf("PENDIDIKAN")] = peg.pendidikan || "";
    newForm[columnLabels.indexOf("SK GOL RUANG")] = peg.pangkat || "";
    newForm[columnLabels.indexOf("SK JABATAN")] = peg.jabatan || "";
    newForm[columnLabels.indexOf("SK TEMPAT BEKERJA")] = peg.sk_tempat_bekerja || "";
    setForm(newForm);
  };

  // Komponen Spinner Loading
  function Spinner() {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Gunakan data dari props jika readOnly (untuk arsip), jika tidak pakai state
  const dataToShow = readOnly && Array.isArray(propData) ? propData : data;

  // Tidak ada multi-select logic

  const handleArsipSeluruh = () => {
    setShowArsipModal(true);
  };

  const handleSubmitArsipSeluruh = async () => {
    setArsipLoading(true);
    setArsipError("");
    try {
      // Pastikan data yang dikirim ke arsip adalah array of array
      const arr = dataToShow.map(row => Array.isArray(row) ? row : columnLabels.map(h => row[h] ?? ""));
      const res = await fetch('/api/riwayat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bulan: String(arsipBulan),
          tahun: String(arsipTahun),
          tipe: 'induk',
          data: arr
        })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Gagal mengarsipkan data');
      setShowArsipModal(false);
      await Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data berhasil diarsipkan!', showConfirmButton: false, timer: 1500 });
    } catch (e) {
      setArsipError(e?.message || 'Gagal mengarsipkan data');
    }
    setArsipLoading(false);
  };

  // Dropdown bulan/tahun
  const bulanOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const tahunOptions = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - i).toString());

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
      {/* Modal Arsip Seluruh Tabel */}
      {showArsipModal && (
        <div className="modal-bg fixed inset-0 flex items-center justify-center bg-black/40 z-50 animate-fade-in" onClick={e => { if (e.target.classList.contains('modal-bg')) setShowArsipModal(false); }}>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 min-w-[350px] max-w-[95vw] relative animate-pop-in">
            <button className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-blue-700 transition-all" onClick={() => setShowArsipModal(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-6 text-blue-700 text-center">Arsipkan Data Induk Pegawai</h2>
            <form onSubmit={e => { e.preventDefault(); handleSubmitArsipSeluruh(); }} className="space-y-6">
              <div className="flex flex-col gap-4 mb-4">
                <label className="text-sm font-semibold text-blue-700">Bulan Arsip</label>
                <select className="border px-3 py-2 rounded focus:outline-blue-400 bg-blue-50 text-blue-900 font-semibold transition-all" value={arsipBulan} onChange={e => setArsipBulan(e.target.value)}>
                  {bulanOptions.map(b => <option key={b} value={b}>{new Date(2000, b-1, 1).toLocaleString('id-ID', { month: 'long' })}</option>)}
                </select>
                <label className="text-sm font-semibold text-blue-700">Tahun Arsip</label>
                <select className="border px-3 py-2 rounded focus:outline-blue-400 bg-blue-50 text-blue-900 font-semibold transition-all" value={arsipTahun} onChange={e => setArsipTahun(e.target.value)}>
                  {tahunOptions.map(t => <option key={t} value={t}>{t}</option>)}
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
      <table className="w-full text-base animate-fade-in">
        <thead className="bg-blue-300">
          <tr>
            {/* Tidak ada kolom checkbox multi-select */}
            <th rowSpan={2} className="border px-2 py-1">NO URUT</th>
            <th rowSpan={2} className="border px-2 py-1">NIP PERSETUJUAN</th>
            <th rowSpan={2} className="border px-2 py-1">NAMA</th>
            <th rowSpan={2} className="border px-2 py-1">KARPEG</th>
            <th rowSpan={2} className="border px-2 py-1">TEMPAT DAN TANGGAL LAHIR</th>
            <th rowSpan={2} className="border px-2 py-1">JENIS KELAMIN</th>
            <th rowSpan={2} className="border px-2 py-1">PENDIDIKAN</th>
            <th colSpan={6} className="border px-2 py-1">SURAT KEPUTUSAN</th>
            <th rowSpan={2} className="border px-2 py-1">KETERANGAN</th>
          </tr>
          <tr>
            {/* Tidak ada kolom checkbox multi-select */}
            <th className="border px-2 py-1">DARI</th>
            <th className="border px-2 py-1">NOMOR DAN TANGGAL</th>
            <th className="border px-2 py-1">TMT</th>
            <th className="border px-2 py-1">GOL RUANG</th>
            <th className="border px-2 py-1">JABATAN</th>
            <th className="border px-2 py-1">TEMPAT BEKERJA</th>
          </tr>
        </thead>
        <tbody>
          {dataToShow.map((row, idx) => (
            <tr key={Array.isArray(row) ? row[1] || row[0] || idx : row['NIP PERSETUJUAN'] || row['NO URUT'] || idx} className={`hover:bg-blue-50 transition-all cursor-pointer ${selectedIdx === idx ? 'bg-blue-100' : ''}`} onClick={() => setSelectedIdx(idx)}>
              {columnLabels.map((header, i) => (
                <td className="border px-2 py-1 text-center whitespace-pre-line" key={i}>
                  {Array.isArray(row) ? row[i] : row[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Modal Pop Up */}
      {!readOnly && showModal && (
        <div className="modal-bg fixed inset-0 flex items-center justify-center bg-black/30 z-50 animate-fade-in" onClick={handleModalBgClick}>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 min-w-[350px] max-h-[90vh] overflow-auto relative animate-pop-in">
            <button className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-blue-700 transition-all" onClick={closeModal}>&times;</button>
            <h2 className="text-lg font-bold mb-4 text-blue-700 text-center">{editIdx === null ? "Tambah Data" : "Edit Data"}</h2>
            {error && <div className="mb-2 text-red-600 text-center">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4 mb-4">
                <label className="text-sm font-semibold text-blue-700">Autofill Pegawai</label>
                <select className="border px-3 py-2 rounded focus:outline-blue-400 bg-blue-50 text-blue-900 font-semibold transition-all" onChange={handleSelectPegawai} defaultValue="">
                  <option value="">-- Pilih Pegawai (NIP - Nama) --</option>
                  {pegawaiList.map((p, i) => (
                    <option key={p.nip || p._id || i} value={i}>{p.nip} - {p.nama}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Field dinamis sesuai header */}
                {columnLabels.map((label, i) => (
                  <div key={i} className="flex flex-col">
                    <label className="text-xs font-semibold mb-1 text-blue-700">{label}</label>
                    {options[label] ? (
                      <select
                        className="border px-2 py-1 rounded focus:outline-blue-400 bg-blue-50"
                        value={form[i]}
                        onChange={e => handleChange(e, i)}
                        disabled={i === 0}
                      >
                        {options[label].map((opt, idx) => (
                          <option key={idx} value={opt}>{opt || `Pilih ${label}`}</option>
                        ))}
                      </select>
                    ) : label === "TEMPAT DAN TANGGAL LAHIR" ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="border px-2 py-1 rounded focus:outline-blue-400 bg-blue-50 w-2/3"
                          value={form[i]?.split(",")[0] || ""}
                          onChange={e => {
                            // Gabungkan dengan tanggal jika sudah ada
                            const tanggal = form[i]?.split(",")[1]?.trim() || "";
                            handleChange({ target: { value: e.target.value + (tanggal ? ", " + tanggal : "") } }, i);
                          }}
                          placeholder="Tempat lahir"
                        />
                        <input
                          type="date"
                          className="border px-2 py-1 rounded focus:outline-blue-400 bg-blue-50 w-1/2"
                          value={(() => {
                            const tgl = form[i]?.split(",")[1]?.trim();
                            if (!tgl) return "";
                            // Konversi dari dd-mm-yyyy ke yyyy-mm-dd
                            const m = tgl.match(/(\d{2})-(\d{2})-(\d{4})/);
                            if (m) return `${m[3]}-${m[2]}-${m[1]}`;
                            return "";
                          })()}
                          onChange={e => {
                            const tempat = form[i]?.split(",")[0] || "";
                            const val = e.target.value;
                            // Konversi dari yyyy-mm-dd ke dd-mm-yyyy
                            const m = val.match(/(\d{4})-(\d{2})-(\d{2})/);
                            let tgl = "";
                            if (m) tgl = `${m[3]}-${m[2]}-${m[1]}`;
                            handleChange({ target: { value: tempat + (tgl ? ", " + tgl : "") } }, i);
                          }}
                          placeholder="Tanggal lahir"
                        />
                      </div>
                    ) : label === "SK NOMOR DAN TANGGAL" ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="border px-2 py-1 rounded focus:outline-blue-400 bg-blue-50 w-2/3"
                          value={form[i]?.split(",")[0] || form[i] || ""}
                          onChange={e => {
                            // Gabungkan dengan tanggal jika sudah ada
                            const tanggal = form[i]?.split(",")[1]?.trim() || "";
                            handleChange({ target: { value: e.target.value + (tanggal ? ", " + tanggal : "") } }, i);
                          }}
                          placeholder="Nomor SK"
                        />
                        <input
                          type="date"
                          className="border px-2 py-1 rounded focus:outline-blue-400 bg-blue-50 w-1/2"
                          value={(() => {
                            const tgl = form[i]?.split(",")[1]?.trim();
                            if (!tgl) return "";
                            // Konversi dari dd-mm-yyyy ke yyyy-mm-dd
                            const m = tgl.match(/(\d{2})-(\d{2})-(\d{4})/);
                            if (m) return `${m[3]}-${m[2]}-${m[1]}`;
                            return "";
                          })()}
                          onChange={e => {
                            const nomor = form[i]?.split(",")[0] || form[i] || "";
                            const val = e.target.value;
                            // Konversi dari yyyy-mm-dd ke dd-mm-yyyy
                            const m = val.match(/(\d{4})-(\d{2})-(\d{2})/);
                            let tgl = "";
                            if (m) tgl = `${m[3]}-${m[2]}-${m[1]}`;
                            handleChange({ target: { value: nomor + (tgl ? ", " + tgl : "") } }, i);
                          }}
                          placeholder="Tanggal SK"
                        />
                      </div>
                    ) : label === "SK TMT" ? (
                      <input
                        type="date"
                        className="border px-2 py-1 rounded focus:outline-blue-400 bg-blue-50"
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
                          handleChange({ target: { value: tmt }, persist: () => {} }, i);
                        }}
                        placeholder="Tanggal TMT"
                      />
                    ) : (
                      <input
                        className="border px-2 py-1 rounded focus:outline-blue-400 bg-blue-50"
                        value={form[i]}
                        onChange={e => handleChange(e, i)}
                        placeholder={getExampleValue(frontendToBackend[label]) || getExampleValue(label) || label}
                        readOnly={i === 0}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2 justify-end">
                <button type="submit" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-semibold shadow">Simpan</button>
                <button type="button" className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-semibold shadow" onClick={closeModal}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTable;

// Helper untuk contoh value
function getExampleValue(field) {
  switch (field) {
    case "nip": return "198608081987031002";
    case "nama": return "Oci Lamad, S.Sos, M.Si";
    case "karpeg": return "C01";
    case "tempat_tanggal_lahir": return "Bandung, 01-01-1980";
    case "jenis_kelamin": return "Laki-laki";
    case "pendidikan": return "S1";
    case "sk_dari": return "Bupati Bandung";
    case "sk_nomor_tanggal": return "821.2/1234/2024, 01-01-2024";
    case "sk_tmt": return "01-01-2024";
    case "pangkat": return "III/a";
    case "jabatan": return "Camat";
    case "sk_tempat_bekerja": return "Kec. Nagreg";
    case "keterangan": return "Aktif";
    default: return "";
  }
}
