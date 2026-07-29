import { sql } from '@vercel/postgres';
import 'dotenv/config';

async function test() {
  try {
    const result = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'hargi_ht2'`;
    console.log("Tables in hargi_ht2:");
    console.log(result.rows.map(t => t.table_name).join('\n'));
  } catch (e) {
    console.error(e);
  }
}
test();
