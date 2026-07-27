const Papa = require('papaparse');
async function run() {
  const t = await fetch('https://docs.google.com/spreadsheets/d/11HQFitHH8xISZvVxuG0rd0q84Y6tOtCi7jO7wDbUeVs/export?format=csv&gid=2012059016').then(r=>r.text());
  const parsed = Papa.parse(t, { header: false, skipEmptyLines: true });
  const rows = parsed.data;
  const colB = rows.map((r, i) => `${i+1}. ${r[1] || '<KOSONG>'}`);
  console.log("Total baris data dari parse:", rows.length);
  console.log("Isi Kolom B (termasuk yang kosong):");
  console.log(colB.join('\n'));
}
run();
