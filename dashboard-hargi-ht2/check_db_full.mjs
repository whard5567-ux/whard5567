import postgres from "./app/node_modules/postgres/src/index.js";
import Papa from "./app/node_modules/papaparse/papaparse.js";

const sql = postgres('postgresql://ht2_diagus.mjgekmjnsipthcswazid:fNgzSz81Rdg~41F-BUsIyybk31waOGpz@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', {
  ssl: 'require'
});

async function run() {
  const dbRows = await sql`
    select * from hargi_ht2.abo_2026 
    where upper(upt) like '%SEMARANG%'
    and upper(jenis_anomali) like '%TS - REVIEW & TINDAKLANJUT LA%'
  `;
  console.log("DB Rows:");
  console.log(dbRows);
  
  await sql.end();
}
run().catch(console.error);
