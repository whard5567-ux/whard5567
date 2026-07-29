import fs from 'fs';
import Papa from 'papaparse';

async function run() {
  const r = await fetch('https://docs.google.com/spreadsheets/d/1MquufLxJD59lXOpjU2pF06aw1IhlPpVBBZ1OQXAHm7M/export?format=csv&gid=0');
  const t = await r.text();
  const parsed = Papa.parse(t, { skipEmptyLines: true });
  const rows = parsed.data.slice(1);
  let empty = {
    techidentno: 0,
    mtu: 0,
    upt: 0,
    gardu_induk: 0,
    bay: 0,
    merk: 0,
    kategori_usia: 0,
    parameter_pemicu: 0,
    rtl: 0,
    ahi_terbaru: 0
  };
  
  for (const row of rows) {
    if (!row[0] || !row[0].trim()) empty.techidentno++;
    if (!row[1] || !row[1].trim()) empty.mtu++;
    if (!row[3] || !row[3].trim()) empty.upt++;
    if (!row[4] || !row[4].trim()) empty.gardu_induk++;
    if (!row[5] || !row[5].trim()) empty.bay++;
    if (!row[8] || !row[8].trim()) empty.merk++;
    if (!row[22] || !row[22].trim()) empty.kategori_usia++;
    if (!row[15] || !row[15].trim()) empty.parameter_pemicu++;
    if (!row[16] || !row[16].trim()) empty.rtl++;
    if (!row[23] || !row[23].trim()) empty.ahi_terbaru++;
  }
  console.log(`Total data rows: ${rows.length}`);
  console.log('Empty counts:', empty);
}
run();
