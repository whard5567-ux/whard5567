import { sql } from './lib/db.ts';
import 'dotenv/config';

async function t() {
  try {
    const res = await sql`select status_fix, count(*) from hargi_ht2.abo_2026 group by status_fix`;
    console.log(res);
  } catch (e) { console.log(e); }
  process.exit();
}
t();
