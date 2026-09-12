import postgres from 'postgres';
async function run() {
  const sql = postgres(process.env.DB_URL);
  const sample = await sql`SELECT raw FROM hargi_ht2.kondisi_ahi_mtu LIMIT 1`;
  console.log(sample[0].raw);
  process.exit(0);
}
run();
