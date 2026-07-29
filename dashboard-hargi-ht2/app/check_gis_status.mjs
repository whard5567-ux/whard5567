import fs from 'fs';
import Papa from 'papaparse';

async function run() {
  const r = await fetch('https://docs.google.com/spreadsheets/d/1-eC0GdeMwYDhnGzCSM8viO0HvD6X0NdlMaWOxe2P9ZM/export?format=csv&gid=299154811');
  const t = await r.text();
  const parsed = Papa.parse(t, { skipEmptyLines: true, header: true });
  
  const gisRows = parsed.data.filter(row => (row['LEVEL ANOMALI'] || "").toUpperCase() === "GIS");
  const statuses = new Set();
  gisRows.forEach(row => statuses.add(row['STATUS TERKINI']));
  console.log("Status Terkini for GIS:", Array.from(statuses));
}
run();
