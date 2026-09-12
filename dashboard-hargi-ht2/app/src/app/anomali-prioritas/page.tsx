import { PageHeader } from "@/components/page-header";
import { AnomaliPrioritasView } from "./anomali-prioritas-view";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AnomaliPrioritasPage() {
  const ahiRows = await sql`
      select gardu_induk, bay, merk, tipe, fasa, teg, ahi_terbaru, parameter_pemicu, koordinat, ahi_setelah_evaluasi, tier, raw->>'col_24' as subsistem, mtu, tahun_buat 
      from hargi_ht2.kondisi_ahi_mtu
      where gardu_induk is not null
  ` as unknown as any[];





  return (
    <div className="space-y-6">
      <PageHeader
        title="ANOMALI PRIORITAS"
        subtitle="Peta Kerawanan Subsistem"
        sourceUrl="https://docs.google.com/spreadsheets/d/1MquufLxJD59lXOpjU2pF06aw1IhlPpVBBZ1OQXAHm7M/edit?gid=0#gid=0"
        sheetName="Update Kondisi AHI MTU"
        syncTargets={["ahi_mtu"]}
      />
      <AnomaliPrioritasView ahiData={ahiRows} />
    </div>
  );
}
