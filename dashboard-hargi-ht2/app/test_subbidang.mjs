import Papa from 'papaparse';

async function run() {
  const url = "https://docs.google.com/spreadsheets/d/1-eC0GdeMwYDhnGzCSM8viO0HvD6X0NdlMaWOxe2P9ZM/export?format=csv&gid=299154811";
  const res = await fetch(url, { redirect: "follow" });
  const text = await res.text();
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  const rows = parsed.data;
  
  const matches = rows.filter(r => {
    const uraianKey = Object.keys(r).find(k => k.toLowerCase().includes('uraian'));
    return uraianKey && (r[uraianKey] || "").toUpperCase().includes("RELAY INTERNAL TRAFO");
  });
  
  console.log(`Matches: ${matches.length}`);
  if (matches.length > 0) {
    const first = matches[0];
    const subBidangKey = Object.keys(first).find(k => k.toLowerCase().includes('sub') && k.toLowerCase().includes('bidang'));
    console.log(`Sub Bidang of first match: ${subBidangKey ? first[subBidangKey] : 'not found'}`);
  }
}
run();
