import fs from 'fs';
import postgres from 'postgres';

async function run() {
  try {
    const env = fs.readFileSync('.env.local', 'utf-8');
    const dbUrlLine = env.split('\n').find(l => l.startsWith('DB_URL='));
    if (!dbUrlLine) throw new Error("DB_URL not found");
    const dbUrl = dbUrlLine.split('=')[1].trim().replace(/^"|"$/g, '');

    const sql = postgres(dbUrl, { prepare: false });

    console.log("Altering hargi_ht2.refresh_log...");
    await sql`ALTER TABLE hargi_ht2.refresh_log ADD COLUMN IF NOT EXISTS sheet_name_mtu varchar;`;
    await sql`ALTER TABLE hargi_ht2.refresh_log ADD COLUMN IF NOT EXISTS sheet_modified_mtu varchar;`;
    console.log("Table altered successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Alter failed:", err);
    process.exit(1);
  }
}

run();
