import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
  const sql = postgres(process.env.DB_URL);
  const res = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'kondisi_ahi_mtu'`;
  console.log(res.map(r => r.column_name));
  
  const res2 = await sql`SELECT gardu_induk, koordinat, latitude, altitude FROM hargi_ht2.kondisi_ahi_mtu WHERE koordinat IS NOT NULL LIMIT 5`;
  console.log(res2);
  process.exit(0);
}
check();
