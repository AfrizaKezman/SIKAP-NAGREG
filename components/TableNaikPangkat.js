"use client";
import React, { useState } from "react";
import UploadSK from "./ui/UploadSK";
import FilterArsip from "./ui/FilterArsip";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const tahunNow = new Date().getFullYear();
const tahunLabels = Array.from({ length: 5 }, (_, i) => (tahunNow + i).toString());
const columnLabels = [
  "No Urut", "Nama dan Tempat Tgl. Lahir", "NIP & Karpeg", "PNS Pusat", "PNS Daerah", "Keputusan Dari", "Keputusan Tanggal & Nomor", "Pangkat", "Gaji Pokok", "TMT", "Masa Kerja Tahun", "Masa Kerja Bulan",
  ...tahunLabels,
  "Keterangan"
];

const emptyRow = Array(columnLabels.length).fill("");

const getTmtYear = (tmt) => {
  if (!tmt) return null;
  // Coba format dd-mm-yyyy atau yyyy-mm-dd
  if (/\d{2}-\d{2}-\d{4}/.test(tmt)) return parseInt(tmt.split("-")[2]);
  if (/\d{4}-\d{2}-\d{2}/.test(tmt)) return parseInt(tmt.split("-")[0]);
  return null;
}

const PromotionTable = ({ data: propData, readOnly }) => {
  // Helper untuk mengambil TMT dari data induk dan naik gaji
  function getTMTValue(nip) {
    const peg = pegawaiList.find(p => p.nip === nip);
    let tmt = peg?.sk_tmt || "";
    if (naikGajiList && naikGajiList.length > 0) {
      const filtered = naikGajiList.filter(row => (row[2] || "").split("\n")[0] === nip);
      if (filtered.length > 0) {
        const last = filtered[filtered.length - 1];
        if (last[12]) tmt = last[12];
      }
    }
    return tmt;
  }
  // Helper untuk placeholder contoh nilai
  function getExampleValue(label) {
    const examples = {
      "No Urut": "1",
      "Nama dan Tempat Tgl. Lahir": "Nama Pegawai\nTempat, Tanggal Lahir",
      "NIP & Karpeg": "123456789\n987654321",
      "PNS Pusat": "Ya/Tidak",
      "PNS Daerah": "Ya/Tidak",
      "Keputusan Dari": "Bupati Bandung",
      "Keputusan Tanggal & Nomor": "2025-03-01, 123/XYZ",
      "Pangkat": "Penata Muda",
      "Golongan": "III/a",
      "Gaji Pokok": "Rp. 5.000.000",
      "TMT": "2025-03-01",
      "Masa Kerja Tahun": "5",
      "Masa Kerja Bulan": "6",
      "2017": "TMT 2017",
      "2018": "TMT 2018",
      "2019": "TMT 2019",
      "2020": "TMT 2020",
      "2021": "TMT 2021",
      "Keterangan": "Keterangan tambahan"
    };
    return examples[label] || "";
  }
  // State utama data
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyRow);
  const [editIdx, setEditIdx] = useState(null);
  const [error, setError] = useState("");
  const [pegawaiList, setPegawaiList] = useState([]);
  const [naikGajiList, setNaikGajiList] = useState([]);
  // State dan handler untuk modal arsip
  const [showArsipModal, setShowArsipModal] = useState(false);
  const [arsipBulanInput, setArsipBulanInput] = useState("");
  const [arsipTahunInput, setArsipTahunInput] = useState("");
  const [arsipLoading, setArsipLoading] = useState(false);
  const [arsipError, setArsipError] = useState("");
  const bulanOptions = [
    { value: "", label: "-- Pilih Bulan --" },
    { value: "1", label: "Januari" },
    { value: "2", label: "Februari" },
    { value: "3", label: "Maret" },
    { value: "4", label: "April" },
    { value: "5", label: "Mei" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Juli" },
    { value: "8", label: "Agustus" },
    { value: "9", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
  ];
  const tahunNow = new Date().getFullYear();
  const tahunOptions = Array.from({ length: 11 }, (_, i) => ({ value: (tahunNow - 5 + i).toString(), label: (tahunNow - 5 + i).toString() }));
  tahunOptions.unshift({ value: "", label: "-- Pilih Tahun --" });

  const handleArsipSubmit = async (e) => {
    e.preventDefault();
    if (!arsipBulanInput || !arsipTahunInput) {
      await Swal.fire({ icon: 'error', title: 'Gagal', text: 'Bulan dan tahun arsip wajib diisi!', showConfirmButton: true });
      return;
    }
    setArsipLoading(true);
    try {
      // Ambil data induk pegawai dari MongoDB
      const pegawaiRes = await fetch("/api/pegawai");
      const pegawaiJson = await pegawaiRes.json();
      const pegawaiList = pegawaiJson.data || [];



      // Helper autofill dan normalisasi urutan sesuai TableNaikGaji (tanpa mengubah header)
      function autofillFromInduk(row) {
        let arrRow = Array.isArray(row) ? row.slice(0, columnLabels.length) : columnLabels.map((h, i) => row[h] ?? "");
        while (arrRow.length < columnLabels.length) arrRow.push("");
        const nip = (arrRow[2] || "").split("\n")[0];
        const peg = pegawaiList.find(p => p.nip === nip);
        if (peg) {
          arrRow[1] = (peg.nama || "") + (peg.tempat_tanggal_lahir ? `\n${peg.tempat_tanggal_lahir}` : "");
          arrRow[2] = (peg.nip || "") + (peg.karpeg ? `\n${peg.karpeg}` : "");
          arrRow[3] = peg.pangkat || arrRow[3];
          arrRow[4] = peg.sk_tempat_bekerja || arrRow[4];
          // TMT: ambil dari induk jika kosong
          if (!arrRow[9]) arrRow[9] = peg.sk_tmt || "";
          // Sinkronisasi logika autofill dari TableNaikGaji
          let golongan = "";
          if (naikGajiList && naikGajiList.length > 0) {
            const filtered = naikGajiList.filter(rowGaji => (rowGaji[2] || "").split("\n")[0] === nip);
            if (filtered.length > 0) {
              golongan = filtered[filtered.length - 1][7] || "";
            }
          }
          arrRow[18] = golongan;
        }
        arrRow = arrRow.map(v => v === undefined || v === null ? "" : v);
        return arrRow;
      }

      // Ambil seluruh data dari state, normalisasi dan autofill
      // Selalu lakukan autofill dari induk dan gaji untuk setiap baris sebelum arsip
      // Pastikan urutan dan label field yang diarsipkan persis sesuai columnLabels
      let arr = Array.isArray(data) ? data.map(row => {
        // Jika row array, urutkan sesuai columnLabels
        if (Array.isArray(row)) {
          return columnLabels.map((h, i) => row[i] ?? "");
        }
        // Jika row object, urutkan sesuai columnLabels
        if (typeof row === 'object') {
          return columnLabels.map(h => row[h] ?? "");
        }
        return row;
      }) : [];
      // Validasi: jika data arsip kosong (tidak ada satupun baris), tampilkan error
      if (!arr || arr.length === 0) {
        await Swal.fire({ icon: 'error', title: 'Gagal', text: 'Tidak ada data yang bisa diarsipkan!', showConfirmButton: true });
        setArsipLoading(false);
        return;
      }

      // Kirim ke API /api/riwayat
      const res = await fetch('/api/riwayat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bulan: String(arsipBulanInput),
          tahun: String(arsipTahunInput),
          tipe: 'naikpangkat',
          data: arr
        })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Gagal mengarsipkan data');
      setShowArsipModal(false);
      setArsipBulanInput("");
      setArsipTahunInput("");
      await Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data berhasil diarsipkan!', showConfirmButton: false, timer: 1500 });
    } catch (e) {
      await Swal.fire({ icon: 'error', title: 'Gagal', text: e?.message || 'Gagal arsipkan data!', showConfirmButton: true });
    }
    setArsipLoading(false);
  };
  // Trigger refresh otomatis jika ada perubahan di TableInduk atau TableNaikGaji
  React.useEffect(() => {
    let interval = setInterval(async () => {
      try {
        const resPeg = await fetch("/api/pegawai");
        const jsonPeg = await resPeg.json();
        if (jsonPeg.success && Array.isArray(jsonPeg.data)) {
          setPegawaiList(jsonPeg.data);
        }
        const resGaji = await fetch("/api/naikgaji");
        const jsonGaji = await resGaji.json();
        if (jsonGaji.success && Array.isArray(jsonGaji.data)) {
          setNaikGajiList(jsonGaji.data);
        }
      } catch { }
    }, 3000); // refresh setiap 3 detik
    return () => clearInterval(interval);
  }, []);

  // Sinkronisasi data jika propData berubah
  React.useEffect(() => {
    if (propData && Array.isArray(propData)) {
      // If archive data is array of object, convert to array of array using dynamic columnLabels
      if (typeof propData[0] === 'object' && !Array.isArray(propData[0])) {
        setData(propData.map((item) => columnLabels.map(h => item[h] ?? '')));
      } else if (Array.isArray(propData[0])) {
        setData(propData);
      } else {
        setData(propData);
      }
    }
  }, [propData]);

  // Fetch data hanya jika propData tidak diberikan
  React.useEffect(() => {
    if (!propData) {
      const fetchData = async () => {
        try {
          const res = await fetch("/api/naikpangkat");
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setData(json.data);
          }
        } catch (err) { }
      };
      fetchData();
    }
  }, [propData]);

  const openAddModal = () => {
    setForm([data.length + 1, ...emptyRow.slice(1)].map(v => v === undefined ? '' : v));
    setEditIdx(null);
    setShowModal(true);
    setError("");
  };

  // Edit: gunakan dataToShow agar index sesuai tampilan (bukan data asli jika ada filter/sort)
  const dataToShow = readOnly && Array.isArray(propData) ? propData : data;
  const openEditModal = (idx) => {
    const row = dataToShow[idx];
    // Cari index asli di data berdasarkan No Urut
    const realIdx = data.findIndex(d => d[0] === row[0]);
    let formData = data[realIdx] ? [...data[realIdx]] : [...row];
    // Pastikan semua value string (tidak undefined/null)
    formData = formData.map(v => v === undefined || v === null ? '' : v);
    // Jika kurang panjang, tambahkan ''
    while (formData.length < emptyRow.length) formData.push('');
    setForm(formData);
    setEditIdx(realIdx);
    setShowModal(true);
    setError("");
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(emptyRow);
    setEditIdx(null);
    setError("");
  };

  // Helper untuk mengisi kolom tahun-tahun berdasarkan TMT
  function autofillTahunTMT(newForm, tmtValue) {
    const tahunIdx = [12, 13, 14, 15, 16];
    tahunIdx.forEach(idx => newForm[idx] = "");
    const tmtYear = getTmtYear(tmtValue);
    if (!tmtYear) return newForm;
    for (let i = 0; i < tahunIdx.length; i++) {
      const tahun = 2017 + i;
      if ((tahun - tmtYear) % 2 === 0 && tahun >= tmtYear) {
        newForm[tahunIdx[i]] = `TMT ${tahun}`;
      }
    }
    return newForm;
  }

  // State: apakah tahun-tahun editable manual
  const [tahunManual, setTahunManual] = React.useState(false);

  // Ganti handleChange agar TMT tidak bisa diubah manual
  const handleChange = (e, i) => {
    let newForm = [...form];
    // Field TMT (9) tidak bisa diubah manual
    if (i === 9) return;
    if (i === 8) { // Gaji Pokok
      let val = e.target.value.replace(/[^\d]/g, "");
      if (val) {
        val = parseInt(val, 10).toLocaleString('id-ID');
        newForm[i] = `Rp. ${val}`;
      } else {
        newForm[i] = '';
      }
    } else {
      newForm[i] = e.target.value ?? '';
    }
    setForm(newForm);
  };

  // Notifikasi sukses/gagal submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form[1] || !form[2]) {
      setError("Nama dan NIP wajib diisi!");
      await Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Nama dan NIP wajib diisi!',
        showConfirmButton: true,
        customClass: {
          popup: 'rounded-2xl shadow-2xl border border-blue-200',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold shadow',
          cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-lg font-semibold shadow',
          title: 'text-blue-700 font-bold',
          icon: 'text-blue-600',
        },
        buttonsStyling: false
      });
      return;
    }
    try {
      let newData;
      if (editIdx === null) {
        newData = [...data, form];
      } else {
        newData = [...data];
        newData[editIdx] = form;
      }
      // Re-number No Urut
      newData = newData.map((row, idx) => [idx + 1, ...row.slice(1)]);
      // Simpan ke backend
      const res = await fetch("/api/naikpangkat", {
        method: data.length === 0 ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: newData }),
      });
      let updated = null;
      try {
        updated = await res.json();
      } catch { }
      setData((updated && updated.data && Array.isArray(updated.data)) ? updated.data : newData);
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
        customClass: {
          popup: 'rounded-2xl shadow-2xl border border-blue-200',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold shadow',
          cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-lg font-semibold shadow',
          title: 'text-blue-700 font-bold',
          icon: 'text-blue-600',
        },
        buttonsStyling: false
      });
    } catch (err) {
      setError(err?.message || "Gagal simpan data!");
      await Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: err?.message || 'Gagal simpan data!',
        showConfirmButton: true,
        customClass: {
          popup: 'rounded-2xl shadow-2xl border border-blue-200',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold shadow',
          cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-lg font-semibold shadow',
          title: 'text-blue-700 font-bold',
          icon: 'text-blue-600',
        },
        buttonsStyling: false
      });
    }
  };

  // Ganti window.confirm dengan SweetAlert
  const handleDelete = async (idx) => {
    const result = await Swal.fire({
      title: 'Yakin hapus data ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
      reverseButtons: true,
      customClass: {
        popup: 'rounded-2xl shadow-2xl border border-blue-200',
        confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold shadow',
        cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-lg font-semibold shadow',
        title: 'text-blue-700 font-bold',
        icon: 'text-blue-600',
      },
      buttonsStyling: false
    });
    if (!result.isConfirmed) return;
    try {
      const row = dataToShow[idx];
      // Cari index asli di data berdasarkan No Urut
      const realIdx = data.findIndex(d => d[0] === row[0]);
      let newData = data.filter((_, i) => i !== realIdx).map((row, idx) => [idx + 1, ...row.slice(1)]);
      await fetch("/api/naikpangkat", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: newData }),
      });
      // Ambil ulang data dari backend
      const updated = await fetch("/api/naikpangkat").then((r) => r.json());
      setData(updated.data || []);
      setSelectedIdx(null);
      await Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Data berhasil dihapus!',
        showConfirmButton: false,
        timer: 1500,
        customClass: {
          popup: 'rounded-2xl shadow-2xl border border-blue-200',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold shadow',
          cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-lg font-semibold shadow',
          title: 'text-blue-700 font-bold',
          icon: 'text-blue-600',
        },
        buttonsStyling: false
      });
    } catch {
      setError("Gagal hapus data!");
      await Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Gagal hapus data!',
        showConfirmButton: true,
        customClass: {
          popup: 'rounded-2xl shadow-2xl border border-blue-200',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold shadow',
          cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-lg font-semibold shadow',
          title: 'text-blue-700 font-bold',
          icon: 'text-blue-600',
        },
        buttonsStyling: false
      });
    }
  };

  const handleModalBgClick = (e) => {
    if (e.target.classList.contains("modal-bg")) {
      closeModal();
    }
  };

  const [loading, setLoading] = useState(false); // State untuk loading
  // State untuk baris yang dipilih
  const [selectedIdx, setSelectedIdx] = useState(null);
  // Pilihan untuk field tertentu
  const options = {
    "PNS Pusat": ["", "Ya", "Tidak"],
    "PNS Daerah": ["", "Ya", "Tidak"],
    "Pangkat": ["", "Juru Muda", "Juru", "Juru Tingkat I", "Pengatur Muda", "Pengatur", "Pengatur Tingkat I", "Penata Muda", "Penata", "Penata Tingkat I", "Pembina", "Pembina Tingkat I", "Pembina Utama Muda", "Pembina Utama Madya", "Pembina Utama"],
    "Golongan": ["", "I/a", "I/b", "I/c", "I/d", "II/a", "II/b", "II/c", "II/d", "III/a", "III/b", "III/c", "III/d", "IV/a", "IV/b", "IV/c", "IV/d", "IV/e"],
  };
  return (
    <div className="w-full min-h-[80vh] animate-fade-in">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
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

        {/* Modal Arsip */}
        {showArsipModal && (
          <div className="modal-bg fixed inset-0 flex items-center justify-center bg-black/40 z-50 animate-fade-in" onClick={e => { if (e.target.classList.contains('modal-bg')) setShowArsipModal(false); }}>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 min-w-[350px] max-w-[95vw] relative animate-pop-in">
              <button className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-blue-700 transition-all" onClick={() => setShowArsipModal(false)}>&times;</button>
              <h2 className="text-xl font-bold mb-6 text-blue-700 text-center">Arsipkan Kenaikan Pangkat</h2>
              <form onSubmit={e => { e.preventDefault(); handleSubmitArsipSeluruh(); }} className="space-y-6">
                <div className="flex flex-col gap-4 mb-4">
                  <label className="text-sm font-semibold text-blue-700">Bulan Arsip</label>
                  <select className="border px-3 py-2 rounded focus:outline-blue-400 bg-blue-50 text-blue-900 font-semibold transition-all" value={arsipBulanInput} onChange={e => setArsipBulanInput(e.target.value)}>
                    {bulanOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <label className="text-sm font-semibold text-blue-700">Tahun Arsip</label>
                  <select className="border px-3 py-2 rounded focus:outline-blue-400 bg-blue-50 text-blue-900 font-semibold transition-all" value={arsipTahunInput} onChange={e => setArsipTahunInput(e.target.value)}>
                    {tahunOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
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
      </div>
      <table className="w-full text-base animate-fade-in">
        <thead className="bg-blue-300">
          <tr>
            <th rowSpan={2} className="border px-2 py-1">NO URUT</th>
            <th rowSpan={2} className="border px-2 py-1">NAMA DAN TEMPAT TGL LAHIR</th>
            <th rowSpan={2} className="border px-2 py-1">A.NIP<br />B.KARPEG</th>
            <th colSpan={2} className="border px-2 py-1">PNS</th>
            <th className="border px-2 py-1" colSpan={5}>KEPUTUSAN</th>
            <th className="border px-2 py-1" colSpan={2}>MASA KERJA GOLONGAN</th>
            <th className="border px-2 py-1" colSpan={tahunLabels.length}>KENAIKAN PANGKAT TAHUN</th>
            <th rowSpan={2} className="border px-2 py-1">KET.</th>
          </tr>
          <tr>
            <th className="border px-2 py-1">PUSAT</th>
            <th className="border px-2 py-1">DAERAH</th>
            <th className="border px-2 py-1">A.TANGGAL</th>
            <th className="border px-2 py-1">B.NOMOR</th>
            <th className="border px-2 py-1">A.PANGKAT<br />B.GOL/RUANG</th>
            <th className="border px-2 py-1">GAJI POKOK</th>
            <th className="border px-2 py-1">TMT</th>
            <th className="border px-2 py-1">TAHUN</th>
            <th className="border px-2 py-1">BULAN</th>
            {tahunLabels.map(tahun => (
              <th key={tahun} className="border px-2 py-1">{tahun}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataToShow.map((row, idx) => (
            <tr key={idx} className={`hover:bg-blue-50 transition-all cursor-pointer ${selectedIdx === idx ? 'bg-blue-100' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <td className="border px-2 py-1 text-center whitespace-pre-line">{row[0]}</td>
              <td className="border px-2 py-1 text-center whitespace-pre-line">{row[1]}</td>
              <td className="border px-2 py-1 text-center whitespace-pre-line">{(row[2] || '').split('\n').join('\n')}</td>
              <td className="border px-2 py-1 text-center whitespace-pre-line">{row[3]}</td>
              <td className="border px-2 py-1 text-center whitespace-pre-line">{row[4]}</td>
              <td className="border px-2 py-1 text-center whitespace-pre-line">{row[19]}</td>
              <td className="border px-2 py-1 text-center whitespace-pre-line">{row[20]}</td>
              <td className="border px-2 py-1 text-center whitespace-pre-line">{
                (row[7] && row[18]) ? `${row[7]}\n${row[18]}` :
                  (row[7] ? row[7] : (row[18] ? row[18] : '-'))
              }</td>
              <td className="border px-2 py-1 text-center whitespace-pre-line">{row[8]}</td>
              <td className="border px-2 py-1 text-center whitespace-pre-line">{row[9]}</td>
              <td className="border px-2 py-1 text-center whitespace-pre-line">{row[10]}</td>
              <td className="border px-2 py-1 text-center whitespace-pre-line">{row[11]}</td>
              <td className="border px-2 py-1 text-center whitespace-pre-line">{row[12]}</td>
              <td className="border px-2 py-1 text-center whitespace-pre-line">{row[13]}</td>
              <td className="border px-2 py-1 text-center whitespace-pre-line">{row[14]}</td>
              <td className="border px-2 py-1 text-center whitespace-pre-line">{row[15]}</td>
              <td className="border px-2 py-1 text-center whitespace-pre-line">{row[16]}</td>
              <td className="border px-2 py-1 text-center whitespace-pre-line">{row[17]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Modal Pop Up */}
      {!readOnly && showModal && (
        <div className="modal-bg fixed inset-0 flex items-center justify-center bg-black/40 z-50 animate-fade-in" onClick={handleModalBgClick}>
          <div className="bg-white p-4 w-full max-w-lg md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-auto relative animate-pop-in">
            <button className="absolute top-4 right-4 text-3xl text-gray-400 hover:text-blue-700 transition-all" onClick={closeModal}>&times;</button>
            <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center tracking-wide">{editIdx === null ? "Tambah Data Kenaikan Pangkat" : "Edit Data Kenaikan Pangkat"}</h2>
            {error && <div className="mb-4 p-3 text-red-700 bg-red-100 rounded-xl text-base font-semibold animate-fade-in text-center shadow">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col gap-4 mb-2">
                <label className="text-sm font-semibold text-blue-700 mb-1">Pilih Pegawai (autofill)</label>
                <select
                  className="border border-blue-200 px-4 py-2 rounded-lg focus:outline-blue-400 bg-blue-50 text-blue-900 font-semibold transition-all shadow-sm"
                  value={(() => {
                    const nipVal = (form[2] || '').split('\n')[0];
                    const peg = pegawaiList.find(p => p.nip === nipVal);
                    return peg ? peg.nama : '';
                  })()}
                  onChange={e => {
                    const idx = pegawaiList.findIndex(p => p.nama === e.target.value);
                    if (idx !== -1) {
                      const peg = pegawaiList[idx];
                      let newForm = [...form];
                      newForm[1] = peg.nama + (peg.tempat_tanggal_lahir ? `\n${peg.tempat_tanggal_lahir}` : "");
                      newForm[2] = (peg.nip || "") + (peg.karpeg ? `\n${peg.karpeg}` : "");
                      newForm[7] = peg.pangkat || "";
                      let golongan = "";
                      const nip = (peg.nip || "").trim();
                      if (naikGajiList && naikGajiList.length > 0) {
                        const filtered = naikGajiList.filter(row => (row[2] || "").split("\n")[0] === nip);
                        if (filtered.length > 0) {
                          golongan = filtered[filtered.length - 1][7] || "";
                        }
                      }
                      newForm[18] = golongan;
                      newForm[9] = getTMTValue(peg.nip);
                      newForm = autofillTahunTMT(newForm, newForm[9]);
                      setForm(newForm);
                    }
                  }}
                >
                  <option value="">-- Pilih Pegawai --</option>
                  {pegawaiList.map((p, i) => (
                    <option key={p.nip} value={p.nama}>{p.nama}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Field utama sesuai urutan header tabel */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold mb-1 text-blue-700">No Urut</label>
                  <input className="border border-blue-200 px-3 py-2 rounded-lg bg-gray-100 font-semibold" value={form[0]} readOnly />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold mb-1 text-blue-700">Nama dan Tempat Tgl. Lahir</label>
                  <input className="border border-blue-200 px-3 py-2 rounded-lg bg-blue-50 font-semibold" value={form[1] || ''} onChange={e => handleChange(e, 1)} placeholder={getExampleValue("Nama dan Tempat Tgl. Lahir")} />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold mb-1 text-blue-700">NIP & Karpeg</label>
                  <input className="border border-blue-200 px-3 py-2 rounded-lg bg-blue-50 font-semibold" value={form[2] || ''} onChange={e => handleChange(e, 2)} placeholder={getExampleValue("NIP & Karpeg")} />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold mb-1 text-blue-700">PNS Pusat</label>
                  <select className="border border-blue-200 px-3 py-2 rounded-lg bg-blue-50 font-semibold" value={form[3] || ''} onChange={e => handleChange(e, 3)}>
                    {options["PNS Pusat"].map((opt, idx) => <option key={idx} value={opt}>{opt || "Pilih PNS Pusat"}</option>)}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold mb-1 text-blue-700">PNS Daerah</label>
                  <select className="border border-blue-200 px-3 py-2 rounded-lg bg-blue-50 font-semibold" value={form[4] || ''} onChange={e => handleChange(e, 4)}>
                    {options["PNS Daerah"].map((opt, idx) => <option key={idx} value={opt}>{opt || "Pilih PNS Daerah"}</option>)}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold mb-1 text-blue-700">Keputusan Tanggal</label>
                  <input className="border border-blue-200 px-3 py-2 rounded-lg bg-blue-50 font-semibold" value={form[19] || ''} onChange={e => { let f = [...form]; f[19] = e.target.value ?? ''; setForm(f); }} placeholder="yyyy-mm-dd" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold mb-1 text-blue-700">Keputusan Nomor</label>
                  <input className="border border-blue-200 px-3 py-2 rounded-lg bg-blue-50 font-semibold" value={form[20] || ''} onChange={e => { let f = [...form]; f[20] = e.target.value ?? ''; setForm(f); }} placeholder="Nomor SK" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold mb-1 text-blue-700">Keputusan Dari</label>
                  <input className="border border-blue-200 px-3 py-2 rounded-lg bg-blue-50 font-semibold" value={form[5] || ''} onChange={e => handleChange(e, 5)} placeholder={getExampleValue("Keputusan Dari")} />
                </div>
                <div className="flex flex-col lg:col-span-2">
                  <label className="text-xs font-semibold mb-1 text-blue-700">A. Pangkat</label>
                  <select className="border border-blue-200 px-3 py-2 rounded-lg bg-blue-50 font-semibold" value={form[7] || ''} onChange={e => handleChange(e, 7)}>
                    {options["Pangkat"].map((opt, idx) => <option key={idx} value={opt}>{opt || "Pilih Pangkat"}</option>)}
                  </select>
                  <label className="text-xs font-semibold mt-2 mb-1 text-blue-700">B. Golongan/Ruang</label>
                  <select
                    className="border border-blue-200 px-3 py-2 rounded-lg bg-blue-50 font-semibold mb-2"
                    value={form[18] || ''}
                    onChange={e => {
                      let f = [...form];
                      f[18] = e.target.value;
                      setForm(f);
                    }}
                  >
                    <option value="">-- Pilih Golongan --</option>
                    {options["Golongan"].map((opt, idx) => <option key={idx} value={opt}>{opt || "Pilih Golongan"}</option>)}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold mb-1 text-blue-700">Gaji Pokok</label>
                  <input className="border border-blue-200 px-3 py-2 rounded-lg bg-blue-50 font-semibold" value={form[8] || ''} onChange={e => handleChange(e, 8)} placeholder="Rp. 5.000.000" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold mb-1 text-blue-700">TMT <span className="text-gray-500">(otomatis dari data induk & naik gaji, tidak bisa diubah manual)</span></label>
                  <input className="border border-blue-200 px-3 py-2 rounded-lg bg-gray-100 font-semibold" value={form[9] || ''} readOnly placeholder={getExampleValue("TMT")} />
                  {form[9] && (
                    <span className="text-xs text-blue-600 mt-1">TMT diambil dari data induk pegawai dan data kenaikan gaji terakhir</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold mb-1 text-blue-700">Masa Kerja Tahun</label>
                  <input className="border border-blue-200 px-3 py-2 rounded-lg bg-blue-50 font-semibold" value={form[10] || ''} onChange={e => handleChange(e, 10)} placeholder={getExampleValue("Masa Kerja Tahun")} />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-semibold mb-1 text-blue-700">Masa Kerja Bulan</label>
                  <input className="border border-blue-200 px-3 py-2 rounded-lg bg-blue-50 font-semibold" value={form[11] || ''} onChange={e => handleChange(e, 11)} placeholder={getExampleValue("Masa Kerja Bulan")} />
                </div>
                <div className="col-span-3 flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-blue-700">TMT per Tahun (centang jika berlaku)</span>
                </div>
                <div className="col-span-3 grid grid-cols-5 gap-2">
                  {tahunLabels.map((tahun, idx) => {
                    const i = 12 + idx;
                    return (
                      <div key={i} className="flex flex-col items-center">
                        <label className="text-xs font-semibold mb-1 text-blue-700">{tahun}</label>
                        <input
                          type="checkbox"
                          checked={form[i] === '✓'}
                          onChange={e => {
                            let f = [...form];
                            f[i] = e.target.checked ? '✓' : '';
                            setForm(f);
                          }}
                          className="w-5 h-5 accent-blue-600"
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-col col-span-1">
                  <label className="text-xs font-semibold mb-1 text-blue-700">Upload SK</label>
                  <UploadSK value={form[16]} onChange={url => setForm(f => { const n = [...f]; n[16] = url; return n; })} />
                </div>
                <div className="flex flex-col col-span-2">
                  <label className="text-xs font-semibold mb-1 text-blue-700">Keterangan</label>
                  <input className="border border-blue-200 px-3 py-2 rounded-lg bg-blue-50 font-semibold" value={form[17] || ''} onChange={e => handleChange(e, 17)} placeholder={getExampleValue("Keterangan")} />
                </div>
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

export default PromotionTable;
