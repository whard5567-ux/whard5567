import postgres from 'postgres';
const sql = postgres('postgresql://ht2_diagus.mjgekmjnsipthcswazid:fNgzSz81Rdg~41F-BUsIyybk31waOGpz@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', { ssl: 'require' });

async function run() {
  const query = process.argv[2];
  if (!query) { console.error("No query provided"); process.exit(1); }
  const result = await sql.unsafe(query);
  console.log(result);
  process.exit(0);
}
run();
