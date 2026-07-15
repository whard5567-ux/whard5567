import { sql } from "@/lib/db";
import { PENGGANTIAN_MTU_SHEET, sheetEditUrl } from "@/lib/sheets";
import { PageHeader } from "@/components/page-header";
import { MtuView } from "./mtu-view";
import type { MtuRow } from "@/lib/aggregate";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function PenggantianMtuPage() {
  const rows = await sql`
      select coalesce(prk,'') prk, coalesce(upt,'') upt,
             coalesce(gardu_induk,'') gardu_induk, coalesce(pabrikan,'') pabrikan,
             coalesce(status_peruntukan,'') status_peruntukan, coalesce(mtu,'') mtu,
             coalesce(type_mtu,'') type_mtu, coalesce(progres_saat_ini,'') progres_saat_ini,
             coalesce(penyedia_jasa_pasang,'') penyedia_jasa_pasang, 
             coalesce(rencana_pasang_mtu,'') rencana_pasang_mtu, coalesce(bulan,'') bulan,
             coalesce(kolom_aq,'') kolom_aq, coalesce(tahun_kr,'') tahun_kr
      from hargi_ht2.penggantian_mtu
      order by id` as unknown as MtuRow[];

  const lastLog = await sql`
      select sheet_name_mtu as sheet_name,
             to_char(sheet_modified_mtu::timestamptz at time zone 'Asia/Jakarta', 'DD Mon YYYY') sheet_mod
      from hargi_ht2.refresh_log
      where status = 'success' and finished_at is not null and sheet_modified_mtu is not null
      order by id desc limit 1` as unknown as { sheet_name: string | null; sheet_mod: string | null }[];

  const last = lastLog[0] || {};

  return (
    <>
      <PageHeader
        title="Penggantian MTU"
        subtitle="Progres Penggantian Material Transmisi Utama"
        sourceUrl={sheetEditUrl(PENGGANTIAN_MTU_SHEET)}
        sheetName={last?.sheet_name ?? null}
        sheetModified={last?.sheet_mod ?? null}
        syncTargets={["mtu"]}
      />
      <MtuView rows={rows} />
    </>
  );
}
