import postgres from 'postgres';
const sql = postgres('postgresql://postgres.ztxgvwyhwwwoyiudgidg:P@ssw0rdHargiHT22026!@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require', { ssl: 'require' });

async function run() {
  const result = await sql`SELECT count(*) FROM hargi_ht2.gangguan_trafo`;
  console.log('gangguan_trafo count:', result);
  process.exit(0);
}
run();
