import { sql } from "@/lib/db";
import { sheetEditUrl } from "@/lib/sheets";
import { PageHeader } from "@/components/page-header";
import { AhiMtuView } from "./ahi-mtu-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export type AhiMtuRow = {
  id: number;
  techidentno: string;
  mtu: string;
  ultg: string;
  upt: string;
  gardu_induk: string;
  bay: string;
  fasa: string;
  teg: string;
  merk: string;
  tipe: string;
  tahun_buat: string;
  usia: string;
  parameter_pemicu: string;
  rencana_tindak_lanjut: string;
  target_penyelesaian: string;
  ahi_setelah_evaluasi: string;
  penempatan: string;
  hartrans: string;
  koordinat: string;
  kategori_usia: string;
  ahi_terbaru: string;
  raw: Record<string, string>;
};

export default async function AhiMtuPage() {
  const rows = await sql`
      select * from hargi_ht2.kondisi_ahi_mtu
      order by id
  ` as unknown as AhiMtuRow[];

  const lastLog = await sql`
      select sheet_name_ahi_mtu as sheet_name,
             to_char(sheet_modified_ahi_mtu::timestamptz at time zone 'Asia/Jakarta', 'DD Mon YYYY') sheet_mod
      from hargi_ht2.refresh_log
      where status = 'success' and finished_at is not null and sheet_modified_ahi_mtu is not null
      order by id desc limit 1` as unknown as { sheet_name: string | null; sheet_mod: string | null }[];
  
  const last = lastLog[0] || {};

  return (
    <>
      <PageHeader
        title="KONDISI AHI MTU"
        subtitle="Monitoring kesehatan aset MTU · UIT Jawa Bagian Tengah"
        sourceUrl={sheetEditUrl({ id: "1MquufLxJD59lXOpjU2pF06aw1IhlPpVBBZ1OQXAHm7M", gid: "0" })}
        sheetName={last?.sheet_name ?? null}
        sheetModified={last?.sheet_mod ?? null}
        syncTargets={["ahi_mtu"]}
      />
      
      <AhiMtuView rows={rows} />
    </>
  );
}
