import 'dotenv/config';
import { sql } from './src/lib/db';

async function run() {
  await sql`ALTER TABLE hargi_ht2.penggantian_mtu ADD COLUMN IF NOT EXISTS bay text`;
  console.log('Column bay added');
  process.exit(0);
}
run();
