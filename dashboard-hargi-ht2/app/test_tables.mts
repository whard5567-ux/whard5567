import { sql } from './src/lib/db';

async function run() {
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'hargi_ht2'
  `;
  console.log(tables);
  process.exit(0);
}

run().catch(console.error);
