const postgres = require("postgres");

async function run() {
  const sql = postgres(process.env.DB_URL, { ssl: "require" });
  try {
    const res = await sql`SELECT pid, state, query FROM pg_stat_activity`;
    console.log('All connections:', res);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
