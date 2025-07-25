"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { FolderUp, File, XCircle, Loader2, CheckCircle } from 'lucide-react';

// ============================================================================
// 1. CUSTOM HOOKS (untuk memisahkan logika)
// ============================================================================

/**
 * Hook untuk mengambil daftar folder yang ada.
 */
const useFolders = () => {
  const [folders, setFolders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFolders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/upload?listFolders=1');
      if (!res.ok) throw new Error('Gagal memuat folder');
      const data = await res.json();
      setFolders(Array.isArray(data.folders) ? data.folders : []);
    } catch (error) {
      console.error(error);
      setFolders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  return { folders, isLoading, refetchFolders: fetchFolders };
};

/**
 * Hook untuk mengambil daftar file dalam folder tertentu.
 * @param {string} folder - Nama folder.
 */
const useFiles = (folder) => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFiles = useCallback(async () => {
    if (!folder) {
      setFiles([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/upload?folder=${encodeURIComponent(folder.trim())}`);
      if (!res.ok) throw new Error('Gagal memuat file');
      const data = await res.json();
      setFiles(Array.isArray(data.files) ? data.files : []);
    } catch (error) {
      console.error(error);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [folder]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return { files, isLoading, refetchFiles: fetchFiles };
};


// ============================================================================
// 2. UI SUB-COMPONENTS (untuk UI yang modular)
// ============================================================================

/**
 * Komponen untuk memilih atau membuat folder baru.
 */
const FolderSelector = ({ folders, selectedFolder, onSelectFolder, onSetFolder, disabled }) => (
  <div className="mb-6">
    <label htmlFor="folder-input" className="block text-sm font-medium text-slate-800 mb-2">
      1. Pilih atau Buat Folder Tujuan
    </label>
    {folders.length > 0 && (
      <div className="flex flex-wrap gap-2 mb-3">
        {folders.map(f => (
          <button
            key={f}
            type="button"
            onClick={() => onSelectFolder(f)}
            disabled={disabled}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all duration-200 ${selectedFolder === f 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
    )}
    <input
      id="folder-input"
      type="text"
      value={selectedFolder}
      onChange={e => onSetFolder(e.target.value)}
      disabled={disabled}
      placeholder="Contoh: SK_Budi_Santoso_2025"
      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
    />
  </div>
);

/**
 * Komponen area upload file dengan fitur drag-and-drop.
 */
const FileDropzone = ({ onFileChange, folderReady, uploading, error }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e, enter) => {
    e.preventDefault();
    e.stopPropagation();
    if (folderReady) setIsDragging(enter);
  };
  
  const handleDrop = (e) => {
    handleDrag(e, false);
    if (folderReady && e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const statusColor = error ? 'border-red-500 bg-red-50' 
    : isDragging ? 'border-blue-500 bg-blue-50' 
    : 'border-slate-300 bg-white';
  
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-slate-800 mb-2">
        2. Unggah File
      </label>
      <div
        className={`relative flex flex-col items-center justify-center w-full h-40 p-4 border-2 ${statusColor} border-dashed rounded-lg transition-colors duration-200 ${!folderReady ? 'cursor-not-allowed bg-slate-50' : 'cursor-pointer'}`}
        onClick={() => folderReady && fileInputRef.current?.click()}
        onDragEnter={(e) => handleDrag(e, true)}
        onDragLeave={(e) => handleDrag(e, false)}
        onDragOver={(e) => handleDrag(e, true)}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
          onChange={onFileChange}
          disabled={!folderReady || uploading}
        />
        {uploading ? (
          <>
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-600">Mengunggah...</p>
          </>
        ) : (
          <>
            <FolderUp className={`w-10 h-10 ${error ? 'text-red-500' : 'text-slate-400'}`} />
            <p className="mt-2 text-sm text-slate-600">
              <span className="font-semibold text-blue-600">Klik untuk memilih</span> atau seret file ke sini
            </p>
            <p className="text-xs text-slate-500">PDF, DOCX, XLSX, JPG, PNG (Maks 10MB)</p>
          </>
        )}
      </div>
      {!folderReady && <p className="mt-2 text-xs text-yellow-600">Silakan isi nama folder terlebih dahulu.</p>}
      {error && <p className="mt-2 text-sm text-red-600 flex items-center gap-1"><XCircle size={14} /> {error}</p>}
    </div>
  );
};

/**
 * Komponen untuk menampilkan daftar file yang sudah diunggah.
 */
const FileList = ({ files, isLoading, folder }) => {
  if (!folder || (files.length === 0 && !isLoading)) return null;

  const getFileName = (url) => decodeURIComponent(url.split('/').pop().split('?')[0]);

  return (
    <div>
      <h3 className="text-sm font-medium text-slate-800 mb-3">
        File di folder <span className="font-bold text-blue-700">{folder}</span>
      </h3>
      {isLoading ? (
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-xs">Memuat daftar file...</span>
        </div>
      ) : (
        <ul className="space-y-2">
          {files.map(url => (
            <li key={url} className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-md">
              <File className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-700 hover:underline truncate"
                title={getFileName(url)}
              >
                {getFileName(url)}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ============================================================================
// 3. MAIN COMPONENT (Komponen Induk yang Mengatur Semuanya)
// ============================================================================

const UploadManager = ({ value, onChange = () => {} }) => {
  const [folder, setFolder] = useState("");
  const [uploadStatus, setUploadStatus] = useState({ uploading: false, error: "", successUrl: "" });
  
  const { folders, refetchFolders } = useFolders();
  const { files, isLoading: isLoadingFiles, refetchFiles } = useFiles(folder);

  const folderReady = folder.trim().length > 0;
  
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !folderReady) return;

    setUploadStatus({ uploading: true, error: "", successUrl: "" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder.trim());

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      
      if (!res.ok || data.error) throw new Error(data.error || "Upload gagal.");

      setUploadStatus({ uploading: false, error: "", successUrl: data.url });
      onChange(data.url);
      
      // Refresh data setelah berhasil upload
      await Promise.all([refetchFiles(), refetchFolders()]);

    } catch (err) {
      setUploadStatus({ uploading: false, error: err.message, successUrl: "" });
    } finally {
        // Reset file input agar bisa upload file yg sama lagi
        e.target.value = null;
    }
  };

  useEffect(() => {
    if (value) {
      setUploadStatus(prev => ({ ...prev, successUrl: value }));
    }
  }, [value]);

  return (
    <div className="w-full max-w-2xl mx-auto font-sans p-6 bg-white rounded-xl shadow-lg border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Manajer Upload Dokumen</h2>
        {uploadStatus.successUrl && !uploadStatus.error && (
            <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <CheckCircle size={16} /> Upload Berhasil
            </span>
        )}
      </div>
      
      <FolderSelector
        folders={folders}
        selectedFolder={folder}
        onSelectFolder={setFolder}
        onSetFolder={setFolder}
        disabled={uploadStatus.uploading}
      />
      
      <FileDropzone
        onFileChange={handleFileUpload}
        folderReady={folderReady}
        uploading={uploadStatus.uploading}
        error={uploadStatus.error}
      />
      
      <FileList
        files={files}
        isLoading={isLoadingFiles}
        folder={folder}
      />
    </div>
  );
};

export default UploadManager;