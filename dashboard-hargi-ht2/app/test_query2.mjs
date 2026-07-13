import postgres from 'postgres';
const sql = postgres('postgresql://ht2_diagus.mjgekmjnsipthcswazid:fNgzSz81Rdg~41F-BUsIyybk31waOGpz@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', { ssl: 'require' });

async function run() {
  const result = await sql`SELECT DISTINCT level_anomali FROM hargi_ht2.ce_abo_findings`;
  console.log(result);
  process.exit(0);
}
run();
