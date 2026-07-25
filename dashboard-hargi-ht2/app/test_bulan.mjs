import fs from 'fs';
import postgres from 'postgres';

async function run() {
  const env = fs.readFileSync('.env.local', 'utf-8');
  const dbUrl = env.split('\n').find(l => l.startsWith('DB_URL=')).split('=')[1].trim().replace(/^"|"$/g, '');
  const sql = postgres(dbUrl, { prepare: false });

  const rows = await sql`select bulan, count(*) from hargi_ht2.penggantian_mtu group by bulan`;
  console.log(rows);
  process.exit(0);
}
run();
