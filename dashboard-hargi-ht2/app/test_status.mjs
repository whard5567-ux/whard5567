import postgres from 'postgres';

async function run() {
  const sql = postgres("postgresql://ht2_diagus.mjgekmjnsipthcswazid:fNgzSz81Rdg~41F-BUsIyybk31waOGpz@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres", { ssl: "require" });
  try {
    const res = await sql`SELECT DISTINCT status_terkini FROM hargi_ht2.ce_abo_findings`;
    console.log("status_terkini:");
    res.forEach(r => console.log(r.status_terkini));
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
