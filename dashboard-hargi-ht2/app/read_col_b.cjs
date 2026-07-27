const Papa = require('papaparse');
async function run() {
  const t = await fetch('https://docs.google.com/spreadsheets/d/11HQFitHH8xISZvVxuG0rd0q84Y6tOtCi7jO7wDbUeVs/export?format=csv&gid=2012059016').then(r=>r.text());
  const parsed = Papa.parse(t, { header: false, skipEmptyLines: true });
  const rows = parsed.data;
  const colB = rows.map(r => r[1]).filter(x => x !== undefined && x.trim() !== "");
  console.log("Total baris di Kolom B:", colB.length);
  console.log("Isi Kolom B:");
  console.log(colB.join('\n'));
}
run();
