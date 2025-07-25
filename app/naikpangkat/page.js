import TableNaikPangkat from '@/components/TableNaikPangkat';

export default function NaikPangkatPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Kenaikan Pangkat Pegawai</h1>
      <TableNaikPangkat />
    </div>
    // Proteksi login sudah dihandle oleh middleware JWT
  );
}
