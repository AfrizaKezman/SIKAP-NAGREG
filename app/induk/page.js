  // Proteksi login sudah dihandle oleh middleware JWT
import TableInduk from '@/components/TableInduk';

export default function IndukPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Data Induk Pegawai</h1>
      <TableInduk />
    </div>
  );
}
