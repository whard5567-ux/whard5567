const postgres = require('postgres');
const sql = postgres('postgresql://postgres.ztxgvwyhwwwoyiudgidg:P@ssw0rdHargiHT22026!@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require', { ssl: 'require' });
async function t() {
  try {
    const r = await sql`select status_fix, count(*) from hargi_ht2.abo_2026 group by status_fix`;
    console.log('DB ROWS:', r);
  } catch(e) { console.error(e) }
  process.exit(0);
}
t();
