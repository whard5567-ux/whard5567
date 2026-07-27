const postgres = require('postgres');
const sql = postgres('postgresql://postgres.ztxgvwyhwwwoyiudgidg:P@ssw0rdHargiHT22026!@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require', { ssl: 'require' });
async function t() {
  try {
    const r = await sql`SELECT count(*) FROM hargi_ht2.abo_2026`;
    console.log("DB count:", r[0].count);
    const upts = await sql`SELECT distinct upt FROM hargi_ht2.abo_2026`;
    console.log("DB UPTs:", upts);
    const closeCount = await sql`SELECT count(*) FROM hargi_ht2.abo_2026 WHERE upper(status_fix) = 'CLOSE'`;
    console.log("DB Close Count:", closeCount[0].count);
  } catch(e) { console.error(e) }
  process.exit(0);
}
t();
