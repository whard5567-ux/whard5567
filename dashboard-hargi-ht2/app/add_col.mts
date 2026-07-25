import { sql } from './src/lib/db';

async function main() {
  await sql`ALTER TABLE hargi_ht2.penggantian_mtu ADD COLUMN IF NOT EXISTS tahun_kr text`;
  console.log('Added tahun_kr column');
  process.exit(0);
}
main().catch(console.error);
