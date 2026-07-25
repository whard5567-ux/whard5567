import fs from 'fs';
import postgres from 'postgres';

async function run() {
  try {
    const env = fs.readFileSync('.env.local', 'utf-8');
    const dbUrlLine = env.split('\n').find(l => l.startsWith('DB_URL='));
    const dbUrl = dbUrlLine.split('=')[1].trim().replace(/^"|"$/g, '');

    const sql = postgres(dbUrl, { prepare: false });

    const rows = await sql`select * from hargi_ht2.penggantian_mtu limit 5`;
    console.log(rows);
    process.exit(0);
  } catch (err) {
    console.error("Failed:", err);
    process.exit(1);
  }
}

run();
