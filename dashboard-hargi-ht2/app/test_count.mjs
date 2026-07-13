import postgres from 'postgres';
const sql = postgres('postgresql://ht2_diagus.mjgekmjnsipthcswazid:fNgzSz81Rdg~41F-BUsIyybk31waOGpz@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', { ssl: 'require' });

async function run() {
  const [{ count: ce }] = await sql`SELECT count(*) FROM hargi_ht2.ce_abo_findings`;
  const [{ count: pareto }] = await sql`SELECT count(*) FROM hargi_ht2.gangguan_trafo`;
  console.log({ ce, pareto });
  process.exit(0);
}
run();
