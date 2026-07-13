import postgres from "postgres";

const base = postgres('postgresql://ht2_diagus.mjgekmjnsipthcswazid:fNgzSz81Rdg~41F-BUsIyybk31waOGpz@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', {
  ssl: "require",
  max: 1,
  prepare: false
});

base`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'hargi_ht2' AND table_name = 'refresh_log'`.then(console.log).catch(console.error).finally(()=>process.exit(0));
