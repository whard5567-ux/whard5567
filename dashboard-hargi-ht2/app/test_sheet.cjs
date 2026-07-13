const Papa = require("papaparse");

async function run() {
  const res = await fetch("https://docs.google.com/spreadsheets/d/1-eC0GdeMwYDhnGzCSM8viO0HvD6X0NdlMaWOxe2P9ZM/export?format=csv&gid=299154811");
  const text = await res.text();
  const parsed = Papa.parse(text, { header: false, skipEmptyLines: true });
  const rows = parsed.data;
  
  const matches = rows.filter(r => r.some(c => (c || "").toUpperCase().includes("RELAY INTERNAL TRAFO")));
  console.log("Matches:", matches.length);
  if(matches.length > 0) {
      console.log(matches[0]);
  } else {
    // maybe try "Proteksi"
    const proteksiMatches = rows.filter(r => r.some(c => (c || "").toUpperCase().includes("PROTEKSI")));
    console.log("Unique uraian for proteksi:");
    const uraians = new Set();
    proteksiMatches.forEach(r => uraians.add(r[3])); // Column D
    console.log(Array.from(uraians));
  }
}
run();
