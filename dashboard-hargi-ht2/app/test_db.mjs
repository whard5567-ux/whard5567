import postgres from 'postgres';

async function test() {
  const base = postgres(process.env.DB_URL, { max: 1, family: 4 });
  const start = Date.now();
  try {
    const selUnits = [];
    console.log("Executing massive query...");
    const row = await base`
    select
      (select jsonb_build_object(
         'total', count(*)::int,
         'closed', count(*) filter (where kondisi_akhir like '%1-%' or kondisi_akhir like '%2-%')::int,
         'open', count(*) filter (where kondisi_akhir like '%3-%' or kondisi_akhir like '%4-%' or kondisi_akhir like '%5-%')::int)
       from hargi_ht2.ce_abo_findings
       where (upt = any(${selUnits}) or ${selUnits.length === 0})) as ce
       -- Testing just one part first to see if it's the query execution
    `;
    console.log("Success in", Date.now() - start, "ms");
  } catch (err) {
    console.error("Error caught:", err);
  } finally {
    process.exit(0);
  }
}

test();
