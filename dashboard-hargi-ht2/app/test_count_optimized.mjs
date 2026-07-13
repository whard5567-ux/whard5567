import postgres from 'postgres';
const sql = postgres('postgresql://ht2_diagus.mjgekmjnsipthcswazid:fNgzSz81Rdg~41F-BUsIyybk31waOGpz@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', { 
    ssl: "require",
    max: 4,
    prepare: false,
    idle_timeout: 20,
    keep_alive: 30,
    max_lifetime: 60 * 15,
    connect_timeout: 10,
    family: 4 
});

async function run() {
  const t0 = Date.now();
  const [{ count: ce }] = await sql`SELECT count(*) FROM hargi_ht2.ce_abo_findings`;
  console.log(`Query took ${Date.now() - t0} ms`);
  console.log({ ce });
  process.exit(0);
}
run();
