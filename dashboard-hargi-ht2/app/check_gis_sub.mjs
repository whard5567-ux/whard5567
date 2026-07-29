import fs from 'fs';
import Papa from 'papaparse';

async function run() {
  const r = await fetch('https://docs.google.com/spreadsheets/d/1-eC0GdeMwYDhnGzCSM8viO0HvD6X0NdlMaWOxe2P9ZM/export?format=csv&gid=299154811');
  const t = await r.text();
  const parsed = Papa.parse(t, { skipEmptyLines: true });
  const headers = parsed.data[0].map(h => h.trim().toUpperCase());
  const subIdx = headers.findIndex(h => h.includes('SUB BIDANG'));
  const levelIdx = headers.findIndex(h => h.includes('LEVEL ANOMALI'));
  
  const gisRows = parsed.data.slice(1).filter(row => (row[levelIdx] || "").toUpperCase() === "GIS");
  console.log(`Found ${gisRows.length} rows with Level Anomali = GIS`);
  
  const subBidangs = new Set();
  gisRows.forEach(row => subBidangs.add(row[subIdx]));
  console.log("Sub Bidangs for GIS:", Array.from(subBidangs));
}
run();
