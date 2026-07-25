import fs from 'fs';
import postgres from 'postgres';

async function run() {
  const env = fs.readFileSync('.env.local', 'utf-8');
  const dbUrl = env.split('\n').find(l => l.startsWith('DB_URL=')).split('=')[1].trim().replace(/^"|"$/g, '');
  const sql = postgres(dbUrl, { prepare: false });

  const r = await sql`select kolom_aq, count(*) from hargi_ht2.penggantian_mtu group by kolom_aq order by count(*) desc limit 20`;
  console.log(r);
  process.exit(0);
}
run();
