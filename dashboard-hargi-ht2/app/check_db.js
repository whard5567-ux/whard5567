require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');

async function main() {
  if (!process.env.DB_URL) {
    console.error("No DB_URL found");
    return;
  }
  const sql = postgres(process.env.DB_URL, { ssl: 'require' });
  try {
    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'hargi_ht2'`;
    console.log("Tables in hargi_ht2:");
    console.log(tables.map(t => t.table_name).join('\n'));
  } catch (e) {
    console.error(e);
  } finally {
    await sql.end();
  }
}
main();
