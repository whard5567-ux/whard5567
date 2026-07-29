import fs from 'fs';
import postgres from 'postgres';

async function main() {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  const match = envFile.match(/DB_URL="(.*)"/);
  const dbUrl = match ? match[1] : envFile.match(/DB_URL=(.*)/)[1];
  
  const sql = postgres(dbUrl, { ssl: 'require' });
  try {
    const result = await sql`SELECT count(*) FROM hargi_ht2.kondisi_ahi_mtu`;
    console.log("kondisi_ahi_mtu count:", result[0].count);
  } catch (e) {
    console.error(e);
  } finally {
    await sql.end();
  }
}
main();
