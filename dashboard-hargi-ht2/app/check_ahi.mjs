import postgres from 'postgres';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DB_URL, { ssl: 'require' });

async function run() {
  const res = await sql`select count(*) as total, count(case when trim(ahi_terbaru) = '' or ahi_terbaru is null then 1 end) as empty_ahi, count(case when upt = '#N/A' or upt = '' then 1 end) as empty_upt from hargi_ht2.kondisi_ahi_mtu`;
  console.log(res);
  
  const sample = await sql`select techidentno, upt, ahi_terbaru from hargi_ht2.kondisi_ahi_mtu where trim(ahi_terbaru) = '' limit 5`;
  console.log(sample);

  process.exit(0);
}
run();
