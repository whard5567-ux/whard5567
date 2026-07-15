import { PageHeader } from "@/components/page-header";

export default function PenggantianMtuPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Penggantian MTU"
        subtitle="Data & Progres Penggantian MTU"
      />
      
      <div className="card p-6 flex flex-col items-center justify-center text-center h-64 border border-edge/50">
        <h2 className="text-xl font-bold text-ink">Halaman Sedang Dalam Pengembangan</h2>
        <p className="text-ink-3 mt-2 text-sm">
          Konten dan data untuk Penggantian MTU akan segera tersedia di halaman ini.
        </p>
      </div>
    </div>
  );
}
