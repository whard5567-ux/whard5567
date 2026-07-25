import { sql } from './src/lib/db.ts';
async function test() {
  const r = await sql`select * from hargi_ht2.penggantian_mtu limit 1`;
  console.log(Object.keys(r[0] || {}));
  process.exit(0);
}
test();
