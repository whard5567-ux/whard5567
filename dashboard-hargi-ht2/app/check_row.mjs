import fs from 'fs';
import Papa from 'papaparse';

async function run() {
  const r = await fetch('https://docs.google.com/spreadsheets/d/1MquufLxJD59lXOpjU2pF06aw1IhlPpVBBZ1OQXAHm7M/export?format=csv&gid=0');
  const t = await r.text();
  const parsed = Papa.parse(t, { skipEmptyLines: true });
  const row = parsed.data[1]; // First data row
  console.log(row.map((c, i) => `${i}: ${c}`).join(' | '));
}
run();
