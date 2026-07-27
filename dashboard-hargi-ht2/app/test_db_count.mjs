import { sql } from '@vercel/postgres';
import 'dotenv/config';
async function test() {
  const result = await sql`select count(*) from hargi_ht2.abo_2026`;
  console.log('Total DB rows:', result.rows[0].count);
}
test();
