import fs from 'fs';
import postgres from 'postgres';

async function run() {
  const env = fs.readFileSync('.env.local', 'utf-8');
  const dbUrl = env.split('\n').find(l => l.startsWith('DB_URL=')).split('=')[1].trim().replace(/^"|"$/g, '');
  const sql = postgres(dbUrl, { prepare: false });

  const rows = await sql`select distinct upt from hargi_ht2.penggantian_mtu`;
  console.log("Total MTU rows:", (await sql`select count(*) from hargi_ht2.penggantian_mtu`)[0].count);
  console.log("Distinct UPTs:", rows.map(r => r.upt));
  process.exit(0);
}
run();
