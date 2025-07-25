import UploadSK from '@/components/ui/UploadSK';

export default function UploadSKPage() {
// Proteksi login sudah dihandle oleh middleware JWT
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Upload SK Pegawai</h1>
      <UploadSK />
    </div>
  );
}
