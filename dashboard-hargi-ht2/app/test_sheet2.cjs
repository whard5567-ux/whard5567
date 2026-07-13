const Papa = require("papaparse");

async function run() {
  const res = await fetch("https://docs.google.com/spreadsheets/d/1-eC0GdeMwYDhnGzCSM8viO0HvD6X0NdlMaWOxe2P9ZM/export?format=csv&gid=299154811");
  const text = await res.text();
  const parsed = Papa.parse(text, { header: false, skipEmptyLines: true });
  const rows = parsed.data;
  
  const matches = rows.filter(r => (r[3] || "").toUpperCase().includes("RELAY INTERNAL TRAFO"));
  const openClose = matches.filter(r => ["OPEN", "CLOSE"].includes((r[19] || "").trim().toUpperCase()));
  console.log("Total Relay Internal Trafo:", matches.length);
  console.log("Open/Close:", openClose.length);
}
run();
