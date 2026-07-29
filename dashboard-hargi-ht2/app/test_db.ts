import { sql } from './src/lib/db';

async function main() {
  const res = await sql`
    SELECT upper(trim(status_terkini)) as status, count(*) 
    FROM hargi_ht2.ce_abo_findings 
    WHERE upper(trim(sub_bidang)) = 'HARGI' 
      AND upper(trim(coalesce(upt, ''))) not in ('N/A', '#N/A') 
    GROUP BY 1
  `;
  console.log(res);
  process.exit(0);
}
main();
