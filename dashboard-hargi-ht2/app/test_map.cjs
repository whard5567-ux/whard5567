const Papa = require('papaparse');
async function test() {
  const t = await fetch('https://docs.google.com/spreadsheets/d/11HQFitHH8xISZvVxuG0rd0q84Y6tOtCi7jO7wDbUeVs/export?format=csv&gid=1761063736').then(r=>r.text());
  const parsed = Papa.parse(t, { header: true, skipEmptyLines: true });
  const rows = parsed.data;
  const headers = Object.keys(rows[0]);
  const findCol = (headers, ...terms) => headers.find(h => {
    const l = h.toLowerCase();
    return terms.every(t => l.includes(t.toLowerCase()));
  });
  const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();
  
  const col = {
    no: findCol(headers, "no"),
    upt: headers.find((h) => h.toLowerCase() === "upt") ?? findCol(headers, "upt"),
    ultg: headers.find((h) => h.toUpperCase() === "X") ?? findCol(headers, "x"),
    gardu_induk: findCol(headers, "gardu", "induk"),
    jadwal_rencana: findCol(headers, "jadwal", "rencana"),
    realisasi: findCol(headers, "realisasi"),
    status: findCol(headers, "status"),
    jenis_anomali: findCol(headers, "jenis", "anomali"),
    status_fix: findCol(headers, "status", "fix"),
  };

  const filtered = rows.filter((r) => clean(r[col.upt]) !== "" || clean(r[col.gardu_induk]) !== "");
  console.log("Filtered Length:", filtered.length);
  const open = filtered.filter(r => clean(r[col.status_fix]).toUpperCase() !== "CLOSE");
  console.log("Open Length:", open.length);
  const close = filtered.filter(r => clean(r[col.status_fix]).toUpperCase() === "CLOSE");
  console.log("Close Length:", close.length);
}
test();
