import fs from 'fs';
import postgres from 'postgres';

async function run() {
  const env = fs.readFileSync('.env.local', 'utf-8');
  const dbUrl = env.split('\n').find(l => l.startsWith('DB_URL=')).split('=')[1].trim().replace(/^"|"$/g, '');
  const sql = postgres(dbUrl, { prepare: false });

  await sql`ALTER TABLE hargi_ht2.penggantian_mtu ADD COLUMN IF NOT EXISTS bay text;`;
  console.log("Column bay added.");
  process.exit(0);
}
run();
