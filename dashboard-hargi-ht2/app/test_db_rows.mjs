import postgres from 'postgres';
const sql = postgres('postgresql://postgres.ztxgvwyhwwwoyiudgidg:P@ssw0rdHargiHT22026!@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require', { ssl: 'require' });

async function run() {
  try {
    const res = await sql`SELECT count(*) FROM hargi_ht2.ce_abo_findings`;
    console.log('Total rows in ce_abo_findings:', res[0].count);
    
    // Group by to find duplicates? We don't have a unique ID except maybe combination of things.
    // Let's just check the exact number.
  } finally {
    process.exit(0);
  }
}
run();
