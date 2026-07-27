import { sql } from '@vercel/postgres';
import 'dotenv/config';

sql`select status_fix, count(*) from hargi_ht2.abo_2026 group by status_fix`
  .then(console.log)
  .catch(console.error);
