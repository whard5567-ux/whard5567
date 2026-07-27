const postgres = require('postgres');
const sql = postgres('postgresql://postgres.ztxgvwyhwwwoyiudgidg:P@ssw0rdHargiHT22026!@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require', { ssl: 'require' });
async function t() {
  try {
    const r = await sql`SELECT count(*) FROM hargi_ht2.gangguan_trafo`;
    console.log("DB count:", r[0].count);
    const emptyK = await sql`SELECT count(*) FROM hargi_ht2.gangguan_trafo WHERE trim(kategori) = ''`;
    console.log("Empty Kategori:", emptyK[0].count);
  } catch(e) { console.error(e) }
  process.exit(0);
}
t();
