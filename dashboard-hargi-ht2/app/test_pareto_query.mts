import postgres from 'postgres';
const sql = postgres('postgresql://ht2_diagus.mjgekmjnsipthcswazid:fNgzSz81Rdg~41F-BUsIyybk31waOGpz@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', { 
  ssl: 'require', 
  max: 4 
});

async function run() {
  console.log("Fetching Pareto data...");
  const t0 = Date.now();
  const [rows, [last]] = await Promise.all([
    sql`
      select coalesce(no,'') no, coalesce(tgl_keluar,'') tgl_keluar, coalesce(unit,'') unit,
             coalesce(gardu,'') gardu, coalesce(nama_bay,'') nama_bay, coalesce(kategori,'') kategori,
             coalesce(sebab,'') sebab, coalesce(tahun,'') tahun, coalesce(bulan,'') bulan
      from hargi_ht2.gangguan_trafo
      order by id`,
    sql`
      select sheet_name_pareto as sheet_name,
             to_char(sheet_modified_pareto::timestamptz at time zone 'Asia/Jakarta', 'DD Mon YYYY') sheet_mod
      from hargi_ht2.refresh_log
      where status = 'success' and finished_at is not null
      order by id desc limit 1`,
  ]);
  console.log(`Fetched ${rows.length} rows in ${Date.now() - t0}ms`);
  process.exit(0);
}

run();
