import postgres from 'postgres';

async function run() {
  const sql = postgres("postgresql://ht2_diagus.mjgekmjnsipthcswazid:fNgzSz81Rdg~41F-BUsIyybk31waOGpz@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres", { ssl: "require" });
  try {
    const res = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'hargi_ht2'`;
    console.log("Tables:");
    res.forEach(r => console.log(r.table_name));
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
