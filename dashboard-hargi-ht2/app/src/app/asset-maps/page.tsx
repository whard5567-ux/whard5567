import { sql } from "@/lib/db";
import { PARETO_SHEET, sheetEditUrl } from "@/lib/sheets";
import { PageHeader } from "@/components/page-header";
import { AssetMapsView, type GiPoint } from "./asset-maps-view";

export const dynamic = "force-dynamic";

export default async function AssetMapsPage() {
  const points = await sql`
      select
        gardu,
        coalesce(max(nullif(trim(unit), '')), 'Tanpa Unit') as unit,
        avg(nullif(latitude, '')::float) as lat,
        avg(nullif(longitude, '')::float) as lng,
        count(*)::int as total,
        count(distinct trafo_id) filter (where trafo_id <> '')::int as trafo_count,
        coalesce(array_agg(distinct trafo_id) filter (where trafo_id <> ''), '{}') as trafo_ids,
        jsonb_object_agg(kat_thn, cnt) as kategori_counts
      from (
        select gardu, unit, latitude, longitude,
               coalesce(nullif(kategori, ''), 'Lainnya') || ' (' || coalesce(nullif(tahun::text, ''), 'N/A') || ')' as kat_thn,
               trim(regexp_replace(nama_bay, '\s+\d+.*$', '')) as trafo_id,
               count(*) over (partition by gardu, kategori, tahun) as cnt
        from hargi_ht2.gangguan_trafo
        where latitude ~ '^-?[0-9]+(\.[0-9]+)?$'
          and longitude ~ '^-?[0-9]+(\.[0-9]+)?$'
          and coalesce(trim(gardu), '') <> ''
      ) sub
      group by gardu
      order by total desc` as unknown as GiPoint[];

  const lastLog = await sql`
      select sheet_name_pareto as sheet_name,
             to_char(sheet_modified_pareto::timestamptz at time zone 'Asia/Jakarta', 'DD Mon YYYY') sheet_mod
      from hargi_ht2.refresh_log
      where status = 'success' and finished_at is not null
      order by id desc limit 1` as unknown as { sheet_name: string | null; sheet_mod: string | null }[];

  const last = lastLog[0] || {};

  return (
    <div className="-mx-4 -mb-12 -mt-4 flex h-dvh min-h-0 flex-col md:-mx-8 md:-mt-6">
      <div className="shrink-0 px-4 pt-4 md:px-8 md:pt-6">
        <PageHeader
          title="MAPS"
          subtitle="Sebaran Gardu Induk berdasarkan riwayat gangguan trafo"
          sourceUrl={sheetEditUrl(PARETO_SHEET)}
          sheetName={last?.sheet_name ?? null}
          sheetModified={last?.sheet_mod ?? null}
        />
      </div>
      <AssetMapsView points={points} />
    </div>
  );
}
