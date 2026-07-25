import postgres from 'postgres';
const sql = postgres('postgresql://postgres.ztxgvwyhwwwoyiudgidg:P@ssw0rdHargiHT22026!@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require', { ssl: 'require' });

async function run() {
  const result = await sql`SELECT tahun, count(*) FROM hargi_ht2.gangguan_trafo GROUP BY tahun`;
  console.log('gangguan_trafo by year:', result);
  process.exit(0);
}
run();
