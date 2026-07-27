const postgres = require('postgres');
const sql = postgres('postgresql://postgres.ztxgvwyhwwwoyiudgidg:P@ssw0rdHargiHT22026!@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require', { ssl: 'require' });
async function t() {
  try {
    const r = await sql`select * from hargi_ht2.refresh_log order by id desc limit 15`;
    r.forEach(x => console.log(x.id, x.started_at, x.finished_at));
  } catch(e) { console.error(e) }
  process.exit(0);
}
t();
