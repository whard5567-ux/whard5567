import postgres from "postgres";

const sql = postgres('postgresql://ht2_diagus.mjgekmjnsipthcswazid:fNgzSz81Rdg~41F-BUsIyybk31waOGpz@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', {
  ssl: "require",
  max: 1,
  prepare: false
});

async function test() {
  try {
    await sql`select NULL at time zone 'Asia/Jakarta'`;
    console.log("NULL test passed");
  } catch(e) {
    console.error("NULL test failed:", e.message);
  }

  try {
    await sql`select sheet_modified_ce at time zone 'Asia/Jakarta' from hargi_ht2.refresh_log limit 1`;
    console.log("table test passed");
  } catch(e) {
    console.error("table test failed:", e.message);
  }

  try {
    await sql`select extract(year from now() at time zone 'Asia/Jakarta')::int::text`;
    console.log("extract test passed");
  } catch(e) {
    console.error("extract test failed:", e.message);
  }
}
test().then(()=>process.exit(0));
