import fs from 'fs';
import Papa from 'papaparse';

async function run() {
  const r = await fetch('https://docs.google.com/spreadsheets/d/1-eC0GdeMwYDhnGzCSM8viO0HvD6X0NdlMaWOxe2P9ZM/export?format=csv&gid=299154811');
  const t = await r.text();
  const parsed = Papa.parse(t, { skipEmptyLines: true, header: true });
  const rows = parsed.data;
  const gisRows = rows.filter(row => {
    for (const val of Object.values(row)) {
      if ((val || "").toUpperCase().includes("GIS")) return true;
    }
    return false;
  });
  console.log(`Found ${gisRows.length} rows with GIS`);
  if (gisRows.length > 0) {
    console.log(gisRows.slice(0, 3).map(r => ({
      SUB_BIDANG: r['SUB BIDANG'],
      LEVEL_ANOMALI: r['LEVEL ANOMALI']
    })));
  }
}
run();
