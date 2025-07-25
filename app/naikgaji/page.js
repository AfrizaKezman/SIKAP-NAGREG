  // Proteksi login sudah dihandle oleh middleware JWT
import TableNaikGaji from '@/components/TableNaikGaji';

export default function NaikGajiPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Kenaikan Gaji Pegawai</h1>
      <TableNaikGaji />
    </div>
  );
}
