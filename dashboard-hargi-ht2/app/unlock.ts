import { sql } from './src/lib/db';

async function run() {
  try {
    const res = await sql`SELECT pg_cancel_backend(pid) FROM pg_stat_activity WHERE state = 'active' AND pid <> pg_backend_pid()`;
    console.log('Unlocked:', res);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
