import postgres from "postgres";

const base = postgres('postgresql://ht2_diagus.mjgekmjnsipthcswazid:fNgzSz81Rdg~41F-BUsIyybk31waOGpz@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', {
  ssl: "require",
  max: 4,
  prepare: false,
  idle_timeout: 20,
  keep_alive: 30,
  max_lifetime: 60 * 15,
  connect_timeout: 10,
});

const sql = new Proxy(base, {
  apply(target, thisArg, args) {
    const q = Reflect.apply(target as any, thisArg, args as any);
    if (q && typeof (q as any).cancel === "function" && typeof (q as any).then === "function") {
      const timer = setTimeout(() => (q as any).cancel(), 30_000);
      (q as any).then(() => clearTimeout(timer), () => clearTimeout(timer));
    }
    return q;
  },
}) as typeof base;


async function test() {
  console.log("Fetching CE ABO data...");
  const t0 = Date.now();
  try {
      const rows = await sql`
          select coalesce(kode,'') kode, coalesce(sub_bidang,'') sub_bidang,
                 coalesce(level_anomali,'') level_anomali, coalesce(uraian,'') uraian,
                 coalesce(upt,'') upt, coalesce(ultg,'') ultg, coalesce(gardu_induk,'') gardu_induk,
                 coalesce(nama_ruas_bay,'') nama_ruas_bay, coalesce(nama_alat,'') nama_alat,
                 coalesce(kondisi_terkini,'') kondisi_terkini, coalesce(kondisi_awal,'') kondisi_awal,
                 coalesce(kondisi_akhir,'') kondisi_akhir, coalesce(status_terkini,'') status_terkini
          from hargi_ht2.ce_abo_findings
          order by id`;
      console.log(`Fetched ${rows.length} rows in ${Date.now() - t0}ms`);
  } catch (e) {
      console.error(e);
  }
  process.exit(0);
}

test();
